import { auth } from "@/components/Auth";
import { BillingManagement } from "@/components/pages/dynamicPages";
import { redirect } from "next/navigation";
import React from "react";

const Settings: React.FC = async () => {
  const data = await auth();

  if (!data?.user.subscriptionId && !data?.user.lifetimePaymentId) {
    return redirect("/#pricing");
  }

  return <BillingManagement />;
};

export default Settings;
