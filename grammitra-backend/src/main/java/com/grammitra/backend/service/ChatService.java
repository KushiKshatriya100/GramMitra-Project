package com.grammitra.backend.service;

import com.grammitra.backend.dto.ChatResponse;
import com.grammitra.backend.dto.WorkerResponse;
import com.grammitra.backend.model.Booking;
import com.grammitra.backend.model.ChatIntent;
import com.grammitra.backend.model.User;
import com.grammitra.backend.repository.UserRepository;

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
    private final ChatSessionService chatSessionService;
    private final UserRepository userRepository;

    /** Entry point invoked by ChatController. */
    public ChatResponse processMessage(String message, String userId, String lang) {

        try {
            if (message == null || message.trim().isEmpty()) {
                return buildResponse(
                        getMessage("empty_message", lang),
                        ChatIntent.UNKNOWN, null, null, null);
            }

            String cleaned = message.trim();
            String language = normalizeLang(lang);
            String role = resolveRole(userId);

            System.out.println("\n================ CHAT REQUEST ================");
            System.out.println("👤 USER: " + userId + "  (role=" + role + ")");
            System.out.println("🌍 LANG: " + language);
            System.out.println("💬 MESSAGE: " + cleaned);

            Map<String, Object> aiResult = geminiService.detectIntent(cleaned, language);
            System.out.println("🤖 AI RESULT: " + aiResult);

            ChatIntent intent = parseIntent(String.valueOf(aiResult.getOrDefault("intent", "UNKNOWN")));
            chatSessionService.saveIntent(userId, intent);

            return switch (intent) {
                case GREETING     -> handleGreeting(language);
                case HELP         -> handleHelp(language);
                case CANCEL       -> handleCancel(userId, language);
                case ABOUT_APP    -> handleAboutApp(language);
                case NAVIGATE     -> handleNavigate(aiResult, role, language);
                case FIND_WORKER  -> handleFindWorker(aiResult, userId, role, language);
                case SELECT_WORKER -> handleSelectWorker(cleaned, userId, language);
                case BOOK_WORKER  -> handleBookWorker(userId, language);
                case CHECK_STATUS -> handleCheckStatus(userId, role, language);
                default           -> buildResponse(getMessage("unknown", language),
                        ChatIntent.UNKNOWN, null, null, null);
            };

        } catch (Exception e) {
            System.err.println("❌ CHAT SERVICE ERROR: " + e.getMessage());
            return buildResponse(
                    getMessage("server_error", lang),
                    ChatIntent.UNKNOWN, null, null, null);
        }
    }

    // ─────────────────────── handlers ───────────────────────

    private ChatResponse handleFindWorker(
            Map<String, Object> aiResult, String userId, String role, String lang
    ) {
        try {
            String skill = SkillCatalog.canonicalize(
                    String.valueOf(aiResult.getOrDefault("skill", "")));

            System.out.println("🔎 CANONICAL SKILL: " + skill);

            if (skill.isBlank()) {
                return buildResponse(
                        getMessage("ask_skill", lang),
                        ChatIntent.FIND_WORKER,
                        Collections.emptyList(),
                        null, null);
            }

            String slug = SkillCatalog.slug(skill);

            List<WorkerResponse> workers =
                    workerService.searchWorkersBySkillForChat(skill, lang);

            System.out.println("👷 WORKERS FOUND: " + workers.size());

            chatSessionService.saveWorkers(userId, workers);
            chatSessionService.saveSkill(userId, skill);

            String reply = workers.isEmpty()
                    ? getMessage("no_workers", lang)
                    : getMessage("workers_found", lang);

            // Always include navigatePath even when empty — the chatbot can
            // still offer "View all <skill> workers" which leads to a richer
            // results page with filters.
            return buildResponse(
                    reply,
                    ChatIntent.FIND_WORKER,
                    workers.isEmpty() ? Collections.emptyList() : workers,
                    "/services/" + slug,
                    slug);

        } catch (Exception e) {
            System.err.println("❌ FIND WORKER ERROR: " + e.getMessage());
            return buildResponse(
                    getMessage("worker_error", lang),
                    ChatIntent.FIND_WORKER,
                    Collections.emptyList(),
                    null, null);
        }
    }

    private ChatResponse handleNavigate(
            Map<String, Object> aiResult, String role, String lang
    ) {
        String target = String.valueOf(aiResult.getOrDefault("navigate", "")).toUpperCase();
        String safeRole = role == null ? "user" : role.toLowerCase();

        String path;
        String replyKey;
        switch (target) {
            case "DASHBOARD"     -> { path = "/dashboard/" + safeRole;            replyKey = "nav_dashboard"; }
            case "MY_BOOKINGS"   -> { path = "/dashboard/" + safeRole;            replyKey = "nav_bookings"; }
            case "PROFILE"       -> { path = "/dashboard/" + safeRole + "/profile"; replyKey = "nav_profile"; }
            case "EDIT_PROFILE"  -> { path = "/dashboard/" + safeRole + "/profile/edit"; replyKey = "nav_edit"; }
            case "SERVICES"      -> { path = "/services";  replyKey = "nav_services"; }
            case "ABOUT"         -> { path = "/about";     replyKey = "nav_about"; }
            case "CONTACT"       -> { path = "/contact";   replyKey = "nav_contact"; }
            case "HOME"          -> { path = "/";          replyKey = "nav_home"; }
            default              -> { path = null;         replyKey = "unknown"; }
        }

        return buildResponse(
                getMessage(replyKey, lang),
                ChatIntent.NAVIGATE,
                null,
                path,
                null);
    }

    private ChatResponse handleAboutApp(String lang) {
        return buildResponse(
                getMessage("about_app", lang),
                ChatIntent.ABOUT_APP,
                null,
                "/about",
                null);
    }

    private ChatResponse handleSelectWorker(String message, String userId, String lang) {
        try {
            List<WorkerResponse> workers = chatSessionService.getLastWorkers(userId);
            if (workers == null || workers.isEmpty()) {
                return buildResponse(
                        getMessage("search_first", lang),
                        ChatIntent.SELECT_WORKER, null, null, null);
            }

            int idx = extractWorkerIndex(message);
            if (idx < 0 || idx >= workers.size()) {
                return buildResponse(
                        getMessage("pick_valid", lang),
                        ChatIntent.SELECT_WORKER, workers, null, null);
            }

            WorkerResponse selected = workers.get(idx);
            chatSessionService.saveSelectedWorker(userId, selected);

            return buildResponse(
                    getMessage("worker_selected", lang),
                    ChatIntent.SELECT_WORKER, selected,
                    "/worker/" + selected.getId(), null);

        } catch (Exception e) {
            System.err.println("❌ SELECT WORKER ERROR: " + e.getMessage());
            return buildResponse(getMessage("unknown", lang),
                    ChatIntent.UNKNOWN, null, null, null);
        }
    }

    private ChatResponse handleBookWorker(String userId, String lang) {
        WorkerResponse selected = chatSessionService.getSelectedWorker(userId);
        if (selected == null) {
            return buildResponse(
                    getMessage("select_first", lang),
                    ChatIntent.BOOK_WORKER, null, null, null);
        }

        return buildResponse(
                getMessage("book_instruction", lang),
                ChatIntent.BOOK_WORKER, selected,
                "/worker/" + selected.getId(), null);
    }

    private ChatResponse handleCheckStatus(String userId, String role, String lang) {
        try {
            Booking booking = bookingService.getBookingStatusByUserId(userId);
            String safeRole = role == null ? "user" : role.toLowerCase();
            String dashboardPath = "/dashboard/" + safeRole;

            if (booking == null) {
                return buildResponse(
                        getMessage("no_booking", lang),
                        ChatIntent.CHECK_STATUS, null, dashboardPath, null);
            }

            String statusMessage = getMessage("booking_status", lang) + " " + booking.getStatus();
            return buildResponse(statusMessage, ChatIntent.CHECK_STATUS, booking,
                    dashboardPath, null);

        } catch (Exception e) {
            System.err.println("❌ CHECK STATUS ERROR: " + e.getMessage());
            return buildResponse(getMessage("status_error", lang),
                    ChatIntent.CHECK_STATUS, null, null, null);
        }
    }

    private ChatResponse handleGreeting(String lang) {
        return buildResponse(getMessage("greeting", lang), ChatIntent.GREETING, null, null, null);
    }

    private ChatResponse handleHelp(String lang) {
        return buildResponse(getMessage("help", lang), ChatIntent.HELP, null, null, null);
    }

    private ChatResponse handleCancel(String userId, String lang) {
        chatSessionService.clearSession(userId);
        return buildResponse(getMessage("cancel", lang), ChatIntent.CANCEL, null, null, null);
    }

    // ─────────────────────── helpers ───────────────────────

    private int extractWorkerIndex(String message) {
        if (message == null) return -1;
        String lower = message.toLowerCase();
        if (lower.contains("first")  || lower.contains("1") || lower.contains("पहला")) return 0;
        if (lower.contains("second") || lower.contains("2") || lower.contains("दूसरा")) return 1;
        if (lower.contains("third")  || lower.contains("3") || lower.contains("तीसरा")) return 2;
        if (lower.contains("fourth") || lower.contains("4")) return 3;
        if (lower.contains("fifth")  || lower.contains("5")) return 4;
        return -1;
    }

    private ChatResponse buildResponse(
            String reply, ChatIntent intent, Object data,
            String navigatePath, String skillSlug
    ) {
        ChatResponse response = new ChatResponse();
        response.setReply(reply);
        response.setIntent(intent.name());
        response.setData(data);
        response.setNavigatePath(navigatePath);
        response.setSkillSlug(skillSlug);
        return response;
    }

    private ChatIntent parseIntent(String intentStr) {
        try {
            return ChatIntent.valueOf(intentStr.toUpperCase().trim());
        } catch (Exception e) {
            return ChatIntent.UNKNOWN;
        }
    }

    private String normalizeLang(String lang) {
        if (lang == null || lang.isBlank()) return "en";
        return lang.toLowerCase().startsWith("hi") ? "hi" : "en";
    }

    /** Best-effort role lookup so dashboard paths are correct per-user. */
    private String resolveRole(String userId) {
        try {
            return userRepository.findByLoginId(userId)
                    .map(User::getRole)
                    .map(String::toLowerCase)
                    .orElse("user");
        } catch (Exception e) {
            return "user";
        }
    }

    // ─────────────────────── localized strings ───────────────────────

    private String getMessage(String key, String lang) {
        boolean hi = "hi".equals(normalizeLang(lang));
        return switch (key) {

            case "greeting"          -> hi ? "नमस्ते 🙏 मैं GramMitra सहायक हूँ। आप क्या खोज रहे हैं?"
                                           : "Hello 👋 I am the GramMitra assistant. What can I help you find?";

            case "help"              -> hi ? "मैं ये कर सकता हूँ:\n• कामगार खोजना (जैसे \"AC रिपेयर वाला चाहिए\")\n• आपकी बुकिंग की स्थिति\n• डैशबोर्ड / प्रोफ़ाइल पर ले जाना\n• प्रोफ़ाइल विवरण बदलना"
                                           : "Here's what I can do:\n• Find a worker (e.g. \"I need an AC repair worker\")\n• Check your booking status\n• Take you to your dashboard or profile\n• Help edit your profile details";

            case "cancel"            -> hi ? "ठीक है, रद्द कर दिया।" : "Okay, cancelled.";

            case "workers_found"     -> hi ? "ये रहे आपके लिए उपलब्ध कामगार 👇" : "Here are the workers available for you 👇";
            case "no_workers"        -> hi ? "अभी इस सेवा के लिए कोई कामगार नहीं मिला। मैं आपको पूरी सूची पर ले चलूँ?"
                                           : "No workers are available for that service right now. Want me to open the full list?";
            case "ask_skill"         -> hi ? "किस तरह का कामगार चाहिए? जैसे — AC रिपेयर, प्लंबिंग, इलेक्ट्रिकल वायरिंग..."
                                           : "Which service do you need? e.g. AC repair, plumbing, electrical wiring…";

            case "book_instruction"  -> hi ? "ठीक है — बुकिंग पेज खोलते हैं।" : "Great — let me open the booking page.";
            case "select_first"      -> hi ? "पहले कोई कामगार चुनिए।"     : "Please select a worker first.";
            case "search_first"      -> hi ? "पहले कामगार खोजिए।"          : "Please search for workers first.";
            case "pick_valid"        -> hi ? "कृपया सही कामगार चुनें।"     : "Please select a valid worker.";
            case "worker_selected"   -> hi ? "कामगार चयनित किया गया।"      : "Worker selected.";

            case "no_booking"        -> hi ? "कोई बुकिंग नहीं मिली। चाहें तो डैशबोर्ड खोल दूँ?"
                                           : "No bookings found. Want me to open your dashboard?";
            case "booking_status"    -> hi ? "आपकी बुकिंग की स्थिति:"      : "Your booking status:";
            case "status_error"      -> hi ? "बुकिंग स्थिति प्राप्त नहीं हो सकी।" : "Couldn't fetch your booking status.";

            case "worker_error"      -> hi ? "कामगार खोजने में समस्या हुई।" : "Trouble searching workers.";
            case "empty_message"     -> hi ? "कृपया कोई संदेश लिखें।"      : "Please type a message.";
            case "server_error"      -> hi ? "कुछ गलत हो गया। कृपया फिर से प्रयास करें।" : "Something went wrong. Please try again.";

            case "about_app"         -> hi ? "GramMitra एक प्लेटफ़ॉर्म है जो गाँवों और छोटे शहरों के लोगों को भरोसेमंद स्थानीय कामगारों (इलेक्ट्रीशियन, प्लंबर, मेड, कुक आदि) से जोड़ता है। हमें उपयोगकर्ता और कामगार दोनों मिलकर बेहतर बनाते हैं।"
                                           : "GramMitra connects villages and small towns with trusted local workers — electricians, plumbers, maids, cooks, AC technicians and more. Search by skill, view profiles, and book directly.";

            case "nav_dashboard"     -> hi ? "आपका डैशबोर्ड खोला जा रहा है।"   : "Opening your dashboard.";
            case "nav_bookings"      -> hi ? "आपकी बुकिंग्स खोली जा रही हैं।"  : "Opening your bookings.";
            case "nav_profile"       -> hi ? "आपकी प्रोफ़ाइल खोली जा रही है।"  : "Opening your profile.";
            case "nav_edit"          -> hi ? "प्रोफ़ाइल संपादन खोला जा रहा है।" : "Opening profile editor.";
            case "nav_services"      -> hi ? "सभी सेवाएँ दिखाई जा रही हैं।"     : "Showing all services.";
            case "nav_about"         -> hi ? "GramMitra के बारे में।"          : "About GramMitra.";
            case "nav_contact"       -> hi ? "संपर्क पेज।"                    : "Contact page.";
            case "nav_home"          -> hi ? "होम पेज।"                       : "Home page.";

            default                  -> hi ? "मैं समझ नहीं पाया। कृपया दोबारा कोशिश करें।"
                                           : "I didn't understand. Please try again.";
        };
    }
}
