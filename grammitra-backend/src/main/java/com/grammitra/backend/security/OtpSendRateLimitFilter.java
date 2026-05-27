package com.grammitra.backend.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.ConsumptionProbe;
import io.github.bucket4j.distributed.BucketProxy;
import io.github.bucket4j.distributed.proxy.ProxyManager;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

/**
 * Per-IP rate limiter on {@code POST /auth/send-otp}.
 *
 * Loads only when {@code app.ratelimit.enabled=true} AND a
 * {@link ProxyManager} bean is present (i.e. RateLimitConfig also
 * loaded successfully). With the property absent or false, the filter
 * never enters the bean graph — boot succeeds with no Redis and the
 * /auth/send-otp endpoint is reachable without rate limiting.
 *
 * Defaults (overridable via env / properties): 5 sends per minute per IP.
 * Exceeded → HTTP 429 + Retry-After header (seconds until next token).
 */
@Component
@ConditionalOnProperty(name = "app.ratelimit.enabled", havingValue = "true", matchIfMissing = false)
@ConditionalOnBean(ProxyManager.class)
public class OtpSendRateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(OtpSendRateLimitFilter.class);

    private static final String SEND_OTP_PATH = "/auth/send-otp";
    private static final String KEY_PREFIX = "rl:otp_send:";

    private final ProxyManager<String> proxyManager;
    private final BucketConfiguration bucketConfig;

    public OtpSendRateLimitFilter(
            ProxyManager<String> proxyManager,
            @Value("${otp.send.ip.capacity:5}") long capacity,
            @Value("${otp.send.ip.window:PT1M}") Duration window) {
        this.proxyManager = proxyManager;
        this.bucketConfig = BucketConfiguration.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(capacity)
                        .refillIntervally(capacity, window)
                        .build())
                .build();
        log.info("🚦 OtpSendRateLimitFilter ACTIVE — {} sends per {} per IP",
                capacity, window);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !("POST".equalsIgnoreCase(request.getMethod())
                && SEND_OTP_PATH.equals(request.getRequestURI()));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String ip = resolveClientIp(request);
        String key = KEY_PREFIX + ip;

        BucketProxy bucket = proxyManager.builder().build(key, () -> bucketConfig);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            response.setHeader("X-RateLimit-Remaining",
                    String.valueOf(probe.getRemainingTokens()));
            chain.doFilter(request, response);
            return;
        }

        long retryAfterSeconds = Math.max(1L,
                probe.getNanosToWaitForRefill() / 1_000_000_000L);

        log.warn("🚦 send-otp rate-limit hit for ip=[{}] retryAfter={}s",
                ip, retryAfterSeconds);

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"error\":\"Too many OTP requests. Please try again in "
                        + retryAfterSeconds + "s.\"}");
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            return (comma > 0 ? xff.substring(0, comma) : xff).trim();
        }
        return request.getRemoteAddr();
    }
}
