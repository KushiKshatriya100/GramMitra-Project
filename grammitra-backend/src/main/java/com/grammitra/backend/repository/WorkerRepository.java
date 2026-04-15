package com.grammitra.backend.repository;

import com.grammitra.backend.model.Worker;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface WorkerRepository extends MongoRepository<Worker, String> {

    Optional<Worker> findByUserId(String userId);

    List<Worker> findBySkillsContainingIgnoreCase(String skill);

    List<Worker> findBySkillsContainingAndAvailabilityTrue(String skill);

    List<Worker> findBySkillsContainingAndProfileCompletedTrue(String skill);

    List<Worker> findBySkillsContainingAndAvailabilityTrueAndProfileCompletedTrue(String skill);
}