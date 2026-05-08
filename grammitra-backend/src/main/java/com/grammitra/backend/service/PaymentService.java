package com.grammitra.backend.service;

import com.grammitra.backend.model.Booking;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    @Value("${razorpay.key}")
    private String razorpayKey;

    @Value("${razorpay.secret}")
    private String razorpaySecret;

    /**
     * ✅ Create Razorpay Order
     */
    public Map<String, Object> createOrder(Booking booking) {

        try {
            RazorpayClient client = new RazorpayClient(razorpayKey, razorpaySecret);

            JSONObject options = new JSONObject();

            // ⚠️ Razorpay expects amount in paise
            int amountInPaise = (int) (booking.getAmount() * 100);

            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", booking.getId());

            Order order = client.orders.create(options);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("key", razorpayKey);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Error creating Razorpay order", e);
        }
    }

    /**
     * ✅ Verify Payment Signature
     */
    public boolean verifyPayment(String orderId, String paymentId, String signature) {

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, razorpaySecret);

        } catch (Exception e) {
            return false;
        }
    }
}