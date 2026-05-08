package com.grammitra.backend.service;

import com.grammitra.backend.dto.SkillCountResponse;
import com.grammitra.backend.dto.WorkerRequest;
import com.grammitra.backend.dto.WorkerResponse;
import com.grammitra.backend.model.User;
import com.grammitra.backend.model.Worker;
import com.grammitra.backend.repository.UserRepository;
import com.grammitra.backend.repository.WorkerRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class WorkerService {

    private final WorkerRepository workerRepository;

    private final UserRepository userRepository;

    public WorkerService(
            WorkerRepository workerRepository,
            UserRepository userRepository
    ) {

        this.workerRepository = workerRepository;

        this.userRepository = userRepository;
    }

    // ✅ CREATE / UPDATE
    public WorkerResponse createOrUpdateWorker(
            String userId,
            WorkerRequest request,
            String lang
    ) {

        Worker worker = workerRepository.findByUserId(userId)
                .orElse(new Worker());

        worker.setUserId(userId);

        // ✅ AUTO SYNC USER DATA
        userRepository.findById(userId)
                .ifPresent(user -> {

                    // ✅ REGISTRATION NAME
                    worker.setName(user.getName());

                    // ✅ REGISTRATION PHONE
                    worker.setPhone(user.getPhone());

                    System.out.println(
                            "✅ Auto synced user data: "
                                    + user.getName()
                    );
                });

        worker.setProfileImage(request.getProfileImage());

        worker.setGender(request.getGender());
        worker.setAge(request.getAge());

        // ✅ OLD FIELDS
        worker.setLocation(request.getLocation());
        worker.setBio(request.getBio());
        worker.setSkills(request.getSkills());

        // 🌍 MULTILINGUAL
        worker.setLocationMap(
                mergeMap(
                        worker.getLocationMap(),
                        request.getLocation(),
                        lang
                )
        );

        worker.setBioMap(
                mergeMap(
                        worker.getBioMap(),
                        request.getBio(),
                        lang
                )
        );

        worker.setSkillsMap(
                mergeSkills(
                        worker.getSkillsMap(),
                        request.getSkills(),
                        lang
                )
        );

        worker.setExperience(request.getExperience());
        worker.setWage(request.getWage());
        worker.setAvailability(request.isAvailability());

        worker.setLatitude(request.getLatitude());
        worker.setLongitude(request.getLongitude());

        calculateProfileCompletion(worker);

        Worker saved = workerRepository.save(worker);

        System.out.println(
                "✅ Worker saved with phone: "
                        + saved.getPhone()
        );

        return mapToResponse(saved, lang);
    }

    // 🔥 MERGE (NO DATA LOSS)
    private Map<String, String> mergeMap(
            Map<String, String> existing,
            String value,
            String lang
    ) {

        if (value == null) {
            return existing;
        }

        Map<String, String> map =
                existing != null
                        ? new HashMap<>(existing)
                        : new HashMap<>();

        map.put(lang, value);

        if (!map.containsKey("en")) {
            map.put("en", value);
        }

        if (!map.containsKey("hi")) {
            map.put("hi", value);
        }

        return map;
    }

    private List<Map<String, String>> mergeSkills(
            List<Map<String, String>> existing,
            List<String> skills,
            String lang
    ) {

        if (skills == null) {
            return existing;
        }

        List<Map<String, String>> list =
                new ArrayList<>();

        for (String skill : skills) {

            Map<String, String> map =
                    new HashMap<>();

            map.put(lang, skill);
            map.put("en", skill);
            map.put("hi", skill);

            list.add(map);
        }

        return list;
    }

    private String getValue(
            Map<String, String> map,
            String lang,
            String fallback
    ) {

        if (map == null) {
            return fallback;
        }

        if (map.containsKey(lang)) {
            return map.get(lang);
        }

        if (map.containsKey("en")) {
            return map.get("en");
        }

        return map.values()
                .stream()
                .findFirst()
                .orElse(fallback);
    }

    private List<String> getSkills(
            List<Map<String, String>> mapList,
            List<String> fallback,
            String lang
    ) {

        if (mapList == null || mapList.isEmpty()) {
            return fallback;
        }

        return mapList.stream()
                .map(m -> getValue(m, lang, null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // 🚀 NEARBY WORKERS
    public List<WorkerResponse> findNearbyWorkers(
            double userLat,
            double userLng,
            String skill,
            String lang
    ) {

        List<Worker> workers =
                workerRepository.findAll();

        double maxDistanceKm = 10.0;

        return workers.stream()

                .filter(Worker::isAvailability)

                .filter(w ->
                        w.getLatitude() != 0
                                && w.getLongitude() != 0
                )

                .filter(w -> {

                    if (skill == null || skill.isEmpty()) {
                        return true;
                    }

                    if (w.getSkills() == null) {
                        return false;
                    }

                    String normalizedSkill =
                            normalizeSkill(skill);

                    return w.getSkills().stream()
                            .anyMatch(s ->
                                    normalizeSkill(s)
                                            .contains(normalizedSkill)
                            );
                })

                .filter(w -> {

                    double distance =
                            haversine(
                                    userLat,
                                    userLng,
                                    w.getLatitude(),
                                    w.getLongitude()
                            );

                    return distance <= maxDistanceKm;
                })

                .map(w -> mapToResponse(w, lang))

                .collect(Collectors.toList());
    }

    private double haversine(
            double lat1,
            double lon1,
            double lat2,
            double lon2
    ) {

        final int R = 6371;

        double latDistance =
                Math.toRadians(lat2 - lat1);

        double lonDistance =
                Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(latDistance / 2)
                        * Math.sin(latDistance / 2)

                        + Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2))

                        * Math.sin(lonDistance / 2)
                        * Math.sin(lonDistance / 2);

        double c =
                2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                );

        return R * c;
    }

    // ✅ SMART SKILL NORMALIZATION
    private String normalizeSkill(String skill) {

        if (skill == null) {
            return "";
        }

        String normalized =
                skill.trim().toLowerCase();

        Map<String, String> synonyms =
                new HashMap<>();

        // 🔌 ELECTRICIAN
        synonyms.put("electric", "electrician");
        synonyms.put("wiring", "electrician");
        synonyms.put("bijli", "electrician");
        synonyms.put("बिजली", "electrician");
        synonyms.put("इलेक्ट्रीशियन", "electrician");

        // 🚰 PLUMBER
        synonyms.put("plumbing", "plumber");
        synonyms.put("pipe", "plumber");
        synonyms.put("pipe repair", "plumber");
        synonyms.put("प्लंबर", "plumber");

        // 🪚 CARPENTER
        synonyms.put("carpentry", "carpenter");
        synonyms.put("woodwork", "carpenter");
        synonyms.put("बढ़ई", "carpenter");

        // 🧹 HOUSEKEEPING
        synonyms.put("maid", "housekeeping");
        synonyms.put("cleaner", "housekeeping");
        synonyms.put("कामवाली", "housekeeping");
        synonyms.put("safai", "housekeeping");

        return synonyms.getOrDefault(
                normalized,
                normalized
        );
    }

    private void calculateProfileCompletion(
            Worker worker
    ) {

        int completion = 0;

        if (worker.getProfileImage() != null) {
            completion += 10;
        }

        if (worker.getGender() != null) {
            completion += 10;
        }

        if (worker.getAge() > 0) {
            completion += 10;
        }

        if (worker.getLocation() != null) {
            completion += 10;
        }

        if (worker.getSkills() != null
                && !worker.getSkills().isEmpty()) {

            completion += 20;
        }

        if (worker.getExperience() > 0) {
            completion += 10;
        }

        if (worker.getWage() != null
                && worker.getWage() > 0) {

            completion += 10;
        }

        if (worker.getBio() != null) {
            completion += 10;
        }

        if (worker.isAvailability()) {
            completion += 10;
        }

        worker.setProfileCompletion(completion);

        worker.setProfileCompleted(
                completion >= 80
        );
    }

    // ✅ IMPROVED SEARCH
    public List<WorkerResponse> searchWorkers(
            String skill,
            String lang
    ) {

        try {

            if (skill == null
                    || skill.trim().isEmpty()) {

                return Collections.emptyList();
            }

            String normalizedSkill =
                    normalizeSkill(skill);

            System.out.println(
                    "🔎 NORMALIZED SEARCH: "
                            + normalizedSkill
            );

            List<Worker> workers =
                    workerRepository.searchActiveWorkers(
                            normalizedSkill
                    );

            if (workers == null
                    || workers.isEmpty()) {

                return Collections.emptyList();
            }

            return workers.stream()

                    .filter(Objects::nonNull)

                    .sorted((a, b) -> {

                        int ratingCompare =
                                Double.compare(
                                        b.getRating(),
                                        a.getRating()
                                );

                        if (ratingCompare != 0) {
                            return ratingCompare;
                        }

                        return Integer.compare(
                                b.getJobsCompleted(),
                                a.getJobsCompleted()
                        );
                    })

                    .map(worker ->
                            mapToResponse(
                                    worker,
                                    lang
                            )
                    )

                    .collect(Collectors.toList());

        } catch (Exception e) {

            System.err.println(
                    "❌ SEARCH WORKERS ERROR: "
                            + e.getMessage()
            );

            return Collections.emptyList();
        }
    }

    // ✅ CHAT SEARCH
    public List<WorkerResponse> searchWorkersBySkillForChat(
            String skill,
            String lang
    ) {

        try {

            if (skill == null
                    || skill.trim().isEmpty()) {

                return Collections.emptyList();
            }

            String normalizedSkill =
                    normalizeSkill(skill);

            System.out.println(
                    "💬 CHAT SEARCH SKILL: "
                            + normalizedSkill
            );

            List<WorkerResponse> workers =
                    searchWorkers(
                            normalizedSkill,
                            lang
                    );

            return workers.stream()

                    .filter(
                            WorkerResponse::isAvailability
                    )

                    .limit(5)

                    .collect(Collectors.toList());

        } catch (Exception e) {

            System.err.println(
                    "❌ CHAT SEARCH ERROR: "
                            + e.getMessage()
            );

            return Collections.emptyList();
        }
    }

    public WorkerResponse getWorkerById(
            String id,
            String lang
    ) {

        Worker worker =
                workerRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Worker not found"
                                )
                        );

        return mapToResponse(worker, lang);
    }

    public WorkerResponse getWorkerByUserId(
            String userId,
            String lang
    ) {

        Worker worker =
                workerRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Worker not found"
                                )
                        );

        return mapToResponse(worker, lang);
    }

    private WorkerResponse mapToResponse(
            Worker worker,
            String lang
    ) {

        WorkerResponse res =
                new WorkerResponse();

        res.setId(worker.getId());

        // ✅ FETCH USER DATA DIRECTLY
        // ✅ FETCH USER DATA DIRECTLY
        userRepository.findById(worker.getUserId())
                .ifPresent(user -> {

                    // ✅ ALWAYS LATEST USER NAME
                    res.setName(user.getName());

                    // ✅ ALWAYS LATEST PHONE
                    res.setPhone(user.getPhone());
                });

        res.setProfileImage(
                worker.getProfileImage()
        );

        res.setGender(worker.getGender());

        res.setAge(worker.getAge());

        res.setLocation(
                getValue(
                        worker.getLocationMap(),
                        lang,
                        worker.getLocation()
                )
        );

        res.setBio(
                getValue(
                        worker.getBioMap(),
                        lang,
                        worker.getBio()
                )
        );

        res.setSkills(
                getSkills(
                        worker.getSkillsMap(),
                        worker.getSkills(),
                        lang
                )
        );

        res.setExperience(
                worker.getExperience()
        );

        res.setWage(worker.getWage());

        res.setAvailability(
                worker.isAvailability()
        );

        res.setLatitude(worker.getLatitude());

        res.setLongitude(worker.getLongitude());

        res.setRating(worker.getRating());

        res.setTotalReviews(
                worker.getTotalReviews()
        );

        res.setJobsCompleted(
                worker.getJobsCompleted()
        );

        res.setProfileCompletion(
                worker.getProfileCompletion()
        );

        res.setProfileCompleted(
                worker.isProfileCompleted()
        );

        return res;
    }

    public List<SkillCountResponse> getSkillCounts() {

        List<Worker> workers =
                workerRepository.findAll();

        Map<String, Integer> countMap =
                new HashMap<>();

        for (Worker worker : workers) {

            if (worker.getSkills() == null) {
                continue;
            }

            for (String skill : worker.getSkills()) {

                countMap.put(
                        skill,
                        countMap.getOrDefault(skill, 0) + 1
                );
            }
        }

        return countMap.entrySet()

                .stream()

                .map(e ->
                        new SkillCountResponse(
                                e.getKey(),
                                e.getValue()
                        )
                )

                .collect(Collectors.toList());
    }
}