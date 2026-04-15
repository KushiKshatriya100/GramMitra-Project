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

    public User updateProfile(String phone, UserRequest request) {

        User existingUser = userRepository.findByPhone(phone)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setPhone(phone);
                    newUser.setProfileCompleted(false); // ✅ important
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