import { describe, expect, test } from "vitest";

import { getAllFeaturesEnabled, getDefaultOnPremFeatures } from "./license-fns";

describe("enterprise bypass feature set", () => {
  test("preserves every upstream feature key and enables enterprise", () => {
    const defaults = getDefaultOnPremFeatures();
    const enterprise = getAllFeaturesEnabled();

    expect(Object.keys(enterprise).sort()).toEqual(Object.keys(defaults).sort());
    expect(enterprise.slug).toBe("enterprise");

    const nullableProductGates = new Set(["pam", "certManager", "secretsTemporaryAccess", "enterprisePamAccount"]);
    const nullableQuotas = new Set([
      "workspaceLimit",
      "memberLimit",
      "identityLimit",
      "environmentLimit",
      "secretSyncLimit",
      "maxPamAccounts",
      "maxCas",
      "maxInternalCas",
      "maxCertificates",
      "maxWildcardCertificates",
      "maxSansPerCertificate"
    ]);

    for (const [key, value] of Object.entries(enterprise)) {
      if (nullableProductGates.has(key) || nullableQuotas.has(key)) {
        expect(value, key).toBeNull();
      }
    }

    for (const [key, value] of Object.entries(defaults)) {
      if (typeof value === "boolean" && key !== "has_used_trial") {
        expect(enterprise[key as keyof typeof enterprise], key).toBe(true);
      }
    }

    expect(enterprise).toMatchObject({
      rbac: true,
      samlSSO: true,
      secretScanning: true,
      secretAccessInsights: true,
      pkiEnterpriseCaIntegrations: true,
      pkiExternalIntermediateCa: true,
      pkiDiscovery: true,
      pkiEnterpriseAlerting: true,
      pkiApprovals: true,
      pkiSyncs: true,
      pkiCodeSigning: true,
      crossProjectSecretSharing: true,
      secretsFolderRbac: true
    });
  });
});
