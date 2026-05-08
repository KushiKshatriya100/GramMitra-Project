package com.grammitra.backend.service;

import com.grammitra.backend.dto.WorkerResponse;
import com.grammitra.backend.model.ChatIntent;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatSessionService {

    // ✅ In-memory session store
    private final Map<String, ChatSession> sessions =
            new ConcurrentHashMap<>();

    // ✅ Get or create session
    public ChatSession getSession(String userId) {

        if (userId == null || userId.isBlank()) {
            return new ChatSession();
        }

        return sessions.computeIfAbsent(
                userId,
                id -> new ChatSession()
        );
    }

    // ✅ Save last intent
    public void saveIntent(
            String userId,
            ChatIntent intent
    ) {

        ChatSession session = getSession(userId);

        session.setLastIntent(intent);
    }

    // ✅ Save searched skill
    public void saveSkill(
            String userId,
            String skill
    ) {

        ChatSession session = getSession(userId);

        session.setLastSkill(skill);
    }

    // ✅ Save workers shown in chatbot
    public void saveWorkers(
            String userId,
            List<WorkerResponse> workers
    ) {

        ChatSession session = getSession(userId);

        session.setLastWorkers(workers);
    }

    // ✅ Save selected worker
    public void saveSelectedWorker(
            String userId,
            WorkerResponse worker
    ) {

        ChatSession session = getSession(userId);

        session.setSelectedWorker(worker);
    }

    // ✅ Get selected worker
    public WorkerResponse getSelectedWorker(
            String userId
    ) {

        ChatSession session = getSession(userId);

        return session.getSelectedWorker();
    }

    // ✅ Get previously shown workers
    public List<WorkerResponse> getLastWorkers(
            String userId
    ) {

        ChatSession session = getSession(userId);

        return session.getLastWorkers();
    }

    // ✅ Get last intent
    public ChatIntent getLastIntent(
            String userId
    ) {

        ChatSession session = getSession(userId);

        return session.getLastIntent();
    }

    // ✅ Clear session
    public void clearSession(String userId) {

        if (userId == null) {
            return;
        }

        sessions.remove(userId);
    }

    // ✅ Session Model
    @Data
    public static class ChatSession {

        // 🎯 Last detected intent
        private ChatIntent lastIntent =
                ChatIntent.UNKNOWN;

        // 🔍 Last searched skill
        private String lastSkill;

        // 👷 Previously shown workers
        private List<WorkerResponse> lastWorkers =
                new ArrayList<>();

        // ✅ Selected worker
        private WorkerResponse selectedWorker;
    }
}