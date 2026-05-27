package com.grammitra.backend.controller;

import com.grammitra.backend.model.User;
import com.grammitra.backend.repository.UserRepository;
import com.grammitra.backend.service.AuthService;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    /** Name of the httpOnly cookie that carries the JWT. */
    public static final String AUTH_COOKIE = "gm_token";

    private final AuthService authService;
    private final UserRepository userRepository;

    /** Match the JWT TTL exactly so the cookie expires when the token does. */
    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    /**
     * Whether to set the cookie's Secure flag. False in dev (http://localhost)
     * because browsers reject Secure cookies over plain http. Must be true
     * in production (HTTPS).
     */
    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(
            @RequestParam String phone,
            @RequestParam(required = false) String loginId,
            @RequestParam(required = false) String mode
    ) {
        return ResponseEntity.ok(authService.sendOtp(phone, loginId, mode));
    }

    /**
     * Verifies the OTP. On success, the JWT is set as an httpOnly cookie
     * (so JavaScript / a future XSS payload can't read it) and the response
     * body returns ONLY the user payload — no raw token. The frontend keeps
     * the user blob in localStorage purely for UI decisions like
     * "show the dashboard link"; the actual credential lives in the cookie.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody Map<String, String> body,
            HttpServletResponse response
    ) {
        Map<String, Object> result = authService.verifyOtp(
                body.get("phone"),
                body.get("otp"),
                body.get("name"),
                body.get("role"),
                body.get("loginId")
        );

        Object token = result.get("token");
        if (token instanceof String tokenStr) {
            response.addHeader(HttpHeaders.SET_COOKIE, buildAuthCookie(tokenStr).toString());
        }

        // Strip the token from the body so JS can never read it. The frontend
        // gets the user blob + an explicit `exp` (unix seconds) so it can
        // proactively bounce the user to login before the cookie expires —
        // saves a round-trip 401 every time the session times out.
        Map<String, Object> safeBody = new HashMap<>(result);
        safeBody.remove("token");
        safeBody.put("exp", (System.currentTimeMillis() + jwtExpirationMs) / 1000L);

        return ResponseEntity.ok(safeBody);
    }

    @PostMapping("/verify-otp-forgot")
    public ResponseEntity<?> verifyOtpForgot(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                authService.verifyOtpForgot(
                        body.get("phone"),
                        body.get("otp")
                )
        );
    }

    @PostMapping("/forgot-id")
    public ResponseEntity<?> forgotLoginId(@RequestParam String phone) {
        return ResponseEntity.ok(authService.forgotLoginId(phone));
    }

    /**
     * Clears the auth cookie. The browser receives a Set-Cookie with
     * Max-Age=0, which immediately deletes the cookie. Frontend should
     * also drop the user blob from localStorage on its side.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cleared = ResponseCookie.from(AUTH_COOKIE, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cleared.toString());
        return ResponseEntity.ok().build();
    }

    /**
     * Returns the current user. Replaces the old Authorization-header
     * variant — the JwtFilter already populated the security context from
     * the cookie, so we just read the loginId from there.
     */
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
                userRepository.findByLoginId(auth.getName())
                        .orElseThrow(() -> new RuntimeException("User not found"))
        );
    }

    private ResponseCookie buildAuthCookie(String token) {
        // SameSite=Strict: the cookie is never sent on cross-site requests
        // (including top-level GETs from an external link). Combined with
        // httpOnly+Secure this removes the CSRF surface entirely and
        // prevents the cookie from being smuggled by a third-party origin.
        // Acceptable here because the frontend is same-site with the API
        // in dev (localhost) and via the same eTLD+1 in production.
        return ResponseCookie.from(AUTH_COOKIE, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(Duration.ofMillis(jwtExpirationMs))
                .build();
    }
}
