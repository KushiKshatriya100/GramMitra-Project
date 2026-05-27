package com.grammitra.backend.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

/**
 * Production OTP store backed by Redis (StringRedisTemplate).
 *
 * Selected when {@code app.otp.store=redis}. Multi-instance safe — all
 * backend nodes share the same OTP / attempt-counter namespace, and
 * Redis TTL handles eviction without an in-app scheduler.
 *
 * Keys are colon-namespaced ({@code otp:<phone>} /
 * {@code otp:attempts:<phone>}) so ops can scan them with
 * {@code KEYS otp:*}.
 */
@Component
@ConditionalOnProperty(name = "app.otp.store", havingValue = "redis")
public class RedisOtpStore implements OtpStore {

    private static final Logger log = LoggerFactory.getLogger(RedisOtpStore.class);

    private static final String OTP_KEY_PREFIX = "otp:";
    private static final String ATTEMPTS_KEY_PREFIX = "otp:attempts:";

    private final StringRedisTemplate redis;

    public RedisOtpStore(StringRedisTemplate redis) {
        this.redis = redis;
    }

    @PostConstruct
    void announce() {
        log.info("✅ OTP store: REDIS (StringRedisTemplate). Multi-instance safe.");
    }

    private String otpKey(String phone) {
        return OTP_KEY_PREFIX + phone;
    }

    private String attemptsKey(String phone) {
        return ATTEMPTS_KEY_PREFIX + phone;
    }

    @Override
    public void putOtp(String phone, String hash, Duration ttl) {
        // SET with TTL is atomic — re-sending replaces the previous code so
        // an attacker can't have two valid codes in flight simultaneously.
        redis.opsForValue().set(otpKey(phone), hash, ttl);
    }

    @Override
    public Optional<String> getOtp(String phone) {
        return Optional.ofNullable(redis.opsForValue().get(otpKey(phone)));
    }

    @Override
    public void deleteOtp(String phone) {
        redis.delete(otpKey(phone));
    }

    @Override
    public long incrementAttempts(String phone, Duration ttl) {
        // INCR-then-EXPIRE pattern: the first INCR creates the key with
        // no TTL, so we set the TTL explicitly when the counter starts.
        // Race-tolerant because EXPIRE on a key that already has a TTL
        // is a harmless refresh.
        String key = attemptsKey(phone);
        Long after = redis.opsForValue().increment(key);
        if (after != null && after == 1L) {
            redis.expire(key, ttl);
        }
        return after == null ? 0L : after;
    }

    @Override
    public Long getAttempts(String phone) {
        String raw = redis.opsForValue().get(attemptsKey(phone));
        if (raw == null) return null;
        try {
            return Long.parseLong(raw);
        } catch (NumberFormatException nfe) {
            // Corrupt key — wipe it rather than block forever.
            redis.delete(attemptsKey(phone));
            return null;
        }
    }

    @Override
    public void deleteAttempts(String phone) {
        redis.delete(attemptsKey(phone));
    }
}
