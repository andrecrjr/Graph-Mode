"use client";
import React from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { convertDateToIntl } from "../utils";

export function SubscriptionSettings() {
  const data = useSession();

  if (data.status === "authenticated" && !data.data?.user.subscriptionId) {
    redirect("/#pricing");
  }

  return (
    <Card className="w-11/12 md:w-5/12 mx-auto mt-12">
      <CardHeader>
        <CardTitle>Subscription Dashboard</CardTitle>
        <CardDescription>
          Cancel your subscription easily at any time, no hassle required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">
            Current Plan:{" "}
            {(data.data?.user.subscriptionId !== "" && "Monthly Premium") ||
              "Free"}
          </p>
          <p className="text-sm text-muted-foreground">
            Your next invoice is scheduled for{" "}
            {(data.data?.user.nextPaymentDate &&
              convertDateToIntl(data.data?.user.nextPaymentDate || "")) ||
              "Wait..."}
          </p>
        </div>
        {/* <Button variant="outline">Atualizar Método de Pagamento</Button> */}
        <Button
          variant="destructive"
          onClick={() => {
            fetch(
              `/api/update-checkout?subscriptionId=${data.data?.user.subscriptionId}`,
              {
                method: "DELETE",
              },
            ).then((res) => {
              console.log(res);
            });
          }}
        >
          Cancelar Assinatura
        </Button>
      </CardContent>
    </Card>
  );
}
