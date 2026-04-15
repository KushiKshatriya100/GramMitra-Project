package com.grammitra.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {

    private String type = "Point"; // GeoJSON type

    // [longitude, latitude]
    private double[] coordinates;

    // ✅ NEW: helper method to return readable location
    public String toReadableString() {
        if (coordinates == null || coordinates.length < 2) {
            return "Unknown";
        }
        return coordinates[1] + ", " + coordinates[0]; // lat, lng
    }
}