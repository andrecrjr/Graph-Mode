import { auth } from "@/components/Auth";
import { SubscriptionSettings } from "@/components/Stripe/BillingManagement";
import React from "react";

const Settings: React.FC = async () => {
  const data = await auth();
  return (
    <>
      <SubscriptionSettings data={data} />
    </>
  );
};

export default Settings;
