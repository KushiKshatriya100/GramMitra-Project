package com.grammitra.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id;

    private String userId;
    private String workerId;

    private String status; // PENDING / ACCEPTED / REJECTED

    private String description;

    private String jobId; // 🔥 NEW (IMPORTANT)
}