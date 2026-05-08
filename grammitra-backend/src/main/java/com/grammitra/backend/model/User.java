package com.grammitra.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    // ✅ OLD FIELD
    private String name;

    // 🌍 NEW FIELD
    private Map<String, String> nameMap;

    // 📞 REQUIRED FOR SMS (ALREADY PRESENT ✅)
    private String phone;

    private String role;

    private String loginId;

    private Location location;

    private boolean profileCompleted = false;
}