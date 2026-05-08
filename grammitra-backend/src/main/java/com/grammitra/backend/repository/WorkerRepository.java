package com.grammitra.backend.repository;

import com.grammitra.backend.model.Worker;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WorkerRepository
        extends MongoRepository<Worker, String> {

    // ✅ FIND BY USER ID
    Optional<Worker> findByUserId(String userId);

    // ======================================================
    // ✅ LEGACY SEARCH METHODS (BACKWARD COMPATIBLE)
    // ======================================================

    List<Worker> findBySkillsContainingIgnoreCase(
            String skill
    );

    List<Worker> findBySkillsContainingAndAvailabilityTrue(
            String skill
    );

    List<Worker> findBySkillsContainingAndProfileCompletedTrue(
            String skill
    );

    List<Worker> findBySkillsContainingAndAvailabilityTrueAndProfileCompletedTrue(
            String skill
    );

    // ======================================================
    // 🌍 MULTILINGUAL SEARCH (EXACT MATCH FIXED)
    // ======================================================

    @Query(value = "{" +
            " $or: [" +

            // ✅ EXACT OLD SKILLS ARRAY MATCH
            "   { 'skills': { $in: [ ?0 ] } }," +

            // ✅ EXACT MULTILINGUAL ARRAY MAP SEARCH
            "   { 'skillsMap': { " +
            "       $elemMatch: { " +
            "           $or: [" +
            "               { 'en': ?0 }," +
            "               { 'hi': ?0 }" +
            "           ]" +
            "       }" +
            "   } }" +

            " ]" +
            "}")
    List<Worker> searchBySkillMultilingual(
            String skill
    );

    // ======================================================
    // 🔥 ACTIVE WORKERS SEARCH (EXACT MATCH FIXED)
    // ======================================================

    @Query(value = "{" +
            " $and: [" +

            // ✅ ONLY AVAILABLE
            "   { 'availability': true }," +

            // ✅ PROFILE COMPLETED
            "   { 'profileCompleted': true }," +

            // ✅ EXACT MULTILINGUAL SEARCH
            "   { $or: [" +

            // EXACT OLD SKILLS ARRAY
            "       { 'skills': { $in: [ ?0 ] } }," +

            // EXACT MULTILINGUAL SEARCH
            "       { 'skillsMap': { " +
            "           $elemMatch: { " +
            "               $or: [" +
            "                   { 'en': ?0 }," +
            "                   { 'hi': ?0 }" +
            "               ]" +
            "           }" +
            "       } }" +

            "   ] }" +

            " ]" +
            "}")
    List<Worker> searchActiveWorkers(
            String skill
    );
}