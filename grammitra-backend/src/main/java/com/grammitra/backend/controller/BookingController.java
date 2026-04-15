package com.grammitra.backend.controller;

import com.grammitra.backend.model.Booking;
import com.grammitra.backend.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

        return bookingService.createBooking(userId, workerId, description);
    }

    // ✅ GET WORKER BOOKINGS
    @GetMapping("/worker/{workerId}")
    public List<Booking> getWorkerBookings(@PathVariable String workerId) {
        return bookingService.getWorkerBookings(workerId);
    }

    // ✅ ACCEPT
    @PutMapping("/{bookingId}/accept")
    public Booking acceptBooking(@PathVariable String bookingId) {
        return bookingService.updateStatus(bookingId, "ACCEPTED");
    }

    // ✅ REJECT
    @PutMapping("/{bookingId}/reject")
    public Booking rejectBooking(@PathVariable String bookingId) {
        return bookingService.updateStatus(bookingId, "REJECTED");
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getUserBookings(@PathVariable String userId) {
        return bookingService.getUserBookings(userId);
    }

}