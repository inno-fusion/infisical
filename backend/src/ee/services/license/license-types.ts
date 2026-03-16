import { TOrgPermission } from "@app/lib/types";
import { TEntitlementsResponse } from "@app/services/license-client/license-client-types";

export enum InstanceType {
  OnPrem = "self-hosted",
  EnterpriseOnPrem = "enterprise-self-hosted",
  EnterpriseOnPremOffline = "enterprise-self-hosted-offline",
  Cloud = "cloud"
}

export type TOfflineLicenseContents = {
  license: TOfflineLicense;
  signature: string;
};

export type TOfflineLicense = {
  issuedTo: string;
  licenseId: string;
  customerId: string | null;
  issuedAt: string;
  expiresAt: string | null;
  terminatesAt: string | null;
  version?: number;
  features: TFeatureSet;
  entitlements?: TEntitlementsResponse;
};

export type TOrgSeatUsage = {
  membersUsed: number;
  identitiesUsed: number;
};

export type TFeatureSet = {
  _id: null;
  slug: string | null;
  isOffline?: boolean;
  tier: number;
  workspaceLimit: null;
  workspacesUsed: number;
  dynamicSecret: boolean;
  memberLimit: null;
  identityLimit: null;
  enforceIdentityLimit?: boolean;
  subOrganization: boolean;
  environmentLimit: null;
  environmentsUsed: number;
  secretVersioning: boolean;
  pitRecovery: boolean;
  ipAllowlisting: boolean;
  rbac: boolean;
  customRateLimits: boolean;
  customAlerts: boolean;
  auditLogs: boolean;
  auditLogsRetentionDays: number;
  auditLogStreams: boolean;
  auditLogStreamLimit: number;
  githubOrgSync: boolean;
  samlSSO: boolean;
  enforceGoogleSSO: boolean;
  hsm: boolean;
  oidcSSO: boolean;
  secretAccessInsights: boolean;
  scim: boolean;
  ldap: boolean;
  groups: boolean;
  status: string | null;
  trial_end: number | null;
  has_used_trial: boolean;
  secretApproval: boolean;
  secretRotation: boolean;
  instanceUserManagement: boolean;
  externalKms: boolean;
  rateLimits: {
    readLimit: number;
    writeLimit: number;
    secretsLimit: number;
  };
  kmsPqc: boolean;
  enforceMfa: boolean;
  projectTemplates: boolean;
  kmip: boolean;
  gateway: boolean;
  gatewayPool: boolean;
  pamSlackNotifications: boolean;
  secretScanning: boolean;
  enterpriseSecretSyncs: boolean;
  enterpriseAppConnections: boolean;
  machineIdentityAuthTemplates: boolean;
  fips: boolean;
  eventSubscriptions: boolean;
  secretShareExternalBranding: boolean;
  honeyTokens: boolean;
  honeyTokenLimit: number;
  secretsBrokering: boolean;
  secretSyncLimit: null;
  maxPamAccounts: null;

  // PKI / Cert Manager
  pkiAcme: boolean;
  pkiEst: boolean;
  pkiScep: boolean;
  pkiPqc: boolean;
  caCrl: boolean;
  pkiEnterpriseCaIntegrations: boolean;
  pkiExternalIntermediateCa: boolean;
  pkiDiscovery: boolean;
  pkiEnterpriseAlerting: boolean;
  pkiApprovals: boolean;
  pkiSyncs: boolean;
  pkiLegacyTemplates: boolean;
  pkiCodeSigning: boolean;
  maxCas: number | null;
  maxInternalCas: number | null;
  maxCertificates: number | null;
  maxWildcardCertificates: number | null;
  maxSansPerCertificate: number | null;

  // Product-gating fields use null to avoid imposing product-specific caps.
  pam: null;
  certManager: null;
  secretsTemporaryAccess: null;
  enterprisePamAccount: null;
  crossProjectSecretSharing: boolean;
  secretsFolderRbac: boolean;
};

export type TOrgPlanDTO = {
  projectId?: string;
  refreshCache?: boolean;
  rootOrgId: string;
} & TOrgPermission;

export enum LicenseType {
  Offline = "offline",
  Online = "online"
}

export type TLicenseKeyConfig =
  | {
      isValid: false;
    }
  | {
      isValid: true;
      licenseKey: string;
      type: LicenseType;
    };
