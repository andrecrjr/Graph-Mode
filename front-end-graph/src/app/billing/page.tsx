import { auth } from "@/components/Auth";
import { SubscriptionSettings } from "@/components/Stripe/BillingManagement";
import { redirect } from "next/navigation";
import React from "react";

const Settings: React.FC = async () => {
  const data = await auth();
  console.log(data);
  if (!data) {
    redirect("/");
  }

  return (
    <div>
      <SubscriptionSettings />
    </div>
  );
};

export default Settings;
