package com.grammitra.backend.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class WorkerRequest {

    private String profileImage;
    private String name;
    private String gender;
    private int age;

    // ✅ OLD FIELD (kept for backward compatibility)
    private String location;

    // 🌍 MULTILINGUAL LOCATION
    private Map<String, String> locationMap;

    // 🔥 GEO LOCATION (must match Worker.java)
    private double latitude;
    private double longitude;

    // 📞 PHONE (CRITICAL FOR SMS)
    private String phone;

    // ✅ OLD FIELD (fallback support)
    private List<String> skills;

    // 🌍 MULTILINGUAL SKILLS
    private List<Map<String, String>> skillsMap;

    private int experience;

    // ✅ KEEP CONSISTENT TYPE WITH MODEL (Double instead of double)
    private Double wage;

    private boolean availability;

    // ✅ OLD FIELD (fallback)
    private String bio;

    // 🌍 MULTILINGUAL BIO
    private Map<String, String> bioMap;
}