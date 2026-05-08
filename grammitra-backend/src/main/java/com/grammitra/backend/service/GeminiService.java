package com.grammitra.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ✅ Allowed intents
    private static final Set<String> VALID_INTENTS = Set.of(
            "FIND_WORKER",
            "BOOK_WORKER",
            "CHECK_STATUS",
            "GREETING",
            "HELP",
            "CANCEL",
            "UNKNOWN"
    );

    // ✅ Main chatbot method
    public Map<String, Object> detectIntent(String message) {

        try {

            if (message == null || message.trim().isEmpty()) {
                return fallback();
            }

            String cleanedMessage = message.trim();

            // ✅ LOCAL FALLBACK FIRST (FAST + RELIABLE)
            Map<String, Object> localResult = detectLocally(cleanedMessage);

            if (!"UNKNOWN".equals(localResult.get("intent"))) {
                return localResult;
            }

            // ✅ Gemini Prompt
            String prompt = buildPrompt(cleanedMessage);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "parts",
                                    List.of(
                                            Map.of("text", prompt)
                                    )
                            )
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl + "?key=" + apiKey,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getBody() == null) {
                return fallback();
            }

            List candidates = (List) response.getBody().get("candidates");

            if (candidates == null || candidates.isEmpty()) {
                return fallback();
            }

            Map first = (Map) candidates.get(0);

            Map content = (Map) first.get("content");

            if (content == null) {
                return fallback();
            }

            List parts = (List) content.get("parts");

            if (parts == null || parts.isEmpty()) {
                return fallback();
            }

            String text = (String) ((Map) parts.get(0)).get("text");

            return parseJson(text);

        } catch (HttpClientErrorException.NotFound e) {

            System.err.println("❌ Gemini API 404: Invalid endpoint or model");

            return fallback();

        } catch (Exception e) {

            System.err.println("❌ Gemini Error: " + e.getMessage());

            return fallback();
        }
    }

    // ✅ Prompt Engineering
    private String buildPrompt(String message) {

        return """
You are GramMitra AI assistant.

Your task:
Detect user intent and extract worker skill.

Return ONLY valid JSON.

Allowed intents:
- FIND_WORKER
- BOOK_WORKER
- CHECK_STATUS
- GREETING
- HELP
- CANCEL
- UNKNOWN

CRITICAL RULES:
1. Output ONLY JSON.
2. Do NOT add markdown.
3. Do NOT explain anything.
4. skill must ALWAYS be lowercase English.
5. If no skill exists, use empty string.
6. Hindi queries must be converted into English skills.

Examples:

User: I need a plumber
Response:
{
  "intent":"FIND_WORKER",
  "skill":"plumber"
}

User: मुझे बिजली वाला चाहिए
Response:
{
  "intent":"FIND_WORKER",
  "skill":"electrician"
}

User: book worker
Response:
{
  "intent":"BOOK_WORKER",
  "skill":""
}

User: check my booking
Response:
{
  "intent":"CHECK_STATUS",
  "skill":""
}

User: hello
Response:
{
  "intent":"GREETING",
  "skill":""
}

User message:
""" + message;
    }

    // ✅ JSON Parser
    private Map<String, Object> parseJson(String text) {

        try {

            if (text == null || text.trim().isEmpty()) {
                return fallback();
            }

            // ✅ Remove markdown safely
            String cleanJson = text
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            // ✅ Extract JSON using regex
            Pattern pattern = Pattern.compile("\\{.*}", Pattern.DOTALL);

            Matcher matcher = pattern.matcher(cleanJson);

            if (!matcher.find()) {
                return fallback();
            }

            String json = matcher.group();

            Map<String, Object> result = objectMapper.readValue(
                    json,
                    new TypeReference<Map<String, Object>>() {}
            );

            return validateResult(result);

        } catch (Exception e) {

            System.out.println("⚠️ JSON parse failed: " + e.getMessage());

            return fallback();
        }
    }

    // ✅ Validate AI response
    private Map<String, Object> validateResult(Map<String, Object> result) {

        if (result == null) {
            return fallback();
        }

        String intent = String.valueOf(
                result.getOrDefault("intent", "UNKNOWN")
        ).trim().toUpperCase();

        if (!VALID_INTENTS.contains(intent)) {
            intent = "UNKNOWN";
        }

        String skill = String.valueOf(
                result.getOrDefault("skill", "")
        );

        skill = normalizeSkill(skill);

        Map<String, Object> validated = new HashMap<>();

        validated.put("intent", intent);
        validated.put("skill", skill);

        return validated;
    }

    // ✅ Skill Normalization
    private String normalizeSkill(String skill) {

        if (skill == null) {
            return "";
        }

        skill = skill.trim().toLowerCase();

        Map<String, String> skillMap = new HashMap<>();

        // English synonyms
        skillMap.put("plumbing", "plumber");
        skillMap.put("pipe", "plumber");
        skillMap.put("pipe repair", "plumber");

        skillMap.put("electric", "electrician");
        skillMap.put("wiring", "electrician");
        skillMap.put("bijli", "electrician");

        skillMap.put("carpentry", "carpenter");
        skillMap.put("woodwork", "carpenter");

        skillMap.put("maid", "housekeeping");
        skillMap.put("cleaner", "housekeeping");

        // Hindi support
        skillMap.put("प्लंबर", "plumber");
        skillMap.put("बिजली", "electrician");
        skillMap.put("बढ़ई", "carpenter");

        return skillMap.getOrDefault(skill, skill);
    }

    // ✅ Local Intent Detection
    private Map<String, Object> detectLocally(String message) {

        String msg = message.toLowerCase();

        // Greeting
        if (
                msg.contains("hello") ||
                        msg.contains("hi") ||
                        msg.contains("hey") ||
                        msg.contains("namaste") ||
                        msg.contains("नमस्ते")
        ) {

            return Map.of(
                    "intent", "GREETING",
                    "skill", ""
            );
        }

        // Booking status
        if (
                msg.contains("status") ||
                        msg.contains("booking") ||
                        msg.contains("my booking")
        ) {

            return Map.of(
                    "intent", "CHECK_STATUS",
                    "skill", ""
            );
        }

        // Worker search
        List<String> skills = List.of(
                "plumber",
                "electrician",
                "carpenter",
                "housekeeping",
                "maid"
        );

        for (String skill : skills) {

            if (msg.contains(skill)) {

                return Map.of(
                        "intent", "FIND_WORKER",
                        "skill", skill
                );
            }
        }

        return fallback();
    }

    // ✅ Fallback
    private Map<String, Object> fallback() {

        return Map.of(
                "intent", "UNKNOWN",
                "skill", ""
        );
    }
}