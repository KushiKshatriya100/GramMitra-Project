package com.grammitra.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Context-load smoke test. Activates the "test" profile so the rate-limit
 * beans (which eagerly connect to Redis) stay out of the bean graph — the
 * test then verifies the rest of the wiring without needing a live Redis.
 *
 * Real OTP / rate-limit behaviour should be covered by integration tests
 * standing up embedded Redis or TestContainers; not in scope here.
 */
@SpringBootTest(classes = GrammitraBackendApplication.class)
@ActiveProfiles("test")
class GrammitraBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
