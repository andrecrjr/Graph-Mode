"use client";

import LoadingPlaceholder from "@/components/Graph/Loading";
import dynamic from "next/dynamic";
import LoadingDynamicPlaceholder from "../Loading";

export const GraphComponent = dynamic(
  () => import("@/components/Graph/GraphComponent"),
  {
    loading: () => <LoadingPlaceholder />,
    ssr: false,
  },
);

export const BillingManagement = dynamic(
  () => import("@/components/Stripe/BillingManagement"),
  {
    loading: () => (
      <LoadingDynamicPlaceholder message="Loading Subscription Data" />
    ),
    ssr: false,
  },
);

export const PricingTierComponent = dynamic(
  () => import("@/components/Home/Tier"),
  {
    loading: () => <LoadingDynamicPlaceholder message="Loading Tiers Data" />,
    ssr: false,
  },
);
