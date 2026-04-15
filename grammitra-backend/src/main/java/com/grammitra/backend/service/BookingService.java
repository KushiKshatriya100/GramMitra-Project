package com.grammitra.backend.service;

import com.grammitra.backend.model.Booking;
import com.grammitra.backend.model.Job;
import com.grammitra.backend.model.JobStatus;
import com.grammitra.backend.repository.BookingRepository;
import com.grammitra.backend.repository.JobRepository; // 🔥 NEW
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final JobRepository jobRepository; // 🔥 NEW

    public BookingService(BookingRepository bookingRepository,
                          JobRepository jobRepository) {
        this.bookingRepository = bookingRepository;
        this.jobRepository = jobRepository;
    }

    public Booking createBooking(String userId, String workerId, String description) {

        // 🔥 CREATE JOB FIRST
        Job job = new Job();
        job.setEmployerId(userId);
        job.setWorkerId(workerId);
        job.setStatus(JobStatus.PENDING);
        job.setCreatedAt(new Date());
        job.setUpdatedAt(new Date());

        jobRepository.save(job);

        // 🔥 CREATE BOOKING
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setWorkerId(workerId);
        booking.setDescription(description);
        booking.setStatus("PENDING");

        booking.setJobId(job.getId()); // 🔥 LINK

        return bookingRepository.save(booking);
    }

    public List<Booking> getWorkerBookings(String workerId) {
        return bookingRepository.findByWorkerId(workerId);
    }

    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking updateStatus(String bookingId, String status) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(status);

        return bookingRepository.save(booking);
    }
}