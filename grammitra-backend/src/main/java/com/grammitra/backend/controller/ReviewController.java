package com.grammitra.backend.controller;

import com.grammitra.backend.dto.CreateReviewRequest;
import com.grammitra.backend.model.Review;
import com.grammitra.backend.service.ReviewService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/review")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * Create a review. The reviewer is taken from the JWT — clients cannot
     * pass it. ReviewService verifies the caller actually owns the booking
     * and that it's in a state that can be reviewed; see that class for the
     * exact rules.
     */
    @PostMapping
    public ResponseEntity<Review> addReview(
            @RequestBody @Valid CreateReviewRequest req,
            Authentication auth
    ) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        Review review = reviewService.addReview(
                req.getBookingId(),
                req.getRating(),
                req.getComment(),
                auth.getName()
        );

        return ResponseEntity.ok(review);
    }

    // ✅ GET WORKER REVIEWS (public — reads are open via SecurityConfig)
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<Review>> getWorkerReviews(
            @PathVariable String workerId
    ) {
        if (workerId == null || workerId.trim().isEmpty()) {
            throw new RuntimeException("Invalid workerId");
        }
        return ResponseEntity.ok(reviewService.getWorkerReviews(workerId));
    }
}
