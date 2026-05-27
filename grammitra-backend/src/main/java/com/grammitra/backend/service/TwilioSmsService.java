package com.grammitra.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioSmsService implements SmsService {

    private static final Logger log = LoggerFactory.getLogger(TwilioSmsService.class);

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromNumber;

    /**
     * Becomes {@code true} only when all three Twilio properties are set AND
     * {@link Twilio#init} succeeded. Every send-path consults this flag so the
     * app boots cleanly without Twilio creds (local dev, CI, tests) and only
     * the SMS calls themselves degrade gracefully — they log and return
     * instead of throwing {@link com.twilio.exception.AuthenticationException}.
     */
    private volatile boolean initialised = false;

    @PostConstruct
    public void init() {
        // Trim is deliberate — env-var injection on Windows occasionally leaves
        // a trailing CR which Twilio rejects with a cryptic 401.
        String sid   = accountSid == null ? "" : accountSid.trim();
        String token = authToken  == null ? "" : authToken.trim();
        String from  = fromNumber == null ? "" : fromNumber.trim();

        // Twilio account SIDs always start with "AC" and are 34 chars. Skip
        // init for empty OR obviously-placeholder values rather than letting
        // Twilio.init() throw on the first SMS attempt.
        boolean validSid = sid.startsWith("AC") && sid.length() == 34;

        if (!validSid || token.isEmpty() || from.isEmpty()) {
            log.warn("⚠️  Twilio NOT initialised — missing or placeholder credentials. "
                    + "SMS sends will be logged-only. "
                    + "(sid set: {}, token set: {}, from set: {})",
                    !sid.isEmpty(), !token.isEmpty(), !from.isEmpty());
            return;
        }

        try {
            Twilio.init(sid, token);
            initialised = true;
            log.info("✅ Twilio initialised (from={})", from);
        } catch (Exception e) {
            // Don't let a bad token prevent the app from booting — the OTP
            // path will log-and-skip, every other endpoint keeps working.
            log.error("❌ Twilio initialisation failed — SMS sends will be log-only: {}",
                    e.getMessage());
        }
    }

    // 🔹 COMMON SMS SENDER
    private void sendSms(String phone, String message) {
        if (phone == null || phone.isBlank()) {
            log.warn("❌ SMS skipped: phone number is null or empty");
            return;
        }

        if (!initialised) {
            // In dev this is the expected path when no Twilio creds are set.
            // Print the OTP / message to stdout so the developer can still
            // exercise the flow without burning real SMS credits.
            log.info("📩 [Twilio disabled] would send to {} :: {}", phone, message);
            return;
        }

        try {
            log.info("📩 Sending SMS to {}", phone);
            Message.creator(
                    new PhoneNumber(phone),
                    new PhoneNumber(fromNumber.trim()),
                    message
            ).create();
            log.info("✅ SMS sent to {}", phone);
        } catch (Exception e) {
            // Never propagate to the caller — a failing SMS provider must not
            // turn /auth/send-otp into a 500. AuthService returns success
            // even when send fails, and the user retries with /auth/resend-otp.
            log.error("❌ SMS to {} failed: {}", phone, e.getMessage());
        }
    }

    // 🔐 OTP
    @Override
    public void sendOtp(String phone, String otp) {
        sendSms(phone, "Your GramMitra OTP is: " + otp);
    }

    // 📩 BOOKING NOTIFICATION
    @Override
    public void sendBookingNotification(String phone, String message) {
        sendSms(phone, message);
    }

    // 💰 PAYMENT NOTIFICATION
    @Override
    public void sendPaymentNotification(String phone, String message) {
        sendSms(phone, message);
    }
}
