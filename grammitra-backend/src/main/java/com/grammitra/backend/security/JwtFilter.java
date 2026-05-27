package com.grammitra.backend.security;

import com.grammitra.backend.controller.AuthController;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // ALWAYS skip CORS preflight
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // /auth/** is mostly anonymous (send-otp, verify-otp, forgot-id,
        // logout — none of those need an authenticated principal). But
        // /auth/me explicitly reads the principal off the SecurityContext
        // to return "who am I" — so the filter MUST run for that path,
        // otherwise Authentication is always null and the endpoint
        // returns 401 to logged-in users who actually have a valid cookie.
        if (path.startsWith("/auth") && !path.equals("/auth/me")) {
            return true;
        }

        // Public worker reads: skip the JWT filter entirely so an expired
        // or malformed token can never poison anonymous discovery requests.
        // /worker/me still goes through (handled below) because it needs
        // the authenticated principal.
        if ("GET".equalsIgnoreCase(method)
                && path.startsWith("/worker/")
                && !path.equals("/worker/me")) {
            return true;
        }

        // Public review reads — same reasoning. POST /review still hits
        // the filter so the user is identified for createReview().
        if ("GET".equalsIgnoreCase(method)
                && path.startsWith("/review/")) {
            return true;
        }

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // Prefer the httpOnly cookie set by /auth/verify-otp. Falls back
            // to the Authorization header so anything calling the API with
            // an explicit Bearer (e.g. curl, integration tests) keeps working.
            String token = extractToken(request);

            if (token == null) {
                filterChain.doFilter(request, response);
                return;
            }

            if (jwtUtil.validateToken(token)) {

                String loginId = jwtUtil.extractLoginId(token);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                loginId,
                                null,
                                Collections.emptyList()
                        );

                SecurityContextHolder.getContext().setAuthentication(authentication);

            } else {
                log.debug("Invalid JWT for {} {} — clearing context", request.getMethod(), request.getRequestURI());
                SecurityContextHolder.clearContext();
            }

        } catch (Exception e) {
            log.debug("JWT processing error for {} {}: {}", request.getMethod(), request.getRequestURI(), e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /** Token lookup order: gm_token cookie → Authorization header → null. */
    private String extractToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if (AuthController.AUTH_COOKIE.equals(c.getName())
                        && c.getValue() != null
                        && !c.getValue().isBlank()) {
                    return c.getValue().trim();
                }
            }
        }
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String t = header.substring(7).trim();
            return t.isBlank() ? null : t;
        }
        return null;
    }
}
