package com.grammitra.backend.controller;

import com.grammitra.backend.model.Booking;
import com.grammitra.backend.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/booking")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // ✅ CREATE BOOKING
    @PostMapping
    public Booking createBooking(@RequestParam String userId,
                                 @RequestParam String workerId,
                                 @RequestParam String description) {

        if (userId == null || workerId == null) {
            throw new RuntimeException("Invalid booking request");
        }

        System.out.println("🔥 BOOKING REQUEST: user=" + userId + " worker=" + workerId);

        return bookingService.createBooking(userId, workerId, description);
    }

    // ✅ GET INCOMING BOOKINGS FOR WORKER
    @GetMapping("/worker/{workerId}")
    public List<Booking> getWorkerBookings(@PathVariable String workerId) {

        if (workerId == null || workerId.trim().isEmpty()) {
            throw new RuntimeException("Invalid workerId");
        }

        return bookingService.getWorkerBookings(workerId);
    }

    // ✅ GET MY BOOKINGS (USER OR WORKER CAN USE)
    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable String userId) {

        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("Invalid userId");
        }

        return bookingService.getUserBookings(userId);
    }

    // ✅ OPTIONAL CLEAN ENDPOINTS

    // 📥 INCOMING JOBS
    @GetMapping("/incoming/{workerId}")
    public List<Booking> getIncomingBookings(@PathVariable String workerId) {

        if (workerId == null || workerId.trim().isEmpty()) {
            throw new RuntimeException("Invalid workerId");
        }

        return bookingService.getWorkerBookings(workerId);
    }

    // 📤 MY BOOKINGS
    @GetMapping("/my-bookings/{userId}")
    public List<Booking> getMyBookings(@PathVariable String userId) {

        if (userId == null || userId.trim().isEmpty()) {
            throw new RuntimeException("Invalid userId");
        }

        return bookingService.getUserBookings(userId);
    }

    // ✅ ACCEPT BOOKING
    @PutMapping("/{bookingId}/accept")
    public Booking acceptBooking(@PathVariable String bookingId) {

        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new RuntimeException("Invalid bookingId");
        }

        return bookingService.updateStatus(bookingId, "ACCEPTED");
    }

    // ✅ REJECT BOOKING
    @PutMapping("/{bookingId}/reject")
    public Booking rejectBooking(@PathVariable String bookingId) {

        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new RuntimeException("Invalid bookingId");
        }

        return bookingService.updateStatus(bookingId, "REJECTED");
    }



    // ✅ MARK COMPLETED
    @PutMapping("/{bookingId}/complete")
    public Booking completeBooking(
            @PathVariable String bookingId
    ) {

        if (
                bookingId == null ||
                        bookingId.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Invalid bookingId"
            );
        }

        return bookingService.updateStatus(
                bookingId,
                "COMPLETED"
        );
    }

    // 💰 CREATE RAZORPAY ORDER
    @PostMapping("/create-order/{bookingId}")
    public Map<String, Object> createOrder(@PathVariable String bookingId) {

        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new RuntimeException("Invalid bookingId");
        }

        return bookingService.createOrder(bookingId);
    }

    // 💰 VERIFY PAYMENT
    @PostMapping("/verify-payment")
    public String verifyPayment(@RequestBody Map<String, String> request) {

        String orderId = request.get("orderId");
        String paymentId = request.get("paymentId");
        String signature = request.get("signature");

        if (orderId == null || paymentId == null || signature == null) {
            throw new RuntimeException("Invalid payment verification request");
        }

        bookingService.verifyPayment(orderId, paymentId, signature);

        return "Payment verified successfully";
    }
}