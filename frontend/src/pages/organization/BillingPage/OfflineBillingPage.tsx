import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";

import { OrgPermissionCan } from "@app/components/permissions";
import { Alert, AlertDescription, AlertTitle } from "@app/components/v3";
import { PageHeader } from "@app/components/v3/platform";
import { envConfig } from "@app/config/env";
import { OrgPermissionBillingActions, OrgPermissionSubjects } from "@app/context";

// Standalone billing page for offline (air-gapped) licenses. It makes no API calls — the license
// server is unreachable, so every billing/subscription request would fail — and just explains that
// billing is managed out-of-band.
export const OfflineBillingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="h-full bg-page">
      <Helmet>
        <title>{t("common.head-title", { title: t("billing.title") })}</title>
        <link rel="icon" href="/infisical.ico" />
        <meta property="og:image" content="/images/message.png" />
      </Helmet>
      <div className="flex h-full w-full justify-center bg-page text-foreground-inverse">
        <div className="w-full max-w-8xl">
          <PageHeader
            scope="org"
            title={t("billing.title")}
            description={
              envConfig.ENTERPRISE_BYPASS
                ? "All features are enabled on this self-hosted instance."
                : "Your plan is provisioned through an offline license."
            }
          />
          <OrgPermissionCan
            passThrough={false}
            I={OrgPermissionBillingActions.Read}
            a={OrgPermissionSubjects.Billing}
          >
            <Alert variant="info">
              <TriangleAlert />
              <AlertTitle>
                {envConfig.ENTERPRISE_BYPASS ? "Self-hosted enterprise" : "Offline license"}
              </AlertTitle>
              <AlertDescription>
                {envConfig.ENTERPRISE_BYPASS ? (
                  "This self-hosted instance has all enterprise features enabled. Subscription and billing management are disabled."
                ) : (
                  <>
                    This instance runs on an offline license, so subscription and billing management
                    isn&apos;t available here. Contact your Infisical account manager to make changes to
                    your plan.
                  </>
                )}
              </AlertDescription>
            </Alert>
          </OrgPermissionCan>
        </div>
      </div>
    </div>
  );
};
