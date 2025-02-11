"use client";

import dynamic from "next/dynamic";
import LoadingDynamicPlaceholder from "../Loading";

export const GraphComponent = dynamic(
  () => import("@/components/Graph/GraphComponent"),
  {
    loading: () => <LoadingDynamicPlaceholder />,
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
    loading: () => <LoadingDynamicPlaceholder message="Loading Plans" />,
    ssr: false,
  },
);
