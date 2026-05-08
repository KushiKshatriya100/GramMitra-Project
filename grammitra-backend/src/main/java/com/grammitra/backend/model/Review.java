package com.grammitra.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    private String id;

    // ✅ BOOKING REFERENCE
    private String bookingId;

    // ✅ OPTIONAL LEGACY SUPPORT
    private String jobId;

    // ✅ REVIEW OWNER
    private String userId;

    // ✅ REVIEW TARGET
    private String workerId;

    // ⭐ RATING
    private int rating;

    // ✅ OLD FIELD (BACKWARD COMPATIBLE)
    private String feedback;

    // 🌍 MULTILINGUAL SUPPORT
    private Map<String, String> feedbackMap;

    // ✅ NEW COMMENT FIELD
    private String comment;

    // 🌍 MULTILINGUAL COMMENT
    private Map<String, String> commentMap;

    // ✅ REVIEW TIMESTAMP
    private LocalDateTime createdAt;
}