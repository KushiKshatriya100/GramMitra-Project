package com.grammitra.backend.repository;

import com.grammitra.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByPhone(String phone);

    // 🔥 ADD THIS (CRITICAL)
    Optional<User> findByLoginId(String loginId);

    boolean existsByLoginId(String loginId);
}