package com.grammitra.backend.service;

import com.grammitra.backend.model.User;
import com.grammitra.backend.model.Worker;
import com.grammitra.backend.repository.UserRepository;
import com.grammitra.backend.repository.WorkerRepository;
import com.grammitra.backend.security.JwtUtil;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WorkerRepository workerRepository;
    private final JwtUtil jwtUtil;
    private final SmsService smsService;

    public AuthService(UserRepository userRepository,
                       WorkerRepository workerRepository,
                       JwtUtil jwtUtil,
                       SmsService smsService) {
        this.userRepository = userRepository;
        this.workerRepository = workerRepository;
        this.jwtUtil = jwtUtil;
        this.smsService = smsService;
    }

    // ================= OTP STORAGE =================
    private static class OtpData {
        String otp;
        long expiryTime;

        OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    // ================= UTIL =================

    private String generateOtp() {
        return String.valueOf(new Random().nextInt(900000) + 100000);
    }

    private String generateLoginId() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();

        String id;
        do {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 6; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            id = sb.toString();
        } while (userRepository.existsByLoginId(id));

        return id;
    }

    // ================= SEND OTP =================

    // ================= SEND OTP =================

    public Map<String, Object> sendOtp(String phone, String loginId, String mode) {

        User user = userRepository.findByPhone(phone).orElse(null);

        // 🔥 LOGIN FLOW
        if ("login".equalsIgnoreCase(mode)) {

            if (user == null) {
                throw new RuntimeException("User not found");
            }

            if (loginId == null || !user.getLoginId().equals(loginId)) {
                throw new RuntimeException("Invalid login ID");
            }
        }

        // 🔥 REGISTER FLOW
        if ("register".equalsIgnoreCase(mode)) {
            if (user != null) {
                throw new RuntimeException("User already exists");
            }
        }

        boolean userExists = (user != null);

        String otp = generateOtp();
        long expiry = System.currentTimeMillis() + (5 * 60 * 1000);

        otpStorage.put(phone, new OtpData(otp, expiry));

        // ✅ FORMAT PHONE NUMBER
        String formattedPhone = phone.startsWith("+") ? phone : "+91" + phone;

        try {
            smsService.sendOtp(formattedPhone, otp);
            System.out.println("✅ OTP sent to: " + formattedPhone);

        } catch (Exception e) {

            System.out.println("❌ Twilio Error: " + e.getMessage());

            System.out.println("==================================");
            System.out.println("OTP for " + formattedPhone + " is: " + otp);
            System.out.println("==================================");
        }

        return Map.of(
                "message", "OTP sent successfully",
                "userExists", userExists
        );
    }

    // ================= VERIFY OTP =================

    public Map<String, Object> verifyOtp(String phone,
                                         String otp,
                                         String name,
                                         String role,
                                         String loginId) {

        validateOtp(phone, otp);

        User user = userRepository.findByPhone(phone).orElse(null);

        if (user == null) {

            if (name == null || role == null) {
                throw new RuntimeException("Name and role required");
            }

            String generatedLoginId = generateLoginId();

            user = new User();
            user.setPhone(phone);
            user.setName(name);
            user.setRole(role);
            user.setLoginId(generatedLoginId);

            userRepository.save(user);

            if ("WORKER".equalsIgnoreCase(role)) {
                Worker worker = new Worker();
                worker.setUserId(generatedLoginId);
                worker.setSkills(new ArrayList<>());
                worker.setWage(0.0);
                worker.setAvailability(false);
                worker.setProfileCompleted(false);

                workerRepository.save(worker);
            }

            return Map.of(
                    "type", "REGISTER",
                    "token", jwtUtil.generateToken(generatedLoginId),
                    "user", user
            );
        }

        if (loginId == null || !user.getLoginId().equals(loginId)) {
            throw new RuntimeException("Invalid login ID");
        }

        return Map.of(
                "type", "LOGIN",
                "token", jwtUtil.generateToken(loginId),
                "user", user
        );
    }

    // ================= FORGOT OTP VERIFY =================

    public Map<String, Object> verifyOtpForgot(String phone, String otp) {
        validateOtp(phone, otp);
        return Map.of("success", true);
    }

    // ================= COMMON OTP VALIDATION =================

    private void validateOtp(String phone, String otp) {

        OtpData data = otpStorage.get(phone);

        if (data == null) throw new RuntimeException("OTP not found");

        if (System.currentTimeMillis() > data.expiryTime) {
            otpStorage.remove(phone);
            throw new RuntimeException("OTP expired");
        }

        if (!data.otp.equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        otpStorage.remove(phone);
    }

    // ================= FORGOT LOGIN ID =================

    public Map<String, Object> forgotLoginId(String phone) {

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return Map.of("loginId", user.getLoginId());
    }

    public String getLoginIdFromToken(String token) {
        return jwtUtil.extractLoginId(token);
    }
}