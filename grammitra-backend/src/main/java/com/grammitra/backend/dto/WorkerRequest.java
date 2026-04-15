package com.grammitra.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class WorkerRequest {

    private List<String> skills;
    private double wage;
    private boolean availability;
}