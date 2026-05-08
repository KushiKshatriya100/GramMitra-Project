package com.grammitra.backend.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {

    // GeoJSON standard (useful for Mongo geospatial queries later)
    private String type = "Point";

    // [longitude, latitude] (IMPORTANT: order matters in GeoJSON)
    private double[] coordinates;

    // 🔥 Helper method (safe + readable)
    public String toReadableString() {
        if (coordinates == null || coordinates.length < 2) {
            return "Unknown";
        }
        return coordinates[1] + ", " + coordinates[0];
    }

    // 🔥 NEW: factory method (optional but useful)
    public static Location fromLatLng(double latitude, double longitude) {
        return new Location("Point", new double[]{longitude, latitude});
    }
}