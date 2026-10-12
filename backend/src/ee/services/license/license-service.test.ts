import { describe, expect, test, vi } from "vitest";

import { startLocalRefresh } from "@app/lib/cron/local-refresh";
import { ActorType } from "@app/services/auth/auth-type";

import { licenseServiceFactory } from "./license-service";
import { InstanceType } from "./license-types";

vi.mock("@app/lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("@app/lib/cron/local-refresh", () => ({ startLocalRefresh: vi.fn() }));
vi.mock("@app/lib/crypto", () => ({ verifyOfflineLicense: vi.fn() }));

const createService = (bypass: boolean) => {
  const deps = {
    envConfig: {
      ENTERPRISE_BYPASS: bypass,
      isCloud: false,
      LICENSE_KEY: bypass ? "isolated-online-key" : undefined,
      LICENSE_KEY_OFFLINE: undefined,
      LICENSE_SERVER_V2_SERVICE_KEY: undefined
    },
    orgDAL: { findRootOrgDetails: vi.fn().mockResolvedValue({ id: "org-test" }) },
    permissionService: { getOrgPermission: vi.fn().mockResolvedValue({}) },
    licenseDAL: { countBillableOrgActors: vi.fn().mockResolvedValue({ users: 2, identities: 1 }) },
    keyStore: {
      setItemWithExpiry: vi.fn(),
      setItemWithExpiryNX: vi.fn(),
      getItems: vi.fn().mockResolvedValue([]),
      deleteItem: vi.fn()
    },
    projectDAL: { countOfBillableOrgProjects: vi.fn().mockResolvedValue(3) },
    licenseClient: {
      getEntitlements: vi.fn(),
      getSubscription: vi.fn(),
      refreshEntitlements: vi.fn(),
      cancelSubscription: vi.fn(),
      invalidateEntitlements: vi.fn()
    },
    usageMeteringService: { emit: vi.fn(), reconcile: vi.fn() }
  };
  return { deps, service: licenseServiceFactory(deps) };
};

describe("explicit enterprise bypass service boundary", () => {
  test("serves all enterprise flags without license calls and still enforces organization permission", async () => {
    const { service, deps } = createService(true);
    await service.init();
    expect(service.getInstanceType()).toBe(InstanceType.EnterpriseOnPremOffline);
    expect(await service.getPlan("org-test")).toMatchObject({
      slug: "enterprise",
      isOffline: true,
      pkiOcsp: true,
      agentVaultByoS3: true,
      subOrganization: true
    });
    await service.initializeBackgroundSync();
    expect(startLocalRefresh).not.toHaveBeenCalled();
    expect(deps.licenseClient.getEntitlements).not.toHaveBeenCalled();
    expect(deps.usageMeteringService.reconcile).not.toHaveBeenCalled();

    deps.permissionService.getOrgPermission.mockRejectedValue(new Error("denied"));
    await expect(
      service.getOrgPlan({
        orgId: "org-test",
        rootOrgId: "org-test",
        actorId: "actor",
        actor: ActorType.USER,
        actorOrgId: "org-test",
        actorAuthMethod: null
      } as Parameters<typeof service.getOrgPlan>[0])
    ).rejects.toThrow("denied");
    expect(deps.permissionService.getOrgPermission).toHaveBeenCalledTimes(1);
  });

  test("bypass off preserves upstream unlicensed self-hosted defaults", async () => {
    const { service } = createService(false);
    await service.init();
    expect(service.getInstanceType()).toBe(InstanceType.OnPrem);
    expect(await service.getPlan("org-test")).toMatchObject({
      slug: null,
      rbac: false,
      secretScanning: false,
      pkiOcsp: false
    });
  });
});
