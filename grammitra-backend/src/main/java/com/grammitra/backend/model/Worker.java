package com.grammitra.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "workers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Worker {

    @Id
    private String id;

    // ✅ LINKED AUTH USER
    @Indexed(unique = true)
    private String userId;

    // 🖼️ PROFILE
    private String profileImage;

    private String name;

    private String gender;

    private int age;

    // ✅ OLD LOCATION FIELD
    private String location;

    // 🌍 MULTILINGUAL LOCATION
    private Map<String, String> locationMap;

    // 📍 GEO LOCATION
    private double latitude;

    private double longitude;

    // 📞 PHONE
    @Pattern(
            regexp = "^\\+?[0-9]{10,15}$",
            message = "Invalid phone number format"
    )
    private String phone;

    // ✅ OLD SKILLS ARRAY
    private List<String> skills;

    // 🌍 MULTILINGUAL SKILLS
    private List<Map<String, String>> skillsMap;

    // 💼 EXPERIENCE
    private int experience;

    // 💰 DAILY WAGE
    private Double wage;

    // ✅ AVAILABLE FOR WORK
    private boolean availability;

    // ✅ OLD BIO FIELD
    private String bio;

    // 🌍 MULTILINGUAL BIO
    private Map<String, String> bioMap;

    // ⭐ REVIEW SYSTEM

    /**
     * Average worker rating
     * Example:
     * 4.7
     */
    private Double rating = 0.0;

    /**
     * Total number of reviews
     */
    private Integer totalReviews = 0;

    /**
     * Total completed jobs
     */
    private Integer jobsCompleted = 0;

    // ✅ REVIEW METRICS

    /**
     * Optional helper field
     * Stores total rating score
     * Used for accurate average calculation
     */
    private Double totalRatingSum = 0.0;

    // 📊 PROFILE STATUS
    private Integer profileCompletion = 0;

    private boolean profileCompleted = false;

    // 🕒 TIMESTAMPS
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // ✅ LAST ACTIVE
    private LocalDateTime lastActiveAt;
}