package com.grammitra.backend.repository;

import com.grammitra.backend.model.Review;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository
        extends MongoRepository<Review, String> {

    // ✅ GET ALL REVIEWS OF WORKER
    List<Review> findByWorkerId(
            String workerId
    );

    // ✅ CHECK IF REVIEW ALREADY EXISTS
    boolean existsByBookingId(
            String bookingId
    );

    // ✅ GET REVIEW BY BOOKING
    Optional<Review> findByBookingId(
            String bookingId
    );

    // ✅ LEGACY SUPPORT
    boolean existsByJobId(
            String jobId
    );
}