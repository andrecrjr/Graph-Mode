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
import { convertDateToIntl } from "../utils";
import { Session } from "@auth/core/types";

export function SubscriptionSettings({ data }: { data: Session | null }) {
  return (
    <Card className="w-11/12 md:w-5/12 mx-auto mt-12">
      <CardHeader>
        <CardTitle>Subscription Dashboard</CardTitle>
        {data?.user.subscriptionId && !data.user.lifetimePaymentId && (
          <CardDescription>
            Cancel your subscription easily at any time, no hassle required.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-bold text-green-800">
            Current Plan:{" "}
            {data?.user.subscriptionId &&
              !data.user.lifetimePaymentId &&
              "Monthly Premium"}
            {data?.user.lifetimePaymentId && "Lifetime Project 🥇"}
            {!data?.user.lifetimePaymentId &&
              !data?.user.subscriptionId &&
              "Free"}
          </p>
          {!data?.user.lifetimePaymentId && (
            <p className="text-sm text-muted-foreground">
              Your next invoice is scheduled for{" "}
              {(data?.user.nextPaymentDate &&
                convertDateToIntl(data?.user.nextPaymentDate || "")) ||
                "Wait..."}
            </p>
          )}
        </div>
        {/* <Button variant="outline">Atualizar Método de Pagamento</Button> */}
        {!data?.user.lifetimePaymentId && (
          <Button
            variant="destructive"
            onClick={() => {
              fetch(
                `/api/update-checkout?subscriptionId=${data?.user.subscriptionId}`,
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
        )}
        {data?.user.lifetimePaymentId && <p>{"Thanks for your support!"}</p>}
      </CardContent>
    </Card>
  );
}
