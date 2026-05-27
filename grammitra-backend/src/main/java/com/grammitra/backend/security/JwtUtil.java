package com.grammitra.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Arrays;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    /** Fingerprint that marks the secret baked into application.properties. */
    private static final String DEV_DEFAULT_PREFIX = "local-dev-only-";

    @Value("${jwt.secret:}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private long expiration;

    private final Environment environment;

    private Key key;

    public JwtUtil(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void init() {

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET is not configured. "
                            + "Set the JWT_SECRET env var (`openssl rand -base64 48`) "
                            + "or put jwt.secret in application-local.properties.");
        }

        boolean isDevDefault = secret.startsWith(DEV_DEFAULT_PREFIX);
        boolean isProdProfile = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("prod")
                        || p.equalsIgnoreCase("production"));

        // The dev default is fine for `mvn spring-boot:run` but must NEVER be
        // used in prod — refusing to boot if profile=prod prevents a silently
        // misconfigured deploy from signing real tokens with a known string.
        if (isDevDefault && isProdProfile) {
            throw new IllegalStateException(
                    "JWT_SECRET is using the local-dev default but the active "
                            + "Spring profile is 'prod'. Set the JWT_SECRET env "
                            + "var to a real 256-bit random value (`openssl rand -base64 48`).");
        }

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least 32 bytes (256 bits). "
                            + "Current length: " + keyBytes.length
                            + " bytes. Generate one with: openssl rand -base64 48");
        }

        this.key = Keys.hmacShaKeyFor(keyBytes);

        if (isDevDefault) {
            log.warn("⚠️  JWT is signed with the LOCAL-DEV-ONLY default secret. "
                    + "Override JWT_SECRET (env var) or jwt.secret (application-local.properties) "
                    + "before deploying anywhere others can reach.");
        }
    }

    // ✅ Generate token
    public String generateToken(String loginId) {
        return Jwts.builder()
                .setSubject(loginId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Extract loginId
    public String extractLoginId(String token) {
        return extractAllClaims(token).getSubject();
    }

    // ✅ Extract claims
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ Validate token
    public boolean validateToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}