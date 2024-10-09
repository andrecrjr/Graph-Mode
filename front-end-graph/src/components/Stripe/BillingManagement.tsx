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
import { getSession } from "next-auth/react";

export async function SubscriptionSettings() {
  const data = await getSession();
  console.log(data);
  return (
    <Card className="w-6/12 mx-auto mt-4">
      <CardHeader>
        <CardTitle>Billing Management</CardTitle>
        <CardDescription>
          Cancel your subscription whenever you want.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">Plano Atual: Free</p>
          <p className="text-sm text-muted-foreground">
            Sua próxima cobrança será em 15/05/2023
          </p>
        </div>
        {/* <Button variant="outline">Atualizar Método de Pagamento</Button> */}
        <Button
          variant="destructive"
          onClick={() => {
            fetch(
              "/api/update-checkout?subscriptionId=sub_1Q7lbmGy0EGoaKU30RnH9CVH",
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
