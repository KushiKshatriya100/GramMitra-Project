package com.grammitra.backend.service;

import com.grammitra.backend.model.Booking;
import com.grammitra.backend.model.Job;
import com.grammitra.backend.model.JobStatus;
import com.grammitra.backend.model.Review;
import com.grammitra.backend.model.Worker;

import com.grammitra.backend.repository.BookingRepository;
import com.grammitra.backend.repository.JobRepository;
import com.grammitra.backend.repository.ReviewRepository;
import com.grammitra.backend.repository.WorkerRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    private final WorkerRepository workerRepository;

    private final JobRepository jobRepository;

    private final BookingRepository bookingRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            WorkerRepository workerRepository,
            JobRepository jobRepository,
            BookingRepository bookingRepository
    ) {

        this.reviewRepository = reviewRepository;

        this.workerRepository = workerRepository;

        this.jobRepository = jobRepository;

        this.bookingRepository = bookingRepository;
    }

    // ✅ CREATE REVIEW
    public Review addReview(
            String bookingId,
            int rating,
            String comment,
            String userId
    ) {

        // ✅ VALIDATION
        if (rating < 1 || rating > 5) {
            throw new RuntimeException(
                    "Rating must be between 1 and 5"
            );
        }

        if (comment == null || comment.trim().isEmpty()) {
            throw new RuntimeException(
                    "Review comment cannot be empty"
            );
        }

        // ✅ FIND BOOKING
        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found")
                );

        // ✅ ONLY BOOKING OWNER CAN REVIEW
        if (!booking.getUserId().equals(userId)) {

            throw new RuntimeException(
                    "Only booking owner can add review"
            );
        }

        // ✅ ONLY COMPLETED BOOKINGS
        if (!"COMPLETED".equals(booking.getStatus())) {

            throw new RuntimeException(
                    "Booking not completed yet"
            );
        }

        // ✅ PREVENT DUPLICATE REVIEW
        if (reviewRepository.existsByBookingId(bookingId)) {

            throw new RuntimeException(
                    "Review already submitted"
            );
        }

        // ✅ CREATE REVIEW
        Review review = new Review();

        review.setBookingId(bookingId);

        review.setUserId(userId);

        review.setWorkerId(booking.getWorkerId());

        review.setRating(rating);

        review.setComment(comment);

        // ✅ LEGACY SUPPORT
        review.setFeedback(comment);

        review.setCreatedAt(LocalDateTime.now());

        // ✅ OPTIONAL JOB LINK
        if (booking.getJobId() != null) {
            review.setJobId(booking.getJobId());
        }

        Review savedReview =
                reviewRepository.save(review);

// ✅ MARK REVIEW AS SUBMITTED
        booking.setReviewSubmitted(true);

        bookingRepository.save(booking);

// ✅ UPDATE WORKER RATING
        updateWorkerRating(
                booking.getWorkerId(),
                rating
        );

        return savedReview;
    }

    // ✅ GET ALL REVIEWS OF WORKER
    public List<Review> getWorkerReviews(
            String workerId
    ) {

        if (workerId == null || workerId.trim().isEmpty()) {

            throw new RuntimeException(
                    "Invalid workerId"
            );
        }

        return reviewRepository.findByWorkerId(workerId);
    }

    // ✅ UPDATE WORKER RATING
    private void updateWorkerRating(
            String workerId,
            int newRating
    ) {

        Worker worker = workerRepository
                .findById(workerId)
                .orElseThrow(() ->
                        new RuntimeException("Worker not found")
                );

        double currentRating = worker.getRating();

        int totalReviews = worker.getTotalReviews();

        // ✅ CALCULATE NEW AVERAGE
        double totalRating =
                currentRating * totalReviews;

        totalReviews += 1;

        double updatedRating =
                (totalRating + newRating)
                        / totalReviews;

        // ✅ ROUND TO 1 DECIMAL
        updatedRating =
                Math.round(updatedRating * 10.0)
                        / 10.0;

        worker.setRating(updatedRating);

        worker.setTotalReviews(totalReviews);

        workerRepository.save(worker);
    }
}