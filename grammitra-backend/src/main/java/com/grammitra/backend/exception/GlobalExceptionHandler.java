package com.grammitra.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 🔴 Validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {

        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        response.put("status", 400);
        response.put("type", "VALIDATION_ERROR");
        response.put("errors", errors);

        return ResponseEntity.badRequest().body(response);
    }

    // 💰 Payment-related errors (NEW)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handlePayment(IllegalStateException ex) {

        Map<String, Object> response = new HashMap<>();
        response.put("status", 400);
        response.put("type", "PAYMENT_ERROR");
        response.put("error", ex.getMessage());

        return ResponseEntity.badRequest().body(response);
    }

    // 🔴 Runtime errors
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {

        Map<String, Object> response = new HashMap<>();
        response.put("status", 400);
        response.put("type", "BUSINESS_ERROR");
        response.put("error", ex.getMessage());

        return ResponseEntity.badRequest().body(response);
    }

    // 🔴 Fallback (important for production)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {

        Map<String, Object> response = new HashMap<>();
        response.put("status", 500);
        response.put("type", "SERVER_ERROR");
        response.put("error", "Internal Server Error");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}