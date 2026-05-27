package com.grammitra.backend.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory OTP store for local development.
 *
 * Selected when {@code app.otp.store=memory} (the local-dev default).
 *
 * NOT suitable for multi-instance production:
 *   - state lives in the JVM heap of a single node, so a horizontal
 *     scale-out lets an attacker rotate through nodes to dodge the
 *     per-phone attempt counter,
 *   - process restart wipes in-flight OTPs.
 *
 * Switch to {@link RedisOtpStore} in any environment where the OTP store
 * is security-load-bearing — set {@code APP_OTP_STORE=redis}.
 */
@Component
@ConditionalOnProperty(name = "app.otp.store", havingValue = "memory", matchIfMissing = true)
public class InMemoryOtpStore implements OtpStore {

    private static final Logger log = LoggerFactory.getLogger(InMemoryOtpStore.class);

    private final ConcurrentMap<String, Entry> otp = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Counter> attempts = new ConcurrentHashMap<>();

    @PostConstruct
    void announce() {
        log.warn("⚠️ OTP store: IN-MEMORY (app.otp.store=memory). "
                + "Single-process only. Do NOT use this in production. "
                + "Set APP_OTP_STORE=redis (+ REDIS_HOST etc) for prod.");
    }

    @Override
    public void putOtp(String phone, String hash, Duration ttl) {
        otp.put(phone, new Entry(hash, Instant.now().plus(ttl)));
    }

    @Override
    public Optional<String> getOtp(String phone) {
        Entry e = otp.get(phone);
        if (e == null) return Optional.empty();
        if (Instant.now().isAfter(e.expiresAt)) {
            otp.remove(phone, e);
            return Optional.empty();
        }
        return Optional.of(e.value);
    }

    @Override
    public void deleteOtp(String phone) {
        otp.remove(phone);
    }

    @Override
    public long incrementAttempts(String phone, Duration ttl) {
        Counter c = attempts.compute(phone, (k, existing) -> {
            Instant now = Instant.now();
            // Expired window → start a fresh counter with a fresh TTL.
            if (existing == null || now.isAfter(existing.expiresAt)) {
                return new Counter(new AtomicLong(0), now.plus(ttl));
            }
            return existing;
        });
        return c.count.incrementAndGet();
    }

    @Override
    public Long getAttempts(String phone) {
        Counter c = attempts.get(phone);
        if (c == null) return null;
        if (Instant.now().isAfter(c.expiresAt)) {
            attempts.remove(phone, c);
            return null;
        }
        return c.count.get();
    }

    @Override
    public void deleteAttempts(String phone) {
        attempts.remove(phone);
    }

    private record Entry(String value, Instant expiresAt) {}
    private record Counter(AtomicLong count, Instant expiresAt) {}
}
