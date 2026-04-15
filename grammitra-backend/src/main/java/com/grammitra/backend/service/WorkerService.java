package com.grammitra.backend.service;

import com.grammitra.backend.dto.SkillCountResponse;
import com.grammitra.backend.dto.WorkerResponse;
import com.grammitra.backend.model.Worker;
import com.grammitra.backend.repository.WorkerRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class WorkerService {

    private final WorkerRepository workerRepository;

    public WorkerService(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    // ✅ CREATE / UPDATE
    public Worker createOrUpdateWorker(String userId, List<String> skills, double wage, boolean availability) {
        Worker worker = workerRepository.findByUserId(userId)
                .orElse(new Worker());

        worker.setUserId(userId);
        worker.setSkills(skills);
        worker.setWage(wage);
        worker.setAvailability(availability);

        return workerRepository.save(worker);
    }

    // ✅ SEARCH WORKERS
    public List<WorkerResponse> searchWorkers(String skill) {
        List<Worker> workers = workerRepository.findBySkillsContainingIgnoreCase(skill);

        return workers.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ SKILL COUNT
    public List<SkillCountResponse> getSkillCounts() {
        List<Worker> workers = workerRepository.findAll();

        Map<String, Integer> countMap = new HashMap<>();

        for (Worker worker : workers) {
            for (String skill : worker.getSkills()) {
                countMap.put(skill, countMap.getOrDefault(skill, 0) + 1);
            }
        }

        return countMap.entrySet().stream()
                .map(e -> new SkillCountResponse(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    // ✅ GET WORKER BY ID
    public WorkerResponse getWorkerById(String id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        return mapToResponse(worker);
    }

    // ✅ MAPPER (🔥 FIXED)
    private WorkerResponse mapToResponse(Worker worker) {
        WorkerResponse res = new WorkerResponse();

        res.setId(worker.getUserId()); // ✅ important fix

        // ❌ name removed for now

        res.setSkills(worker.getSkills());
        res.setWage(worker.getWage());
        res.setAvailability(worker.isAvailability());
        res.setRating(worker.getRating());
        res.setTotalReviews(worker.getTotalReviews());

        return res;
    }
}