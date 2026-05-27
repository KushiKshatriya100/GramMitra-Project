package com.grammitra.backend.service;

import com.grammitra.backend.model.User;
import com.grammitra.backend.model.Worker;
import com.grammitra.backend.repository.UserRepository;
import com.grammitra.backend.repository.WorkerRepository;
import com.grammitra.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    /** OTP validity. Five minutes is long enough for SMS latency in rural areas. */
    private static final Duration OTP_VALIDITY = Duration.ofMinutes(5);

    private final UserRepository userRepository;
    private final WorkerRepository workerRepository;
    private final OtpStore otpStore;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final SmsService smsService;

    /**
     * Max failed verify attempts within {@link #verifyWindow}. After this,
     * verifies are blocked for the remainder of the window — closes the
     * 1-in-10^6 brute-force window the audit flagged. Defaults: 5 in 15 min.
     */
    private final int maxVerifyAttempts;
    private final Duration verifyWindow;

    public AuthService(UserRepository userRepository,
                       WorkerRepository workerRepository,
                       OtpStore otpStore,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       SmsService smsService,
                       @Value("${otp.verify.maxAttempts:5}") int maxVerifyAttempts,
                       @Value("${otp.verify.window:PT15M}") Duration verifyWindow) {
        this.userRepository = userRepository;
        this.workerRepository = workerRepository;
        this.otpStore = otpStore;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.smsService = smsService;
        this.maxVerifyAttempts = maxVerifyAttempts;
        this.verifyWindow = verifyWindow;
    }

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

    public Map<String, Object> sendOtp(String phone, String loginId, String mode) {

        // Defensively trim — copy-pasted phone numbers / loginIds often pick
        // up a trailing space that becomes invisible in browser autocomplete.
        String normalizedPhone   = phone   == null ? null : phone.trim();
        String normalizedLoginId = loginId == null ? null : loginId.trim();

        User user = userRepository.findByPhone(normalizedPhone).orElse(null);

        log.info("🔎 sendOtp: mode={}, phone=[{}], loginId=[{}], lookup={}",
                mode,
                normalizedPhone,
                normalizedLoginId,
                user == null ? "NOT FOUND" : "found id=" + user.getId()
                        + " role=" + user.getRole()
                        + " storedLoginId=[" + user.getLoginId() + "]");

        // 🔥 LOGIN FLOW
        if ("login".equalsIgnoreCase(mode)) {

            if (user == null) {
                throw new RuntimeException("User not found");
            }

            // Login IDs are generated from uppercase letters + digits only
            // (see generateLoginId), so case sensitivity here adds no
            // security value and reliably triggers false rejections when
            // browser autofill / password managers / users typing in a
            // different case submit the form. Compare case-insensitively.
            if (normalizedLoginId == null
                    || !user.getLoginId().equalsIgnoreCase(normalizedLoginId)) {
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

        // Per-IP send rate limiting is enforced upstream by OtpSendRateLimitFilter
        // (Bucket4j + Redis) when app.ratelimit.enabled=true. Per-phone burst is
        // implicitly handled here: a fresh putOtp overwrites any in-flight OTP,
        // and the attempt counter caps verify brute-force across send rotations.

        String otp = generateOtp();

        // Hash at rest with BCrypt — see SecurityConfig#passwordEncoder.
        // Store-with-TTL is atomic: re-sending replaces the previous code so an
        // attacker can't have two valid codes in flight simultaneously, and
        // the OTP key is evicted automatically when OTP_VALIDITY elapses.
        otpStore.putOtp(
                normalizedPhone,
                passwordEncoder.encode(otp),
                OTP_VALIDITY
        );

        // Make the rest of the method use the trimmed phone too.
        phone = normalizedPhone;

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

        // Defensive normalization — same reasoning as sendOtp. Without these
        // trims, an autofilled "EHKIUC " (trailing space) fails .equals()
        // against a stored "EHKIUC" even though the user typed it right.
        phone   = phone   == null ? null : phone.trim();
        otp     = otp     == null ? null : otp.trim();
        loginId = loginId == null ? null : loginId.trim();

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

                // ✅ AUTO-COPY registered name + phone from the User record.
                // The Worker collection is read independently (worker search,
                // worker profile, booking notifications), so denormalizing
                // these here means downstream reads never see null/blank
                // for a worker who hasn't yet opened the profile-edit page.
                // WorkerService.mapToResponse still resolves the live User
                // record on every read, so subsequent name/phone updates
                // on the User flow through automatically.
                worker.setName(user.getName());
                worker.setPhone(user.getPhone());

                worker.setSkills(new ArrayList<>());
                worker.setWage(0.0);
                worker.setAvailability(false);
                worker.setProfileCompleted(false);

                LocalDateTime now = LocalDateTime.now();
                worker.setCreatedAt(now);
                worker.setUpdatedAt(now);

                workerRepository.save(worker);

                System.out.println(
                        "✅ Worker stub created at registration for "
                                + user.getName() + " (" + user.getPhone() + ")"
                );
            }

            return Map.of(
                    "type", "REGISTER",
                    "token", jwtUtil.generateToken(generatedLoginId),
                    "user", user
            );
        }

        if (loginId == null || !user.getLoginId().equalsIgnoreCase(loginId)) {
            throw new RuntimeException("Invalid login ID");
        }

        // Always issue the token using the canonical stored loginId so
        // downstream lookups (which still use case-sensitive findByLoginId)
        // hit the same value regardless of what casing the user typed.
        return Map.of(
                "type", "LOGIN",
                "token", jwtUtil.generateToken(user.getLoginId()),
                "user", user
        );
    }

    // ================= FORGOT OTP VERIFY =================

    public Map<String, Object> verifyOtpForgot(String phone, String otp) {
        validateOtp(phone, otp);
        return Map.of("success", true);
    }

    // ================= COMMON OTP VALIDATION =================

    /**
     * Verify an OTP for {@code phone}. The flow:
     *
     *   1. If attempts counter has already hit the cap in the current
     *      window, reject without consulting the OTP at all
     *      (closes the "rotate the OTP to reset the counter" hole).
     *   2. Look up the hashed OTP. Missing →
     *      "OTP not found / expired" (store already TTL'd it).
     *   3. BCrypt-compare. On mismatch: increment attempts (TTL set on
     *      first increment), throw. On match: clear both keys (single-use).
     */
    private void validateOtp(String phone, String otp) {

        Long currentAttempts = otpStore.getAttempts(phone);
        if (currentAttempts != null && currentAttempts >= maxVerifyAttempts) {
            log.warn("🔒 OTP verify blocked for phone=[{}] — {} attempts in window",
                    phone, currentAttempts);
            throw new RuntimeException(
                    "Too many invalid attempts. Please try again later.");
        }

        String storedHash = otpStore.getOtp(phone)
                .orElseThrow(() -> new RuntimeException("OTP not found or expired"));

        if (!passwordEncoder.matches(otp, storedHash)) {
            otpStore.incrementAttempts(phone, verifyWindow);
            throw new RuntimeException("Invalid OTP");
        }

        // Success → single-use; clear both keys. The attempts counter is
        // cleared too so a legitimate user who fumbled the first try and
        // then succeeded doesn't carry a stale counter into the next login.
        otpStore.deleteOtp(phone);
        otpStore.deleteAttempts(phone);
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
