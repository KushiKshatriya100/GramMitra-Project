package com.grammitra.backend.controller;

import com.grammitra.backend.dto.UserRequest;
import com.grammitra.backend.model.User;
import com.grammitra.backend.service.UserService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Optional;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ✅ UPDATE PROFILE (existing)
    @PutMapping("/profile")
    public User updateProfile(Authentication authentication,
                              @Valid @RequestBody UserRequest request) {

        String phone = (String) authentication.getPrincipal();
        return userService.updateProfile(phone, request);
    }

    // ✅ GET USER BY PHONE (NEW - IMPORTANT)
    @GetMapping("/me")
    public User getUser(Authentication authentication) {

        String phone = (String) authentication.getPrincipal();

        return userService.getUserByPhone(phone);
    }
}