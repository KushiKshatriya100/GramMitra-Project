package com.grammitra.backend.controller;

import com.grammitra.backend.dto.SkillCountResponse;
import com.grammitra.backend.dto.WorkerRequest;
import com.grammitra.backend.dto.WorkerResponse;
import com.grammitra.backend.service.WorkerService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/worker")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WorkerController {

    private final WorkerService workerService;

    private String normalizeLang(String lang) {
        if (lang == null) return "en";
        return lang.toLowerCase().startsWith("hi") ? "hi" : "en";
    }

    // ✅ CREATE / UPDATE WORKER (SAFE PHONE HANDLING)
    @PostMapping("/create-or-update")
    public ResponseEntity<WorkerResponse> createWorker(
            @RequestBody WorkerRequest request,
            Authentication auth,
            @RequestHeader(value = "Accept-Language", required = false) String lang
    ) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        // 🔍 DEBUG LOG
        System.out.println("📥 Worker profile request received for user: " + auth.getName());

        // 🔥 SAFE PHONE HANDLING (NO DATA LOSS)
        String phone = request.getPhone();

        if (phone != null) {
            phone = phone.trim();

            // update request object so service gets cleaned value
            request.setPhone(phone);

            System.out.println("📱 Phone received (trimmed): " + phone);

            if (phone.isEmpty()) {
                System.out.println("⚠️ Phone is empty after trimming");
            }
        } else {
            System.out.println("⚠️ Phone not provided in request");
        }

        return ResponseEntity.ok(
                workerService.createOrUpdateWorker(
                        auth.getName(),
                        request,
                        normalizeLang(lang)
                )
        );
    }

    // 🔍 SEARCH
    @GetMapping("/search")
    public ResponseEntity<List<WorkerResponse>> searchWorkers(
            @RequestParam String skill,
            @RequestHeader(value = "Accept-Language", required = false) String lang
    ) {
        return ResponseEntity.ok(
                workerService.searchWorkers(skill, normalizeLang(lang))
        );
    }

    // 📍 NEARBY WORKERS
    @GetMapping("/nearby")
    public ResponseEntity<List<WorkerResponse>> getNearbyWorkers(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(required = false) String skill,
            @RequestHeader(value = "Accept-Language", required = false) String lang
    ) {
        return ResponseEntity.ok(
                workerService.findNearbyWorkers(
                        lat,
                        lng,
                        skill,
                        normalizeLang(lang)
                )
        );
    }

    // 📊 SKILL COUNT
    @GetMapping("/skill-count")
    public ResponseEntity<List<SkillCountResponse>> getSkillCounts() {
        return ResponseEntity.ok(workerService.getSkillCounts());
    }

    // 👤 GET WORKER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<WorkerResponse> getWorkerById(
            @PathVariable String id,
            @RequestHeader(value = "Accept-Language", required = false) String lang
    ) {
        return ResponseEntity.ok(
                workerService.getWorkerById(id, normalizeLang(lang))
        );
    }

    // 👤 GET MY PROFILE
    @GetMapping("/me")
    public ResponseEntity<WorkerResponse> getMyWorker(
            Authentication auth,
            @RequestHeader(value = "Accept-Language", required = false) String lang
    ) {
        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                workerService.getWorkerByUserId(auth.getName(), normalizeLang(lang))
        );
    }
}