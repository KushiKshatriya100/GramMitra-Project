package com.grammitra.backend.config;

import com.mongodb.client.MongoClient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * One-shot diagnostic that prints, at startup, the MongoDB database name
 * Spring is actually connected to plus a count of the key collections.
 *
 * If a record visible in MongoDB Compass appears to be missing to the running
 * backend, the cause is almost always that Compass and Spring are looking at
 * different databases. Comparing the count in this log against the count
 * Compass shows for the same collection tells you within seconds whether the
 * two are talking to the same place.
 */
@Component
@Profile("!test")
public class MongoStartupLogger {

    private static final Logger log = LoggerFactory.getLogger(MongoStartupLogger.class);

    private final MongoTemplate mongoTemplate;
    private final MongoClient mongoClient;

    /**
     * Raw URI value as Spring resolved it. We redact the password before
     * logging — even with `local` profile the file shouldn't bleed creds
     * into stdout.
     */
    @Value("${spring.data.mongodb.uri:NOT_SET}")
    private String configuredUri;

    public MongoStartupLogger(MongoTemplate mongoTemplate, MongoClient mongoClient) {
        this.mongoTemplate = mongoTemplate;
        this.mongoClient = mongoClient;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void announce() {
        try {
            String db = mongoTemplate.getDb().getName();
            long users    = mongoTemplate.getCollection("users").countDocuments();
            long workers  = mongoTemplate.getCollection("workers").countDocuments();
            long bookings = mongoTemplate.getCollection("bookings").countDocuments();

            String host = mongoClient.getClusterDescription()
                    .getServerDescriptions()
                    .stream()
                    .findFirst()
                    .map(s -> s.getAddress().toString())
                    .orElse("unknown");

            String kind;
            if (configuredUri.startsWith("mongodb+srv://")
                    || host.contains(".mongodb.net")) {
                kind = "MongoDB Atlas (cloud)";
            } else if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
                kind = "Local MongoDB";
            } else {
                kind = "Self-hosted / other";
            }

            log.info("=========================================================");
            log.info("📦 MONGODB CONNECTED");
            log.info("   kind      : {}", kind);
            log.info("   host      : {}", host);
            log.info("   database  : {}", db);
            log.info("   uri       : {}", redact(configuredUri));
            log.info("   users     : {}", users);
            log.info("   workers   : {}", workers);
            log.info("   bookings  : {}", bookings);
            log.info("=========================================================");
            log.info("👉 If 'kind' or 'host' isn't what you expect:");
            log.info("    - default in application.properties = mongodb://localhost:27017/grammitra");
            log.info("    - to use Atlas, set MONGODB_URI env var OR edit");
            log.info("      application-local.properties and run with");
            log.info("      `.\\run-local.ps1` (activates the `local` profile).");
            log.info("=========================================================");

        } catch (Exception e) {
            log.warn("📦 MONGODB STARTUP DIAGNOSTIC failed: {}", e.getMessage());
        }
    }

    /**
     * Hides BOTH the username and the password in {@code user:password@host}
     * style URIs before logging. The earlier version only masked the password
     * and left the username (which on Atlas is often a stable, identifiable
     * service-account name) visible in stdout / log aggregators. The query
     * string can also carry secrets (e.g. {@code authMechanismProperties=...},
     * {@code tlsCertificateKeyFilePassword=...}), so we also drop everything
     * after the first {@code ?}.
     */
    private static String redact(String uri) {
        if (uri == null || uri.isBlank()) return "null";
        // Drop credentials.
        String safe = uri.replaceAll("://[^/?#@]*@", "://****@");
        // Drop query string (may contain auth params).
        int q = safe.indexOf('?');
        if (q >= 0) {
            safe = safe.substring(0, q) + "?****";
        }
        return safe;
    }
}
