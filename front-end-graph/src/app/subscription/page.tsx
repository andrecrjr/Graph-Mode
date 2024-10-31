import { auth } from "@/components/Auth";
import { SubscriptionSettings } from "@/components/Stripe/BillingManagement";
import { redirect } from "next/navigation";
import React from "react";

const Settings: React.FC = async () => {
  const data = await auth();

  if (!data?.user.subscriptionId && !data?.user.lifetimePaymentId) {
    return redirect("/#pricing");
  }

  return (
    <>
      <SubscriptionSettings data={data} />
    </>
  );
};

export default Settings;
