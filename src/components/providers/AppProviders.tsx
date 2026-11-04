"use client";

import type { ReactNode } from "react";
import { VisitTracker } from "@/components/analytics/VisitTracker";
import { DevPremiumBanner } from "@/components/billing/DevPremiumBanner";
import { PremiumTrialBanner } from "@/components/billing/PremiumTrialBanner";
import { AuthProvider } from "@/contexts/AuthContext";
import { BillingProvider } from "@/contexts/BillingContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <BillingProvider>
        <VisitTracker />
        <DevPremiumBanner />
        <PremiumTrialBanner />
        {children}
      </BillingProvider>
    </AuthProvider>
  );
}
