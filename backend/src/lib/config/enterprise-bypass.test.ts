import { afterEach, describe, expect, test, vi } from "vitest";

import { getTelemetryConfig, initEnvConfig } from "./env";

vi.mock("@app/lib/crypto/cryptography", () => ({ crypto: { initialize: vi.fn() } }));
vi.mock("@app/lib/crypto/pqc", () => ({ initializePqcSupport: vi.fn() }));

describe("enterprise bypass telemetry configuration", () => {
  afterEach(() => vi.unstubAllEnvs());

  test.each([
    ["true", false],
    ["1", false],
    ["false", true],
    [undefined, true]
  ])("keeps explicit telemetry settings safe with bypass=%s", async (bypass, expected) => {
    vi.stubEnv("ENTERPRISE_BYPASS", bypass);
    vi.stubEnv("ENCRYPTION_KEY", "0123456789abcdef0123456789abcdef");
    vi.stubEnv("AUTH_SECRET", "isolated-test-auth-secret-0123456789");
    vi.stubEnv("DB_CONNECTION_URI", "postgresql://test:test@localhost/test");
    vi.stubEnv("REDIS_URL", "redis://localhost:6379");
    vi.stubEnv("TELEMETRY_ENABLED", "true");
    vi.stubEnv("OTEL_TELEMETRY_COLLECTION_ENABLED", "true");
    vi.stubEnv("SHOULD_USE_DATADOG_TRACER", "true");
    vi.stubEnv("DATADOG_PROFILING_ENABLED", "true");

    const trace = getTelemetryConfig();
    expect(trace.useOtel).toBe(expected);
    expect(trace.useDataDogTracer).toBe(expected);
    expect(trace.TRACER.profiling).toBe(expected);

    const config = await initEnvConfig(
      {} as Parameters<typeof initEnvConfig>[0],
      {} as Parameters<typeof initEnvConfig>[1]
    );
    expect(config.TELEMETRY_ENABLED).toBe(expected);
    expect(config.OTEL_TELEMETRY_COLLECTION_ENABLED).toBe(expected);
    expect(config.SHOULD_USE_DATADOG_TRACER).toBe(expected);
    expect(config.DATADOG_PROFILING_ENABLED).toBe(expected);
  });
});
