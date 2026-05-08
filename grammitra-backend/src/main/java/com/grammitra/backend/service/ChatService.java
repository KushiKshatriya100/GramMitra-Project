package com.grammitra.backend.service;

import com.grammitra.backend.dto.ChatResponse;
import com.grammitra.backend.dto.WorkerResponse;
import com.grammitra.backend.model.Booking;
import com.grammitra.backend.model.ChatIntent;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final GeminiService geminiService;

    private final WorkerService workerService;

    private final BookingService bookingService;

    // ✅ SESSION MEMORY
    private final ChatSessionService chatSessionService;

    // 🧠 MAIN ENTRY
    public ChatResponse processMessage(
            String message,
            String userId,
            String lang
    ) {

        try {

            // ✅ VALIDATION
            if (message == null || message.trim().isEmpty()) {

                return buildResponse(
                        getMessage("empty_message", normalizeLang(lang)),
                        ChatIntent.UNKNOWN,
                        null
                );
            }

            String cleanedMessage = message.trim();

            System.out.println(
                    "\n================ CHAT REQUEST ================"
            );

            System.out.println("👤 USER: " + userId);
            System.out.println("🌍 LANG: " + lang);
            System.out.println("💬 MESSAGE: " + cleanedMessage);

            String language = normalizeLang(lang);

            // ✅ AI DETECTION
            Map<String, Object> aiResult =
                    geminiService.detectIntent(cleanedMessage);

            System.out.println("🤖 AI RESULT: " + aiResult);

            String intentStr = String.valueOf(
                    aiResult.getOrDefault(
                            "intent",
                            "UNKNOWN"
                    )
            );

            ChatIntent intent =
                    parseIntent(intentStr);

            System.out.println(
                    "🎯 DETECTED INTENT: "
                            + intent
            );

            // ✅ SAVE LAST INTENT
            chatSessionService.saveIntent(
                    userId,
                    intent
            );

            // ✅ ROUTING
            switch (intent) {

                case GREETING:
                    return handleGreeting(language);

                case HELP:
                    return handleHelp(language);

                case CANCEL:
                    return handleCancel(
                            userId,
                            language
                    );

                case FIND_WORKER:
                    return handleFindWorker(
                            aiResult,
                            userId,
                            language
                    );

                case SELECT_WORKER:
                    return handleSelectWorker(
                            cleanedMessage,
                            userId,
                            language
                    );

                case BOOK_WORKER:
                    return handleBookWorker(
                            userId,
                            language
                    );

                case CHECK_STATUS:
                    return handleCheckStatus(
                            userId,
                            language
                    );

                default:
                    return buildResponse(
                            getMessage(
                                    "unknown",
                                    language
                            ),
                            ChatIntent.UNKNOWN,
                            null
                    );
            }

        } catch (Exception e) {

            System.err.println(
                    "❌ CHAT SERVICE ERROR: "
                            + e.getMessage()
            );

            return buildResponse(
                    normalizeLang(lang).equals("hi")
                            ? "कुछ गलत हो गया। कृपया फिर से प्रयास करें।"
                            : "Something went wrong. Please try again.",
                    ChatIntent.UNKNOWN,
                    null
            );
        }
    }

    // 🔍 FIND WORKER
    private ChatResponse handleFindWorker(
            Map<String, Object> aiResult,
            String userId,
            String lang
    ) {

        try {

            String skill = String.valueOf(
                    aiResult.getOrDefault(
                            "skill",
                            ""
                    )
            );

            skill = normalizeSkill(skill);

            System.out.println(
                    "🔎 SEARCH SKILL: "
                            + skill
            );

            if (skill.isBlank()) {

                return buildResponse(
                        getMessage(
                                "ask_skill",
                                lang
                        ),
                        ChatIntent.FIND_WORKER,
                        Collections.emptyList()
                );
            }

            List<WorkerResponse> workers =
                    workerService.searchWorkersBySkillForChat(
                            skill,
                            lang
                    );

            System.out.println(
                    "👷 WORKERS FOUND: "
                            + workers.size()
            );

            // ✅ SAVE SESSION MEMORY
            chatSessionService.saveWorkers(
                    userId,
                    workers
            );

            chatSessionService.saveSkill(
                    userId,
                    skill
            );

            if (workers.isEmpty()) {

                return buildResponse(
                        getMessage(
                                "no_workers",
                                lang
                        ),
                        ChatIntent.FIND_WORKER,
                        Collections.emptyList()
                );
            }

            return buildResponse(
                    getMessage(
                            "workers_found",
                            lang
                    ),
                    ChatIntent.FIND_WORKER,
                    workers
            );

        } catch (Exception e) {

            System.err.println(
                    "❌ FIND WORKER ERROR: "
                            + e.getMessage()
            );

            return buildResponse(
                    getMessage(
                            "worker_error",
                            lang
                    ),
                    ChatIntent.FIND_WORKER,
                    Collections.emptyList()
            );
        }
    }

    // 👷 SELECT WORKER
    private ChatResponse handleSelectWorker(
            String message,
            String userId,
            String lang
    ) {

        try {

            List<WorkerResponse> workers =
                    chatSessionService.getLastWorkers(
                            userId
                    );

            if (workers == null
                    || workers.isEmpty()) {

                return buildResponse(
                        lang.equals("hi")
                                ? "पहले कामगार खोजिए।"
                                : "Please search workers first.",
                        ChatIntent.SELECT_WORKER,
                        null
                );
            }

            int selectedIndex =
                    extractWorkerIndex(message);

            if (selectedIndex < 0
                    || selectedIndex >= workers.size()) {

                return buildResponse(
                        lang.equals("hi")
                                ? "कृपया सही कामगार चुनें।"
                                : "Please select a valid worker.",
                        ChatIntent.SELECT_WORKER,
                        workers
                );
            }

            WorkerResponse selectedWorker =
                    workers.get(selectedIndex);

            // ✅ SAVE SELECTED WORKER
            chatSessionService.saveSelectedWorker(
                    userId,
                    selectedWorker
            );

            return buildResponse(
                    lang.equals("hi")
                            ? "कामगार चयनित किया गया। अब बुकिंग कर सकते हैं।"
                            : "Worker selected successfully. You can now proceed with booking.",
                    ChatIntent.SELECT_WORKER,
                    selectedWorker
            );

        } catch (Exception e) {

            System.err.println(
                    "❌ SELECT WORKER ERROR: "
                            + e.getMessage()
            );

            return buildResponse(
                    getMessage(
                            "unknown",
                            lang
                    ),
                    ChatIntent.UNKNOWN,
                    null
            );
        }
    }

    // 📅 BOOK WORKER
    private ChatResponse handleBookWorker(
            String userId,
            String lang
    ) {

        WorkerResponse selectedWorker =
                chatSessionService.getSelectedWorker(
                        userId
                );

        if (selectedWorker == null) {

            return buildResponse(
                    lang.equals("hi")
                            ? "कृपया पहले कामगार चुनें।"
                            : "Please select a worker first.",
                    ChatIntent.BOOK_WORKER,
                    null
            );
        }

        return buildResponse(
                getMessage(
                        "book_instruction",
                        lang
                ),
                ChatIntent.BOOK_WORKER,
                selectedWorker
        );
    }

    // 📊 CHECK STATUS
    private ChatResponse handleCheckStatus(
            String userId,
            String lang
    ) {

        try {

            System.out.println(
                    "📊 CHECKING BOOKING STATUS"
            );

            Booking booking =
                    bookingService.getBookingStatusByUserId(
                            userId
                    );

            if (booking == null) {

                return buildResponse(
                        getMessage(
                                "no_booking",
                                lang
                        ),
                        ChatIntent.CHECK_STATUS,
                        null
                );
            }

            String statusMessage =
                    getMessage(
                            "booking_status",
                            lang
                    )
                            + " "
                            + booking.getStatus();

            return buildResponse(
                    statusMessage,
                    ChatIntent.CHECK_STATUS,
                    booking
            );

        } catch (Exception e) {

            System.err.println(
                    "❌ CHECK STATUS ERROR: "
                            + e.getMessage()
            );

            return buildResponse(
                    getMessage(
                            "status_error",
                            lang
                    ),
                    ChatIntent.CHECK_STATUS,
                    null
            );
        }
    }

    // 👋 GREETING
    private ChatResponse handleGreeting(
            String lang
    ) {

        return buildResponse(
                getMessage(
                        "greeting",
                        lang
                ),
                ChatIntent.GREETING,
                null
        );
    }

    // ❓ HELP
    private ChatResponse handleHelp(
            String lang
    ) {

        return buildResponse(
                getMessage(
                        "help",
                        lang
                ),
                ChatIntent.HELP,
                null
        );
    }

    // ❌ CANCEL
    private ChatResponse handleCancel(
            String userId,
            String lang
    ) {

        // ✅ CLEAR SESSION
        chatSessionService.clearSession(userId);

        return buildResponse(
                getMessage(
                        "cancel",
                        lang
                ),
                ChatIntent.CANCEL,
                null
        );
    }

    // 🔢 EXTRACT WORKER INDEX
    private int extractWorkerIndex(
            String message
    ) {

        if (message == null) {
            return -1;
        }

        String lower =
                message.toLowerCase();

        if (lower.contains("first")
                || lower.contains("1")) {

            return 0;
        }

        if (lower.contains("second")
                || lower.contains("2")) {

            return 1;
        }

        if (lower.contains("third")
                || lower.contains("3")) {

            return 2;
        }

        if (lower.contains("fourth")
                || lower.contains("4")) {

            return 3;
        }

        if (lower.contains("fifth")
                || lower.contains("5")) {

            return 4;
        }

        return -1;
    }

    // ✅ RESPONSE BUILDER
    private ChatResponse buildResponse(
            String reply,
            ChatIntent intent,
            Object data
    ) {

        ChatResponse response =
                new ChatResponse();

        response.setReply(reply);

        response.setIntent(
                intent.name()
        );

        response.setData(data);

        return response;
    }

    // ✅ INTENT PARSER
    private ChatIntent parseIntent(
            String intentStr
    ) {

        try {

            return ChatIntent.valueOf(
                    intentStr
                            .toUpperCase()
                            .trim()
            );

        } catch (Exception e) {

            return ChatIntent.UNKNOWN;
        }
    }

    // ✅ LANGUAGE NORMALIZER
    private String normalizeLang(
            String lang
    ) {

        if (lang == null
                || lang.isBlank()) {

            return "en";
        }

        return lang.toLowerCase()
                .startsWith("hi")
                ? "hi"
                : "en";
    }

    // ✅ SKILL NORMALIZER
    private String normalizeSkill(
            String skill
    ) {

        if (skill == null) {
            return "";
        }

        skill = skill.trim()
                .toLowerCase();

        return switch (skill) {

            case "electric",
                 "electrician",
                 "wiring",
                 "bijli",
                 "बिजली वाला",
                 "इलेक्ट्रीशियन"
                    -> "electrician";

            case "plumbing",
                 "pipe",
                 "pipe repair",
                 "plumber",
                 "प्लंबर"
                    -> "plumber";

            case "carpentry",
                 "woodwork",
                 "carpenter",
                 "बढ़ई"
                    -> "carpenter";

            case "maid",
                 "cleaner",
                 "housekeeping",
                 "safai",
                 "कामवाली"
                    -> "housekeeping";

            default -> skill;
        };
    }

    // 🌍 LOCALIZED MESSAGES
    private String getMessage(
            String key,
            String lang
    ) {

        boolean hi =
                "hi".equals(lang);

        return switch (key) {

            case "greeting" ->
                    hi
                            ? "नमस्ते 🙏 मैं GramMitra सहायक हूँ।"
                            : "Hello 👋 I am GramMitra assistant.";

            case "help" ->
                    hi
                            ? "आप प्लंबर, इलेक्ट्रीशियन, बढ़ई आदि खोज सकते हैं।"
                            : "You can search plumber, electrician, carpenter and more.";

            case "cancel" ->
                    hi
                            ? "प्रक्रिया रद्द कर दी गई।"
                            : "Process cancelled.";

            case "workers_found" ->
                    hi
                            ? "यहाँ उपलब्ध कामगार हैं 👇"
                            : "Here are available workers 👇";

            case "no_workers" ->
                    hi
                            ? "कोई कामगार नहीं मिला।"
                            : "No workers found.";

            case "ask_skill" ->
                    hi
                            ? "कौन सा कामगार चाहिए?"
                            : "What type of worker do you need?";

            case "book_instruction" ->
                    hi
                            ? "बुकिंग प्रक्रिया शुरू की जा सकती है।"
                            : "Booking process can now begin.";

            case "no_booking" ->
                    hi
                            ? "कोई बुकिंग नहीं मिली।"
                            : "No booking found.";

            case "booking_status" ->
                    hi
                            ? "बुकिंग स्थिति:"
                            : "Booking status:";

            case "worker_error" ->
                    hi
                            ? "कामगार खोजने में समस्या हुई।"
                            : "Error while searching workers.";

            case "status_error" ->
                    hi
                            ? "बुकिंग स्थिति प्राप्त नहीं हुई।"
                            : "Unable to fetch booking status.";

            case "empty_message" ->
                    hi
                            ? "कृपया संदेश लिखें।"
                            : "Please enter a message.";

            default ->
                    hi
                            ? "मैं समझ नहीं पाया।"
                            : "I didn't understand.";
        };
    }
}