package com.grammitra.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String name;
    private String phone;
    private String role;

    private String loginId;

    private Location location; // ✅ ADD BACK

    private boolean profileCompleted = false;
}