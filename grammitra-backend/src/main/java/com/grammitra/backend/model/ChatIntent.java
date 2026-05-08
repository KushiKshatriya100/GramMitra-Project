package com.grammitra.backend.model;

/**
 * 🧠 Chatbot Intent Enum
 *
 * Used to map AI-detected intent → system action.
 *
 * IMPORTANT:
 * These values MUST match exactly with Gemini JSON output.
 */
public enum ChatIntent {

    // 🔍 Search workers
    FIND_WORKER,

    // 📅 Booking flow
    BOOK_WORKER,

    // 📊 Booking status
    CHECK_STATUS,

    // 👋 Greetings
    GREETING,

    // ❓ Help request
    HELP,

    // ❌ Cancel conversation flow
    CANCEL,

    // 👷 Select worker from previous results
    SELECT_WORKER,

    // ❓ Unknown intent
    UNKNOWN
}