import type { PostHog } from "posthog-js";

import { getPostHog } from "@app/components/analytics/posthog";
import { envConfig } from "@app/config/env";

type Capturer = {
  api: PostHog | undefined;
  capture: (item: string, properties?: Record<string, unknown>) => void;
  identify: (id: string, email?: string) => void;
};

const createCapturer = (): Capturer => {
  const api = getPostHog();

  return {
    api,
    capture(item, properties) {
      if (envConfig.ENTERPRISE_BYPASS || !envConfig.TELEMETRY_CAPTURING_ENABLED) return;
      try {
        api?.capture(item, properties);
      } catch (error) {
        console.error("PostHog", error);
      }
    },
    identify(id, email) {
      if (envConfig.ENTERPRISE_BYPASS || !envConfig.TELEMETRY_CAPTURING_ENABLED) return;
      try {
        api?.identify(id, {
          email
        });
      } catch (error) {
        console.error("PostHog", error);
      }
    }
  };
};

export default class Telemetry {
  static instance: Capturer;

  private readonly capturer: Capturer;

  constructor() {
    if (!Telemetry.instance) {
      Telemetry.instance = createCapturer();
    }
    this.capturer = Telemetry.instance;
  }

  getInstance() {
    return this.capturer;
  }
}
