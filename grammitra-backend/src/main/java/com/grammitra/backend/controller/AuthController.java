package com.grammitra.backend.controller;

import com.grammitra.backend.model.User;
import com.grammitra.backend.repository.UserRepository;
import com.grammitra.backend.service.AuthService;
import org.springframework.web.bind.annotation.*;

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

    // ✅ SEND OTP
    @PostMapping("/send-otp")
    public Map<String, Object> sendOtp(@RequestParam String phone) {
        return authService.sendOtp(phone);
    }

    // ✅ VERIFY OTP (LOGIN + REGISTER)
    @PostMapping("/verify-otp")
    public Map<String, Object> verifyOtp(@RequestBody Map<String, String> body) {

        String phone = body.get("phone");
        String otp = body.get("otp");

        String name = body.getOrDefault("name", null);
        String role = body.getOrDefault("role", null);
        String loginId = body.getOrDefault("loginId", null);

        return authService.verifyOtp(phone, otp, name, role, loginId);
    }

    // ✅ VERIFY OTP (FORGOT FLOW)
    @PostMapping("/verify-otp-forgot")
    public Map<String, Object> verifyOtpForgot(@RequestBody Map<String, String> body) {

        String phone = body.get("phone");
        String otp = body.get("otp");

        return authService.verifyOtpForgot(phone, otp);
    }

    // 🔥🔥🔥 THIS WAS MISSING (MAIN FIX)
    @PostMapping("/forgot-id")
    public Map<String, Object> forgotLoginId(@RequestParam String phone) {

        return authService.forgotLoginId(phone);
    }

    // ✅ GET CURRENT USER
    @GetMapping("/me")
    public User getCurrentUser(@RequestHeader("Authorization") String header) {

        String token = header.substring(7);
        String phone = authService.getPhoneFromToken(token);

        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}