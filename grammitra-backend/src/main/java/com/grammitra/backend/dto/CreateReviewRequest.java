package com.grammitra.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Body schema for POST /review.
 *
 * The reviewer (userId) is intentionally NOT in this DTO — it is derived
 * from the JWT on the server. Accepting it from the client previously
 * meant any logged-in user could attribute reviews to other accounts.
 */
@Data
public class CreateReviewRequest {

    @NotBlank(message = "bookingId is required")
    private String bookingId;

    @Min(value = 1, message = "rating must be between 1 and 5")
    @Max(value = 5, message = "rating must be between 1 and 5")
    private int rating;

    @NotBlank(message = "comment is required")
    @Size(max = 1000, message = "comment must be at most 1000 characters")
    private String comment;
}
