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

    public AuthService(UserRepository userRepository,
                       WorkerRepository workerRepository,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.workerRepository = workerRepository;
        this.jwtUtil = jwtUtil;
    }

    // 🔐 OTP STORAGE
    private static class OtpData {
        String otp;
        long expiryTime;

        OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    // 🔑 GENERATE LOGIN ID
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

    public Map<String, Object> sendOtp(String phone) {

        boolean userExists = userRepository.findByPhone(phone).isPresent();

        String otp = String.valueOf(new Random().nextInt(9000) + 1000);
        long expiry = System.currentTimeMillis() + (5 * 60 * 1000);

        otpStorage.put(phone, new OtpData(otp, expiry));

        System.out.println("OTP for " + phone + " = " + otp);

        return Map.of(
                "message", "OTP sent successfully",
                "userExists", userExists
        );
    }

    // ✅ VERIFY OTP (REGISTER + LOGIN)
    public Map<String, Object> verifyOtp(String phone, String otp,
                                         String name, String role, String loginId) {

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

        User user = userRepository.findByPhone(phone).orElse(null);

        // 🟢 REGISTER FLOW
        if (user == null) {

            if (name == null || role == null) {
                throw new RuntimeException("Name and role required");
            }

            user = new User();
            user.setPhone(phone);
            user.setName(name);
            user.setRole(role);
            user.setLoginId(generateLoginId());

            userRepository.save(user);

            // 🔥🔥 AUTO CREATE WORKER PROFILE
            if ("WORKER".equalsIgnoreCase(role)) {
                Worker worker = new Worker();
                worker.setUserId(user.getId());
                worker.setSkills(new ArrayList<>());
                worker.setWage(0);
                worker.setAvailability(false);
                worker.setProfileCompletion(0);
                worker.setProfileCompleted(false);

                workerRepository.save(worker);
            }

            String token = jwtUtil.generateToken(phone);

            return Map.of(
                    "type", "REGISTER",
                    "token", token,
                    "user", user
            );
        }

        // 🔐 LOGIN FLOW
        if (loginId == null || !user.getLoginId().equals(loginId)) {
            throw new RuntimeException("Invalid login ID");
        }

        String token = jwtUtil.generateToken(phone);

        return Map.of(
                "type", "LOGIN",
                "token", token,
                "user", user
        );
    }

    public Map<String, Object> verifyOtpForgot(String phone, String otp) {

        OtpData data = otpStorage.get(phone);

        if (data == null) {
            throw new RuntimeException("OTP not found");
        }

        if (System.currentTimeMillis() > data.expiryTime) {
            otpStorage.remove(phone);
            throw new RuntimeException("OTP expired");
        }

        if (!data.otp.equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        // ✅ remove OTP after success
        otpStorage.remove(phone);

        return Map.of("success", true);
    }

    public Map<String, Object> forgotLoginId(String phone) {

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return Map.of(
                "loginId", user.getLoginId()
        );
    }



    public String getPhoneFromToken(String token) {
        return jwtUtil.extractPhone(token);
    }
}