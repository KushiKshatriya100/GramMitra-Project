package com.grammitra.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // ✅ Default fallback (prevents crash)
    @Value("${jwt.secret:default-secret-key-grammitra-1234567890}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private long expiration;

    private Key key;

    @PostConstruct
    public void init() {

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);

        // 🔥 Ensure minimum length
        if (keyBytes.length < 32) {
            String paddedSecret = String.format("%-32s", secret).replace(' ', '0');
            keyBytes = paddedSecret.getBytes(StandardCharsets.UTF_8);
        }

        this.key = Keys.hmacShaKeyFor(keyBytes);
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