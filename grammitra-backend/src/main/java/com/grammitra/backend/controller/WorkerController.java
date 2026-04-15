package com.grammitra.backend.controller;

import com.grammitra.backend.dto.SkillCountResponse;
import com.grammitra.backend.dto.WorkerRequest;
import com.grammitra.backend.dto.WorkerResponse;
import com.grammitra.backend.model.Worker;
import com.grammitra.backend.service.WorkerService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/worker")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 🔥 FIX ADDED
public class WorkerController {

    private final WorkerService workerService;

    @PostMapping("/create-or-update")
    public ResponseEntity<Worker> createWorker(
            @RequestBody WorkerRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        String userId = authentication.getName();

        Worker worker = workerService.createOrUpdateWorker(
                userId,
                request.getSkills(),
                request.getWage(),
                request.isAvailability()
        );

        return ResponseEntity.ok(worker);
    }

    @GetMapping("/search")
    public ResponseEntity<List<WorkerResponse>> searchWorkers(
            @RequestParam String skill
    ) {
        return ResponseEntity.ok(workerService.searchWorkers(skill));
    }

    @GetMapping("/skill-count")
    public ResponseEntity<List<SkillCountResponse>> getSkillCounts() {
        return ResponseEntity.ok(workerService.getSkillCounts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerResponse> getWorkerById(@PathVariable String id) {
        return ResponseEntity.ok(workerService.getWorkerById(id));
    }
}