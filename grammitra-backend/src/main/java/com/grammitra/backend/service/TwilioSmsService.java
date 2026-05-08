package com.grammitra.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioSmsService implements SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
        System.out.println("✅ Twilio initialized successfully");
    }

    // 🔹 COMMON SMS SENDER (REUSABLE + DEBUG ENABLED)
    private void sendSms(String phone, String message) {
        try {
            if (phone == null || phone.isEmpty()) {
                System.err.println("❌ SMS FAILED: Phone number is null or empty");
                return;
            }

            System.out.println("📩 Sending SMS to: " + phone);
            System.out.println("📩 Message: " + message);

            Message.creator(
                    new PhoneNumber(phone),
                    new PhoneNumber(fromNumber),
                    message
            ).create();

            System.out.println("✅ SMS SENT SUCCESSFULLY");

        } catch (Exception e) {
            System.err.println("❌ SMS FAILED: " + e.getMessage());
        }
    }

    // 🔐 OTP
    @Override
    public void sendOtp(String phone, String otp) {
        String message = "Your GramMitra OTP is: " + otp;
        sendSms(phone, message);
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