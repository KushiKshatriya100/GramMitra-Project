package com.grammitra.backend.service;

import com.grammitra.backend.model.Booking;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;
import com.razorpay.Utils;

import jakarta.annotation.PostConstruct;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    @Value("${razorpay.key:}")
    private String razorpayKey;

    @Value("${razorpay.secret:}")
    private String razorpaySecret;

    /**
     * Boot-time visibility: print whether Razorpay is configured so a missing
     * key shows up at startup, not as a mysterious 400 during the first
     * booking. Never logs the secret.
     */
    @PostConstruct
    void announce() {
        if (isConfigured()) {
            String prefix = razorpayKey.length() > 8
                    ? razorpayKey.substring(0, 8) + "…"
                    : razorpayKey;
            log.info("💳 Razorpay configured (key prefix: {})", prefix);
        } else {
            log.warn("⚠️  Razorpay is NOT configured. Booking payments will fail "
                    + "until RAZORPAY_KEY and RAZORPAY_SECRET are set "
                    + "(env vars or application-local.properties).");
        }
    }

    private boolean isConfigured() {
        return razorpayKey != null && !razorpayKey.isBlank()
                && razorpaySecret != null && !razorpaySecret.isBlank();
    }

    private void ensureConfigured() {
        if (!isConfigured()) {
            throw new IllegalStateException(
                    "Razorpay is not configured. Set RAZORPAY_KEY and "
                            + "RAZORPAY_SECRET (env vars or application-local.properties).");
        }
    }

    /**
     * ✅ Create Razorpay Order
     *
     * Wraps Razorpay-SDK exceptions so the *actual* reason (auth failed,
     * amount too small, currency unsupported, etc.) reaches the logs and
     * surfaces in the rethrown message rather than the generic "Error
     * creating Razorpay order" that previously hid every problem.
     */
    public Map<String, Object> createOrder(Booking booking) {

        ensureConfigured();

        if (booking == null) {
            throw new IllegalArgumentException("Booking is null");
        }
        // booking.amount is primitive double — defaults to 0.0 when unset.
        // Razorpay minimum charge is 100 paise (₹1); below that, the SDK
        // fails with an unhelpful "amount must be a number" error, so
        // intercept here with a message that points at the real cause
        // (worker wage never configured).
        if (booking.getAmount() < 1.0) {
            throw new IllegalArgumentException(
                    "Booking amount must be at least ₹1 (got "
                            + booking.getAmount()
                            + ") — worker wage not set?");
        }

        // Convert ₹ → paise as Razorpay expects, defensively.
        int amountInPaise = (int) Math.round(booking.getAmount() * 100);

        try {
            RazorpayClient client = new RazorpayClient(razorpayKey, razorpaySecret);

            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", booking.getId());

            Order order = client.orders.create(options);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("key", razorpayKey);

            log.info("💳 Razorpay order created: bookingId={} orderId={} amount={} paise",
                    booking.getId(), order.get("id"), amountInPaise);

            return response;

        } catch (RazorpayException re) {
            // Razorpay-side rejection (auth, amount, currency, account
            // limits, sandbox issues, etc.). Log the full message so the
            // backend log shows the real reason, and surface a short
            // version in the thrown error so the frontend toast is useful.
            log.error("❌ Razorpay rejected createOrder for booking={} amount={} paise: {}",
                    booking.getId(), amountInPaise, re.getMessage());
            throw new RuntimeException(
                    "Payment gateway: " + re.getMessage(), re);

        } catch (Exception e) {
            // Network / JSON / unexpected — log the stack, surface the cause.
            log.error("❌ Unexpected error creating Razorpay order for booking={}: ",
                    booking.getId(), e);
            String reason = e.getMessage() == null
                    ? e.getClass().getSimpleName()
                    : e.getMessage();
            throw new RuntimeException("Payment gateway error: " + reason, e);
        }
    }

    /**
     * Issues a full refund against a captured Razorpay payment. Returns the
     * Razorpay refund ID on success.
     *
     * Sync inline by design (per C-7 fix): the caller (BookingService.reject)
     * blocks until Razorpay responds, so the booking is never left in a
     * "rejected but no refund initiated" state on the happy path. Razorpay's
     * /refunds endpoint is fast (p99 &lt; 2s); if it errors, the caller
     * decides whether to fail the reject or persist REFUND_FAILED for
     * manual reconciliation.
     *
     * @param paymentId Razorpay Payment ID stored on the Booking
     * @param amountInRupees full refund amount (₹), converted to paise here
     * @return the Razorpay refund ID (e.g. "rfnd_XXXXXXXX")
     * @throws RazorpayException on any gateway error — caller catches it
     */
    public String refundPayment(String paymentId, double amountInRupees) throws RazorpayException {

        ensureConfigured();

        if (paymentId == null || paymentId.isBlank()) {
            throw new IllegalArgumentException("paymentId is required for refund");
        }
        if (amountInRupees < 1.0) {
            throw new IllegalArgumentException(
                    "Refund amount must be at least ₹1 (got " + amountInRupees + ")");
        }

        int amountInPaise = (int) Math.round(amountInRupees * 100);

        RazorpayClient client = new RazorpayClient(razorpayKey, razorpaySecret);

        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise);
        // speed=normal queues refund through the regular bank rails (T+5);
        // speed=optimum is faster but requires merchant-side enablement and
        // surcharges per refund. Default to "normal" until product asks.
        options.put("speed", "normal");

        Refund refund = client.payments.refund(paymentId, options);
        String refundId = refund.get("id");

        log.info("💸 Razorpay refund issued: paymentId={} refundId={} amount={} paise",
                paymentId, refundId, amountInPaise);

        return refundId;
    }

    /**
     * ✅ Verify Payment Signature
     */
    public boolean verifyPayment(String orderId, String paymentId, String signature) {

        ensureConfigured();

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, razorpaySecret);

        } catch (Exception e) {
            log.error("❌ Razorpay signature verification failed: {}", e.getMessage());
            return false;
        }
    }
}
