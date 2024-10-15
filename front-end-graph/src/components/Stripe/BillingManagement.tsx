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
import { getSession, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export function SubscriptionSettings() {
  const data = useSession();

  if (data.status === "authenticated" && !data.data?.user.subscriptionId) {
    redirect("/#pricing");
  }

  return (
    <Card className="w-6/12 mx-auto mt-10">
      <CardHeader>
        <CardTitle>Billing Management</CardTitle>
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
            Your next invoice is scheduled for 15/05/2023
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
