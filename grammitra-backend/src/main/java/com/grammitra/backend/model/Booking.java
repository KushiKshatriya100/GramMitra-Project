package com.grammitra.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id;

    // ✅ CUSTOMER
    private String userId;

    // ✅ WORKER PROFILE ID
    private String workerId;

    /**
     * ✅ BOOKING FLOW
     *
     * PENDING
     * → PAID
     * → ACCEPTED
     * → COMPLETED
     *
     * REJECTED kept for backward compatibility
     */
    private String status;

    // ✅ OLD FIELD (BACKWARD COMPATIBLE)
    private String description;

    // 🌍 MULTILINGUAL DESCRIPTION
    private Map<String, String> descriptionMap;

    // ✅ OPTIONAL JOB LINK
    private String jobId;

    // 💰 PAYMENT FIELDS

    /**
     * Razorpay Payment ID
     */
    private String paymentId;

    /**
     * Razorpay Order ID
     */
    private String orderId;

    /**
     * PAYMENT FLOW
     *
     * PENDING
     * → PAID
     * → FAILED
     * → REFUNDED         (worker rejected a paid booking, Razorpay refund OK)
     * → REFUND_FAILED    (refund call to Razorpay returned an error — needs
     *                     manual reconciliation, see runbook)
     */
    private String paymentStatus;

    /** Razorpay Refund ID. Set when a refund is issued; null otherwise. */
    private String refundId;

    /**
     * Booking amount
     */
    private double amount;

    // ✅ REVIEW SUPPORT

    /**
     * Whether review already submitted
     */
    private boolean reviewSubmitted= false;

    /**
     * Whether service completed
     */
    private boolean completed;

    // ✅ TIMESTAMPS
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime completedAt;
}