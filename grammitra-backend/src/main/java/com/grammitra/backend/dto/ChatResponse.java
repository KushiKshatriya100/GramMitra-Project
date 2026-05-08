package com.grammitra.backend.dto;

import lombok.Data;

@Data
public class ChatResponse {

    // 💬 Bot reply
    private String reply;

    // 🎯 Intent
    private String intent;

    // 📦 Dynamic response data
    private Object data;
}