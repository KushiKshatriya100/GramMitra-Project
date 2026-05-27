package com.grammitra.backend.controller;

import com.grammitra.backend.dto.CreateBookingRequest;
import com.grammitra.backend.model.Booking;
import com.grammitra.backend.service.BookingService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/booking")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // ✅ CREATE BOOKING
    // SECURITY:
    //   - userId is taken from the JWT (Authentication.getName()), NOT the
    //     request. Accepting userId from the client was an IDOR — any
    //     logged-in user could create bookings on behalf of any other user.
    //   - workerId + description come from a validated JSON body so they
    //     never appear in URLs / server access logs / browser history.
    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestBody @Valid CreateBookingRequest req,
            Authentication auth
    ) {

        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        String userId = auth.getName();

        return ResponseEntity.ok(
                bookingService.createBooking(
                        userId,
                        req.getWorkerId(),
                        req.getDescription()
                )
        );
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

    // ✅ ACCEPT BOOKING — only the assigned worker may accept.
    @PutMapping("/{bookingId}/accept")
    public ResponseEntity<Booking> acceptBooking(
            @PathVariable String bookingId,
            Authentication auth
    ) {
        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new RuntimeException("Invalid bookingId");
        }
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
                bookingService.updateStatus(bookingId, "ACCEPTED", auth.getName())
        );
    }

    // ✅ REJECT BOOKING — only the assigned worker may reject.
    @PutMapping("/{bookingId}/reject")
    public ResponseEntity<Booking> rejectBooking(
            @PathVariable String bookingId,
            Authentication auth
    ) {
        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new RuntimeException("Invalid bookingId");
        }
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
                bookingService.updateStatus(bookingId, "REJECTED", auth.getName())
        );
    }

    // ✅ MARK COMPLETED — only the booking's customer may complete.
    @PutMapping("/{bookingId}/complete")
    public ResponseEntity<Booking> completeBooking(
            @PathVariable String bookingId,
            Authentication auth
    ) {
        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new RuntimeException("Invalid bookingId");
        }
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
                bookingService.updateStatus(bookingId, "COMPLETED", auth.getName())
        );
    }

    // 💰 CREATE RAZORPAY ORDER — only the booking's customer may pay.
    @PostMapping("/create-order/{bookingId}")
    public ResponseEntity<Map<String, Object>> createOrder(
            @PathVariable String bookingId,
            Authentication auth
    ) {
        if (bookingId == null || bookingId.trim().isEmpty()) {
            throw new RuntimeException("Invalid bookingId");
        }
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(
                bookingService.createOrder(bookingId, auth.getName())
        );
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