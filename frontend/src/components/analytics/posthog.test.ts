import { afterEach, describe, expect, test, vi } from "vitest";

const { init } = vi.hoisted(() => ({ init: vi.fn() }));
vi.mock("posthog-js", () => ({ default: { init } }));

describe("runtime enterprise bypass analytics guard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.resetModules();
  });

  test.each([true, "true", "1"])(
    "suppresses client initialization for bypass=%s",
    async (bypass) => {
      vi.stubEnv("MODE", "production");
      vi.stubEnv("VITE_TELEMETRY_CAPTURING_ENABLED", "true");
      vi.stubEnv("VITE_POSTHOG_API_KEY", "isolated-build-key");
      vi.stubGlobal("window", {
        __INFISICAL_RUNTIME_ENV__: { ENTERPRISE_BYPASS: bypass, TELEMETRY_CAPTURING_ENABLED: true }
      });
      const client = await import("./posthog");
      expect(client.isPostHogEnabled()).toBe(false);
      expect(client.getPostHog()).toBeUndefined();
      expect(init).not.toHaveBeenCalled();
    }
  );

  test("explicit runtime telemetry false wins over an enabled build", async () => {
    vi.stubEnv("MODE", "production");
    vi.stubEnv("VITE_TELEMETRY_CAPTURING_ENABLED", "true");
    vi.stubEnv("VITE_POSTHOG_API_KEY", "isolated-build-key");
    vi.stubGlobal("window", {
      __INFISICAL_RUNTIME_ENV__: { ENTERPRISE_BYPASS: "0", TELEMETRY_CAPTURING_ENABLED: false }
    });
    const client = await import("./posthog");
    expect(client.isPostHogEnabled()).toBe(false);
    expect(client.initPostHog()).toBeUndefined();
    expect(init).not.toHaveBeenCalled();
  });

  test("bypass off preserves lazy initialization when telemetry is explicitly enabled", async () => {
    vi.stubEnv("MODE", "production");
    vi.stubGlobal("window", {
      __INFISICAL_RUNTIME_ENV__: {
        ENTERPRISE_BYPASS: "0",
        TELEMETRY_CAPTURING_ENABLED: true,
        POSTHOG_API_KEY: "isolated-runtime-key"
      }
    });
    const client = await import("./posthog");
    expect(init).not.toHaveBeenCalled();
    expect(client.isPostHogEnabled()).toBe(true);
    expect(client.getPostHog()).toBeDefined();
    expect(client.getPostHog()).toBeDefined();
    expect(init).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledWith(
      "isolated-runtime-key",
      expect.objectContaining({ autocapture: false, disable_session_recording: true })
    );
  });
});
