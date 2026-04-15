package com.grammitra.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class WorkerResponse {

    // 🔥 FIXED: rename userId → id
    private String id;

    private String name;
    private List<String> skills;
    private double wage;
    private boolean availability;
    private double rating;
    private int totalReviews;

    private String location;
}