package com.grammitra.backend.dto;

import lombok.Data;

@Data
public class ChatRequest {

    // 💬 User message
    private String message;

    // 🌍 Optional language
    private String lang;
}