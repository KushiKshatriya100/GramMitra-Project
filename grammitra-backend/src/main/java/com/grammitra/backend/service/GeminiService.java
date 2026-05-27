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

    /** Intents Gemini is allowed to return. Anything else is coerced to UNKNOWN. */
    private static final Set<String> VALID_INTENTS = Set.of(
            "FIND_WORKER",
            "BOOK_WORKER",
            "CHECK_STATUS",
            "GREETING",
            "HELP",
            "CANCEL",
            "ABOUT_APP",
            "NAVIGATE",
            "UNKNOWN"
    );

    /** Allowed NAVIGATE targets. Anything else is coerced to empty. */
    private static final Set<String> NAVIGATE_TARGETS = Set.of(
            "DASHBOARD", "MY_BOOKINGS", "PROFILE", "EDIT_PROFILE",
            "SERVICES", "ABOUT", "CONTACT", "HOME"
    );

    /**
     * Detect intent from a natural-language message.
     * Returns a map with keys: intent, skill, navigate.
     *   - intent: one of VALID_INTENTS
     *   - skill: canonical SKILLS value (or empty)
     *   - navigate: one of NAVIGATE_TARGETS (or empty)
     */
    public Map<String, Object> detectIntent(String message, String lang) {

        try {
            if (message == null || message.trim().isEmpty()) return fallback();

            String cleaned = message.trim();

            // FAST PATH — match locally without burning API calls or relying on
            // Gemini being reachable. Covers greetings, common navigation
            // phrases, and direct skill mentions.
            Map<String, Object> local = detectLocally(cleaned);
            if (!"UNKNOWN".equals(local.get("intent"))) {
                return local;
            }

            // SLOW PATH — ask Gemini.
            String prompt = buildPrompt(cleaned, lang);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.2,
                            "maxOutputTokens", 200,
                            "responseMimeType", "application/json"
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl + "?key=" + apiKey,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (response.getBody() == null) return fallback();

            List candidates = (List) response.getBody().get("candidates");
            if (candidates == null || candidates.isEmpty()) return fallback();

            Map first = (Map) candidates.get(0);
            Map content = (Map) first.get("content");
            if (content == null) return fallback();

            List parts = (List) content.get("parts");
            if (parts == null || parts.isEmpty()) return fallback();

            String text = (String) ((Map) parts.get(0)).get("text");
            return parseJson(text);

        } catch (HttpClientErrorException.NotFound e) {
            System.err.println("❌ Gemini API 404: Invalid endpoint or model — check gemini.api.url");
            return fallback();
        } catch (HttpClientErrorException.Forbidden e) {
            System.err.println("❌ Gemini API 403: check API key / billing");
            return fallback();
        } catch (Exception e) {
            System.err.println("❌ Gemini Error: " + e.getMessage());
            return fallback();
        }
    }

    private String buildPrompt(String message, String lang) {
        return """
You are the GramMitra in-app assistant. GramMitra connects users with local
service workers (plumbers, electricians, AC technicians, etc.). The user is
typing in %s (English / Hindi / Hinglish — assume mixed).

Return ONLY a single JSON object. No markdown, no commentary.

Schema:
{
  "intent": one of [FIND_WORKER, BOOK_WORKER, CHECK_STATUS, GREETING, HELP,
                    CANCEL, ABOUT_APP, NAVIGATE, UNKNOWN],
  "skill":  canonical English skill from the list below, or "",
  "navigate": one of [DASHBOARD, MY_BOOKINGS, PROFILE, EDIT_PROFILE,
                      SERVICES, ABOUT, CONTACT, HOME], or ""
}

CANONICAL SKILLS (use these exact strings, lowercase English):
%s

Intent rules:
- FIND_WORKER: user wants to find/hire someone for a service.
    Set `skill` to the canonical skill if obvious; otherwise leave "".
    Examples: "I need a plumber", "mujhe ac repair ke liye worker chahiye",
              "ek electrician bhejo", "बिजली वाला चाहिए"
- BOOK_WORKER: user is ready to book the worker they're discussing.
- CHECK_STATUS: user wants to see their bookings / status.
    Examples: "show my bookings", "meri booking ka status", "booking kya hai"
- ABOUT_APP: user is asking what GramMitra is / what it does.
    Examples: "what is grammitra", "ye app kya karta hai", "how does it work"
- NAVIGATE: user wants to be taken somewhere in the app.
    Set `navigate` to the matching target.
      DASHBOARD       — "open my dashboard", "dashboard dikhao"
      MY_BOOKINGS     — "my bookings", "meri bookings"
      PROFILE         — "my profile", "meri profile"
      EDIT_PROFILE    — "edit my profile", "profile update karni hai", "details change karne hain"
      SERVICES        — "all services", "saari sewaayein"
      ABOUT / CONTACT / HOME — analogous
- GREETING: hello / namaste / hi / hey
- HELP: "what can you do", "help me", "kya kar sakte ho"
- CANCEL: "cancel", "rehne do", "nahi chahiye"
- UNKNOWN: everything else.

Hinglish examples (return exactly these objects):

User: "mujhe ac repair ke liye worker chahiye"
{"intent":"FIND_WORKER","skill":"ac repair","navigate":""}

User: "ek plumber bhej do"
{"intent":"FIND_WORKER","skill":"plumbing","navigate":""}

User: "बिजली वाला चाहिए"
{"intent":"FIND_WORKER","skill":"electrical wiring","navigate":""}

User: "meri profile edit karni hai"
{"intent":"NAVIGATE","skill":"","navigate":"EDIT_PROFILE"}

User: "meri bookings dikhao"
{"intent":"NAVIGATE","skill":"","navigate":"MY_BOOKINGS"}

User: "ye app kya karta hai?"
{"intent":"ABOUT_APP","skill":"","navigate":""}

User message:
%s
""".formatted(
                "hi".equalsIgnoreCase(lang) ? "Hindi" : "English (mixed Hindi/Hinglish OK)",
                SkillCatalog.inlineList(),
                message);
    }

    private Map<String, Object> parseJson(String text) {
        try {
            if (text == null || text.trim().isEmpty()) return fallback();

            String cleanJson = text
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            Pattern pattern = Pattern.compile("\\{.*}", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(cleanJson);
            if (!matcher.find()) return fallback();

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

    private Map<String, Object> validateResult(Map<String, Object> result) {
        if (result == null) return fallback();

        String intent = String.valueOf(
                result.getOrDefault("intent", "UNKNOWN")
        ).trim().toUpperCase();
        if (!VALID_INTENTS.contains(intent)) intent = "UNKNOWN";

        String skill = SkillCatalog.canonicalize(
                String.valueOf(result.getOrDefault("skill", ""))
        );

        String navigate = String.valueOf(
                result.getOrDefault("navigate", "")
        ).trim().toUpperCase();
        if (!NAVIGATE_TARGETS.contains(navigate)) navigate = "";

        Map<String, Object> validated = new HashMap<>();
        validated.put("intent", intent);
        validated.put("skill", skill);
        validated.put("navigate", navigate);
        return validated;
    }

    /**
     * Local intent detection so the bot still works when Gemini is down or
     * the user's query is obvious. Returns UNKNOWN to delegate to Gemini.
     */
    private Map<String, Object> detectLocally(String message) {
        String msg = message.toLowerCase().trim();

        // Greeting (multilingual)
        if (msg.matches("^(hi|hii+|hey+|hello|hola|namaste|namaskar|नमस्ते|नमस्कार).*")) {
            return Map.of("intent", "GREETING", "skill", "", "navigate", "");
        }

        // Help
        if (msg.contains("help") || msg.contains("madad") || msg.contains("मदद")) {
            return Map.of("intent", "HELP", "skill", "", "navigate", "");
        }

        // Cancel
        if (msg.equals("cancel") || msg.equals("stop") || msg.contains("rehne do")
                || msg.contains("रहने दो") || msg.contains("nahi chahiye")) {
            return Map.of("intent", "CANCEL", "skill", "", "navigate", "");
        }

        // About app — try fast match before paying for an API call
        if (msg.contains("what is grammitra") || msg.contains("about grammitra")
                || msg.contains("how does it work") || msg.contains("kya karta hai")
                || msg.contains("app kya") || msg.contains("ये एप") || msg.contains("यह ऐप")) {
            return Map.of("intent", "ABOUT_APP", "skill", "", "navigate", "");
        }

        // Navigate — common phrases (English, Hindi, Hinglish)
        if (msg.contains("edit profile") || msg.contains("update profile")
                || msg.contains("profile edit") || msg.contains("profile update")
                || msg.contains("details change") || msg.contains("details update")
                || msg.contains("प्रोफ़ाइल") && (msg.contains("edit") || msg.contains("update") || msg.contains("बदल"))) {
            return Map.of("intent", "NAVIGATE", "skill", "", "navigate", "EDIT_PROFILE");
        }
        if (msg.contains("my profile") || msg.contains("meri profile")
                || msg.equals("profile") || msg.contains("मेरी प्रोफ़ाइल")) {
            return Map.of("intent", "NAVIGATE", "skill", "", "navigate", "PROFILE");
        }
        if (msg.contains("my bookings") || msg.contains("meri booking")
                || msg.contains("मेरी बुकिंग") || msg.contains("booking dikha")) {
            return Map.of("intent", "NAVIGATE", "skill", "", "navigate", "MY_BOOKINGS");
        }
        if (msg.contains("dashboard") || msg.contains("डैशबोर्ड")) {
            return Map.of("intent", "NAVIGATE", "skill", "", "navigate", "DASHBOARD");
        }
        if (msg.contains("all services") || msg.contains("sari sewa")
                || msg.contains("सारी सेवाएं") || msg.contains("सेवाएं दिख")) {
            return Map.of("intent", "NAVIGATE", "skill", "", "navigate", "SERVICES");
        }

        // Booking status
        if (msg.contains("status") || msg.contains("booking status")
                || msg.contains("बुकिंग स्थिति") || msg.contains("kya hua")) {
            return Map.of("intent", "CHECK_STATUS", "skill", "", "navigate", "");
        }

        // Direct skill mention — uses canonical catalog so any of the 39
        // skills + aliases ("plumber", "बिजली", "ac", "tutor", ...) trigger.
        String canonical = SkillCatalog.canonicalize(msg);
        if (!canonical.isEmpty()) {
            return Map.of("intent", "FIND_WORKER", "skill", canonical, "navigate", "");
        }

        // Look for "worker for X" / "X chahiye" / "X ke liye"
        for (String token : msg.split("[\\s,.!?]+")) {
            String hit = SkillCatalog.canonicalize(token);
            if (!hit.isEmpty()) {
                return Map.of("intent", "FIND_WORKER", "skill", hit, "navigate", "");
            }
        }

        return fallback();
    }

    private Map<String, Object> fallback() {
        return Map.of("intent", "UNKNOWN", "skill", "", "navigate", "");
    }
}
