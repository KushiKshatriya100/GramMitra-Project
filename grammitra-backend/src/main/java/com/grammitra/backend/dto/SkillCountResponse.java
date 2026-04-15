package com.grammitra.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SkillCountResponse {

    private String skill;
    private long count;
}