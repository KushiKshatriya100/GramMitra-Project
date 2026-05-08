package com.grammitra.backend.dto;

import com.grammitra.backend.model.Location;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class UserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    // 🔥 OPTIONAL multilingual support (hi/en)
    private Map<String, String> nameMap;

    @NotBlank(message = "Role is required")
    private String role;

    private Location location;
}