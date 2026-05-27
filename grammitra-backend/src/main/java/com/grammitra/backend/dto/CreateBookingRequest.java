package com.grammitra.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Body schema for POST /booking.
 *
 * NOTE: there is intentionally NO userId field here. The booking's user is
 * derived from the JWT (Authentication.getName()) on the server. Accepting
 * userId from the client previously allowed any logged-in user to create
 * bookings on behalf of any other user (IDOR).
 */
@Data
public class CreateBookingRequest {

    @NotBlank(message = "workerId is required")
    private String workerId;

    @NotBlank(message = "description is required")
    @Size(max = 500, message = "description must be at most 500 characters")
    private String description;
}
