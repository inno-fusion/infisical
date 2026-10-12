import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

// Node-only tests also guard the component choice before the browser smoke test.
describe("bypass billing UI boundary", () => {
  test("offline plans never mount live billing V2", () => {
    const page = readFileSync(new URL("./BillingPage.tsx", import.meta.url), "utf8");
    expect(page).toContain("subscription?.isOffline");
    expect(page).toContain("<OfflineBillingPage");
  });

  test("explains self-hosted entitlements without advertising a license purchase", () => {
    const page = readFileSync(new URL("./OfflineBillingPage.tsx", import.meta.url), "utf8");
    expect(page).toContain("envConfig.ENTERPRISE_BYPASS");
    expect(page).toContain("Self-hosted enterprise");
    expect(page).toContain("Subscription and billing management are disabled.");
    expect(page).not.toContain("useGet");
    expect(page).toContain("OrgPermissionBillingActions.Read");
  });
});
