"use client";

import dynamic from "next/dynamic";
import LoadingDynamicPlaceholder from "../Loading";

export const GraphComponent = dynamic(
  () => import("@/components/Graph/GraphComponent"),
  {
    loading: () => <LoadingDynamicPlaceholder message="Your Cool Graph is loading" />,
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

export const ExtensionGraphComponent = dynamic(
  () => import("@/components/Graph/ExtensionGraphComponent"),
  {
    loading: () => <LoadingDynamicPlaceholder message="You are entering into the graph" />,
    ssr: false,
  },
);

export const DynamicLazySocketGraphPage = dynamic(() => import("@/components/socket/SocketGraphComponent"), {
  loading: () => <LoadingDynamicPlaceholder message="Boosting your Notion..." />,
  ssr: false,
});