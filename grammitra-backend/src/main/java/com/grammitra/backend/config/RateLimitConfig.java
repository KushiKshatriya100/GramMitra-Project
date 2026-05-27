package com.grammitra.backend.config;

import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import io.lettuce.core.codec.RedisCodec;
import io.lettuce.core.codec.StringCodec;

import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Bucket4j wiring for the per-IP OTP send-rate limiter.
 *
 * Loads only when {@code app.ratelimit.enabled=true} is set explicitly.
 * The default (matchIfMissing=false) is OFF so the app boots without
 * Redis on a fresh laptop. In production set
 * {@code APP_RATELIMIT_ENABLED=true} (and a reachable REDIS_HOST) to
 * re-enable the distributed bucket.
 *
 * Why a dedicated Lettuce client rather than re-using Spring's
 * RedisConnectionFactory: Bucket4j needs a String→byte[] codec, and
 * mixing codecs on a shared connection is a documented foot-gun.
 */
@Configuration
@ConditionalOnProperty(name = "app.ratelimit.enabled", havingValue = "true", matchIfMissing = false)
public class RateLimitConfig {

    private static final Logger log = LoggerFactory.getLogger(RateLimitConfig.class);

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    private RedisClient redisClient;
    private StatefulRedisConnection<String, byte[]> connection;

    @Bean
    public ProxyManager<String> bucket4jProxyManager() {
        log.info("🚦 Bucket4j rate limiter ENABLED — connecting to Redis at {}:{}",
                redisHost, redisPort);

        RedisURI.Builder uriBuilder = RedisURI.builder()
                .withHost(redisHost)
                .withPort(redisPort);
        if (redisPassword != null && !redisPassword.isBlank()) {
            uriBuilder.withPassword(redisPassword.toCharArray());
        }

        this.redisClient = RedisClient.create(uriBuilder.build());
        this.connection = redisClient.connect(
                RedisCodec.of(StringCodec.UTF8, ByteArrayCodec.INSTANCE));

        @SuppressWarnings("deprecation")
        var pm = LettuceBasedProxyManager.builderFor(connection.async()).build();
        return pm;
    }

    @PreDestroy
    void shutdown() {
        if (connection != null) connection.close();
        if (redisClient != null) redisClient.shutdown();
    }
}
