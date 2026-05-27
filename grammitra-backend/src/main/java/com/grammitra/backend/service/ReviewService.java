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

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
    // Authorization rules:
    //   - caller (auth-derived userId) must own the booking (booking.userId)
    //   - booking must be in COMPLETED status
    //   - only one review per booking
    //
    // Status code choices:
    //   401 — no auth principal (controller's job, defense-in-depth here)
    //   403 — booking exists but caller doesn't own it. We deliberately
    //         return 403 instead of 404 because the booking IS real; 404
    //         would also work as an ID-existence non-disclosure, but the
    //         API surface is private (only the booking's customer should
    //         know their own booking ID), so 403 is more honest.
    //   404 — booking truly missing
    //   409 — booking exists & is owned by caller, but state forbids the
    //         action (not completed yet, or already reviewed). 409 Conflict
    //         is the right semantic for "the resource exists but its
    //         current state is incompatible with the request."
    //   400 — caught by @Valid on the DTO; the rating/comment checks below
    //         are kept defensively in case the service is called from a
    //         non-controller path one day.
    public Review addReview(
            String bookingId,
            int rating,
            String comment,
            String userId
    ) {

        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        if (rating < 1 || rating > 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }

        if (comment == null || comment.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Review comment cannot be empty");
        }

        // ✅ FIND BOOKING
        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Booking not found"));

        // 🔐 OWNERSHIP — caller must be the booking's customer
        if (!userId.equals(booking.getUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the booking's customer can submit a review");
        }

        // ✅ STATE — only completed bookings can be reviewed
        if (!"COMPLETED".equals(booking.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Booking must be COMPLETED before it can be reviewed");
        }

        // ✅ ONE REVIEW PER BOOKING — belt-and-suspenders:
        //   1. Fast pre-check on the booking's own flag (no extra query).
        //   2. Authoritative check against the review collection in case
        //      the flag drifted (rare, but possible if a save failed
        //      mid-flight before the booking update committed).
        if (booking.isReviewSubmitted()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A review has already been submitted for this booking");
        }
        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A review has already been submitted for this booking");
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