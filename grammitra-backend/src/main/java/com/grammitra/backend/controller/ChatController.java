package com.grammitra.backend.controller;

import com.grammitra.backend.dto.ChatRequest;
import com.grammitra.backend.dto.ChatResponse;
import com.grammitra.backend.model.ChatIntent;
import com.grammitra.backend.service.ChatService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // 🧠 MAIN CHAT ENDPOINT
    @PostMapping
    public ResponseEntity<ChatResponse> handleChat(

            @RequestBody(required = false)
            ChatRequest request,

            Authentication auth,

            @RequestHeader(
                    value = "Accept-Language",
                    required = false
            )
            String lang
    ) {

        try {

            System.out.println("\n================ CHAT API =================");

            // 🔐 AUTH VALIDATION
            if (auth == null || auth.getName() == null) {

                System.out.println("❌ Unauthorized chat request");

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(buildErrorResponse(
                                "Unauthorized access"
                        ));
            }

            String userId = auth.getName();

            // ✅ REQUEST VALIDATION
            if (request == null) {

                System.out.println("❌ Chat request body missing");

                return ResponseEntity
                        .badRequest()
                        .body(buildErrorResponse(
                                "Request body is missing"
                        ));
            }

            String message = request.getMessage();

            // ✅ MESSAGE VALIDATION
            if (message == null || message.trim().isEmpty()) {

                System.out.println("⚠️ Empty chat message");

                return ResponseEntity
                        .badRequest()
                        .body(buildErrorResponse(
                                normalizeLang(lang).equals("hi")
                                        ? "कृपया कोई संदेश लिखें।"
                                        : "Please enter a message."
                        ));
            }

            String cleanedMessage = message.trim();

            // 🌍 LANGUAGE NORMALIZATION
            String language = normalizeLang(lang);

            // 🔍 STRUCTURED LOGGING
            System.out.println("👤 USER ID: " + userId);
            System.out.println("🌍 LANGUAGE: " + language);
            System.out.println("💬 MESSAGE: " + cleanedMessage);

            // 🚀 CHAT SERVICE
            ChatResponse response = chatService.processMessage(
                    cleanedMessage,
                    userId,
                    language
            );

            // ✅ SAFETY FALLBACK
            if (response == null) {

                System.out.println("⚠️ Null response from ChatService");

                return ResponseEntity.ok(
                        buildErrorResponse(
                                language.equals("hi")
                                        ? "कोई उत्तर प्राप्त नहीं हुआ।"
                                        : "No response received."
                        )
                );
            }

            // ✅ SUCCESS LOG
            System.out.println("✅ CHAT RESPONSE SENT");
            System.out.println("🎯 INTENT: " + response.getIntent());

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            System.err.println("❌ CHAT CONTROLLER ERROR: "
                    + e.getMessage());

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            buildErrorResponse(
                                    normalizeLang(lang).equals("hi")
                                            ? "सर्वर त्रुटि हुई। कृपया पुनः प्रयास करें।"
                                            : "Server error occurred. Please try again."
                            )
                    );
        }
    }

    // ✅ LANGUAGE NORMALIZER
    private String normalizeLang(String lang) {

        if (lang == null || lang.isBlank()) {
            return "en";
        }

        return lang.toLowerCase().startsWith("hi")
                ? "hi"
                : "en";
    }

    // ✅ ERROR RESPONSE BUILDER
    private ChatResponse buildErrorResponse(
            String message
    ) {

        ChatResponse response = new ChatResponse();

        response.setReply(message);

        response.setIntent(
                ChatIntent.UNKNOWN.name()
        );

        response.setData(null);

        return response;
    }
}