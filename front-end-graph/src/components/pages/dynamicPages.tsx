"use client";

import LoadingPlaceholder from "@/components/Graph/Loading";
import dynamic from "next/dynamic";

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
    loading: () => <LoadingPlaceholder />,
    ssr: false,
  },
);
