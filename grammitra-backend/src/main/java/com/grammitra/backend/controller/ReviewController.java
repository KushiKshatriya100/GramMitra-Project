package com.grammitra.backend.controller;

import com.grammitra.backend.model.Review;
import com.grammitra.backend.service.ReviewService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/review")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(
            ReviewService reviewService
    ) {
        this.reviewService = reviewService;
    }

    // ✅ CREATE REVIEW
    @PostMapping
    public ResponseEntity<Review> addReview(

            @RequestParam String bookingId,

            @RequestParam int rating,

            @RequestParam String comment,

            Authentication auth
    ) {

        if (bookingId == null || bookingId.trim().isEmpty()) {

            throw new RuntimeException(
                    "Invalid bookingId"
            );
        }

        if (comment == null || comment.trim().isEmpty()) {

            throw new RuntimeException(
                    "Comment cannot be empty"
            );
        }

        if (auth == null || auth.getName() == null) {

            throw new RuntimeException(
                    "Unauthorized user"
            );
        }

        Review review = reviewService.addReview(
                bookingId,
                rating,
                comment,
                auth.getName()
        );

        return ResponseEntity.ok(review);
    }

    // ✅ GET WORKER REVIEWS
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<Review>> getWorkerReviews(

            @PathVariable String workerId
    ) {

        if (workerId == null || workerId.trim().isEmpty()) {

            throw new RuntimeException(
                    "Invalid workerId"
            );
        }

        List<Review> reviews =
                reviewService.getWorkerReviews(workerId);

        return ResponseEntity.ok(reviews);
    }
}