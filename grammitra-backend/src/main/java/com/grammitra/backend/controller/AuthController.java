package com.grammitra.backend.controller;

import com.grammitra.backend.model.User;
import com.grammitra.backend.repository.UserRepository;
import com.grammitra.backend.service.AuthService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService,
                          UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    // 🔥 UPDATED: Added loginId + mode
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(
            @RequestParam String phone,
            @RequestParam(required = false) String loginId,
            @RequestParam(required = false) String mode
    ) {
        // ✅ FIXED HERE
        return ResponseEntity.ok(authService.sendOtp(phone, loginId, mode));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                authService.verifyOtp(
                        body.get("phone"),
                        body.get("otp"),
                        body.get("name"),
                        body.get("role"),
                        body.get("loginId")
                )
        );
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

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String header) {

        if (header == null || !header.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = header.substring(7);
        String loginId = authService.getLoginIdFromToken(token);

        return ResponseEntity.ok(
                userRepository.findByLoginId(loginId)
                        .orElseThrow(() -> new RuntimeException("User not found"))
        );
    }
}