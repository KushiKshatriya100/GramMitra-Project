package com.grammitra.backend.config;

import com.grammitra.backend.security.JwtFilter;
import com.grammitra.backend.security.OtpSendRateLimitFilter;

import jakarta.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Autowired
    private JwtFilter jwtFilter;

    /**
     * Optional — the rate-limit filter is gated by
     * {@code app.ratelimit.enabled=true} and the presence of a Bucket4j
     * ProxyManager bean. In local dev (no Redis) the bean is absent and
     * ObjectProvider lets us skip wiring it without failing context init.
     */
    @Autowired
    private ObjectProvider<OtpSendRateLimitFilter> otpSendRateLimitFilterProvider;

    @Value("${app.cors.allowed-origins:http://localhost:[*],http://127.0.0.1:[*],https://*.vercel.app,https://*.ngrok-free.app,https://*.ngrok.io}")
    private String allowedOriginsCsv;

    @PostConstruct
    public void announceSecurityLayout() {
        log.info("=========================================================");
        log.info("🔐 GRAMMITRA SECURITY CONFIG LOADED  (rev: 2026-05-15)");
        log.info("=========================================================");
        log.info("🔓 PUBLIC routes (no auth, no JWT filter):");
        log.info("    OPTIONS  /**                       (CORS preflight)");
        log.info("    GET      /actuator/health          (AWS health check)");
        log.info("    *        /auth/**                  (login / register)");
        log.info("    GET      /worker/**                (except /worker/me)");
        log.info("    GET      /review/**                (review reads)");
        log.info("🔒 AUTHENTICATED:");
        log.info("    GET      /worker/me");
        log.info("    POST     /worker/create-or-update");
        log.info("    POST     /review                   (create review)");
        log.info("    everything else");
        log.info("=========================================================");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth ->
                        auth
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()

                                .requestMatchers("/auth/**").permitAll()

                                .requestMatchers(HttpMethod.GET, "/worker/me").authenticated()
                                .requestMatchers(HttpMethod.POST, "/worker/create-or-update").authenticated()

                                .requestMatchers(HttpMethod.GET, "/worker/**").permitAll()

                                .requestMatchers(HttpMethod.GET, "/review/**").permitAll()

                                .anyRequest().authenticated()
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
                        )
                )

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        // Rate limit runs BEFORE JwtFilter so a flood of /auth/send-otp
        // never even touches the OTP store / SMS provider. Absent when
        // app.ratelimit.enabled is false (no Redis required for boot).
        OtpSendRateLimitFilter rl = otpSendRateLimitFilterProvider.getIfAvailable();
        if (rl != null) {
            http.addFilterBefore(rl, UsernamePasswordAuthenticationFilter.class);
            log.info("🚦 OTP send-rate filter attached to Spring Security chain.");
        } else {
            log.warn("⚠️ OTP send-rate filter NOT attached (app.ratelimit.enabled=false). "
                    + "Safe for local dev. In production set APP_RATELIMIT_ENABLED=true.");
        }

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Disable Spring Boot's auto-registration of OtpSendRateLimitFilter
     * as a top-level servlet filter — it's already wired into the Spring
     * Security chain via addFilterBefore(). Without this, the filter
     * would run twice per request.
     *
     * Gated on the same conditions as the filter itself (property +
     * ProxyManager bean) so the graph stays consistent when rate-limit
     * is disabled.
     */
    @Bean
    @ConditionalOnProperty(name = "app.ratelimit.enabled", havingValue = "true", matchIfMissing = false)
    @ConditionalOnBean(OtpSendRateLimitFilter.class)
    public FilterRegistrationBean<OtpSendRateLimitFilter>
            disableOtpSendRateLimitFilterAutoReg(OtpSendRateLimitFilter filter) {
        FilterRegistrationBean<OtpSendRateLimitFilter> reg =
                new FilterRegistrationBean<>(filter);
        reg.setEnabled(false);
        return reg;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> patterns = Arrays.stream(allowedOriginsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .filter(s -> !"*".equals(s))
                .collect(Collectors.toList());

        if (patterns.isEmpty()) {
            throw new IllegalStateException(
                    "app.cors.allowed-origins is empty. Refusing to start a "
                            + "credentialed CORS config with no allow-list.");
        }

        log.info("🌐 CORS allowed origin patterns: {}", patterns);
        configuration.setAllowedOriginPatterns(patterns);

        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
