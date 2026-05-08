package com.grammitra.backend.service;

import com.grammitra.backend.dto.UserRequest;
import com.grammitra.backend.model.User;
import com.grammitra.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // 🔥 UPDATE PROFILE USING loginId (NEW)
    public User updateProfileByLoginId(String loginId, UserRequest request) {

        User existingUser = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        existingUser.setName(request.getName());
        existingUser.setRole(request.getRole());
        existingUser.setLocation(request.getLocation());

        return userRepository.save(existingUser);
    }

    // 🔥 GET USER USING loginId (ALREADY CORRECT)
    public User getUserByLoginId(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ❌ OLD METHODS (OPTIONAL: REMOVE LATER)
    public User updateProfile(String phone, UserRequest request) {

        User existingUser = userRepository.findByPhone(phone)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setPhone(phone);
                    newUser.setProfileCompleted(false);
                    return newUser;
                });

        existingUser.setName(request.getName());
        existingUser.setRole(request.getRole());
        existingUser.setLocation(request.getLocation());

        return userRepository.save(existingUser);
    }

    public User getUserByPhone(String phone) {
        return userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}