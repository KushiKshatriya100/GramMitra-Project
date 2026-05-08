package com.grammitra.backend.service;

public interface SmsService {

    // 🔐 OTP
    void sendOtp(String phone, String otp);

    // 📩 BOOKING NOTIFICATION
    void sendBookingNotification(String phone, String message);

    // 💰 PAYMENT NOTIFICATION
    void sendPaymentNotification(String phone, String message);
}