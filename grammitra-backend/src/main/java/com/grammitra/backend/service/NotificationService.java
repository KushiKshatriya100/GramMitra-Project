package com.grammitra.backend.service;

import com.grammitra.backend.model.User;
import com.grammitra.backend.model.Worker;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final SmsService smsService;

    public NotificationService(SmsService smsService) {
        this.smsService = smsService;
    }

    // 🔹 BASIC PHONE VALIDATION
    private boolean isValidPhone(String phone) {
        return phone != null && !phone.trim().isEmpty();
    }

    // 📩 BOOKING CREATED → WORKER
    public void sendBookingCreated(Worker worker) {
        try {
            if (worker != null && isValidPhone(worker.getPhone())) {

                String message = "New booking received. Please check GramMitra app.";

                System.out.println("📩 BOOKING SMS → WORKER: " + worker.getPhone());

                smsService.sendBookingNotification(worker.getPhone(), message);
            } else {
                System.out.println("⚠️ Worker phone missing, SMS skipped");
            }
        } catch (Exception e) {
            System.err.println("❌ SMS failed (booking): " + e.getMessage());
        }
    }

    // 💰 PAYMENT SUCCESS → USER
    public void sendPaymentSuccessToUser(User user) {
        try {
            if (user != null && isValidPhone(user.getPhone())) {

                String message = "Payment successful for your booking on GramMitra.";

                System.out.println("📩 PAYMENT SMS → USER: " + user.getPhone());

                smsService.sendPaymentNotification(user.getPhone(), message);
            } else {
                System.out.println("⚠️ User phone missing, SMS skipped");
            }
        } catch (Exception e) {
            System.err.println("❌ SMS failed (payment-user): " + e.getMessage());
        }
    }

    // 💰 PAYMENT SUCCESS → WORKER
    public void sendPaymentSuccessToWorker(Worker worker) {
        try {
            if (worker != null && isValidPhone(worker.getPhone())) {

                String message = "You received a paid booking on GramMitra.";

                System.out.println("📩 PAYMENT SMS → WORKER: " + worker.getPhone());

                smsService.sendPaymentNotification(worker.getPhone(), message);
            } else {
                System.out.println("⚠️ Worker phone missing, SMS skipped");
            }
        } catch (Exception e) {
            System.err.println("❌ SMS failed (payment-worker): " + e.getMessage());
        }
    }

    // ✅ BOOKING ACCEPTED → USER
    public void sendBookingAccepted(User user) {
        try {
            if (user != null && isValidPhone(user.getPhone())) {

                String message = "Your booking has been accepted by the worker.";

                System.out.println("📩 ACCEPT SMS → USER: " + user.getPhone());

                smsService.sendBookingNotification(user.getPhone(), message);
            } else {
                System.out.println("⚠️ User phone missing, SMS skipped");
            }
        } catch (Exception e) {
            System.err.println("❌ SMS failed (accept): " + e.getMessage());
        }
    }
}