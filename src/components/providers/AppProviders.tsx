"use client";

import type { ReactNode } from "react";
import { DevPremiumBanner } from "@/components/billing/DevPremiumBanner";
import { AuthProvider } from "@/contexts/AuthContext";
import { BillingProvider } from "@/contexts/BillingContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <BillingProvider>
        <DevPremiumBanner />
        {children}
      </BillingProvider>
    </AuthProvider>
  );
}
