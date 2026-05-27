package com.grammitra.backend.service;

import java.time.Duration;
import java.util.Optional;

/**
 * Storage abstraction for OTP hashes + per-phone failed-verify counters.
 *
 * Two impls live alongside this interface:
 *   - {@link RedisOtpStore}    — production. Selected when
 *                                {@code app.otp.store=redis}. Multi-instance
 *                                safe; Redis TTL handles eviction.
 *   - {@link InMemoryOtpStore} — local dev / tests. Selected when
 *                                {@code app.otp.store=memory} (default).
 *                                Single-JVM only — do NOT use in
 *                                multi-instance production or the
 *                                attempt counter can be bypassed by
 *                                rotating across nodes.
 *
 * The split lets the rest of the app boot without a running Redis.
 */
public interface OtpStore {

    /** Store a BCrypt-hashed OTP for {@code phone} with the given TTL. */
    void putOtp(String phone, String hash, Duration ttl);

    /** Returns the stored hash if present and not expired. */
    Optional<String> getOtp(String phone);

    /** Remove the OTP key (success or admin reset). */
    void deleteOtp(String phone);

    /**
     * Increment the failed-verify counter for {@code phone}. On the first
     * increment (transition from absent → 1) the counter is given the
     * supplied TTL; subsequent increments within the window do not extend
     * it. Returns the post-increment value.
     */
    long incrementAttempts(String phone, Duration ttl);

    /** Current attempt count, or null if no counter is set. */
    Long getAttempts(String phone);

    /** Reset the attempt counter (called on successful verify). */
    void deleteAttempts(String phone);
}
