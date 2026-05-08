package com.grammitra.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class WorkerResponse {

    private String id;

    // 🖼️ PROFILE
    private String profileImage;

    // ✅ DISPLAY NAME
    private String name;

    private String gender;

    private int age;

    // 📍 LOCATION
    // ✅ LANGUAGE RESOLVED VALUE
    private String location;

    // 🌍 GEO LOCATION
    private double latitude;

    private double longitude;

    // 📞 CONTACT
    private String phone;

    // 🛠️ SKILLS
    // ✅ LANGUAGE RESOLVED VALUE
    private List<String> skills;

    // 💼 WORK INFO
    private int experience;

    private double wage;

    private boolean availability;

    // 🧾 BIO
    // ✅ LANGUAGE RESOLVED VALUE
    private String bio;

    // ⭐ REVIEW METRICS
    private double rating;

    private int totalReviews;

    private int jobsCompleted;

    // 📊 PROFILE STATUS
    private int profileCompletion;

    private boolean profileCompleted;
}