package com.grammitra.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "workers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Worker {

    @Id
    private String id;

    private String userId;

    private List<String> skills;
    private double wage;
    private boolean availability;

    private double rating = 0.0;
    private int totalReviews = 0;

    private int profileCompletion = 0;
    private boolean profileCompleted = false;
}