"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { convertDateToIntl } from "../utils";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function SubscriptionSettings() {
  const { data } = useSession();
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) {
      window.location.reload();
    }
  }, [cancelled]);

  if (!data) {
    console.log("abrindo");
    return <p>Loading</p>;
  }
  if (data?.user)
    return (
      <Card className="w-11/12 md:w-5/12 mx-auto mt-12">
        <CardHeader>
          <CardTitle>Subscription Dashboard</CardTitle>
          {data?.user.subscriptionId && !data?.user.lifetimePaymentId && (
            <CardDescription>
              Cancel your subscription easily at any time, no hassle required.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4 flex flex-wrap flex-col">
          <>
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
            {!data?.user.lifetimePaymentId && !data.user.cancelAt && (
              <p className="text-sm text-muted-foreground">
                Your next invoice is scheduled for{" "}
                {(data.user.nextPaymentDate &&
                  convertDateToIntl(data.user.nextPaymentDate)) ||
                  "Wait..."}
              </p>
            )}
          </>
          {!data?.user.lifetimePaymentId && !data.user.cancelAt && (
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  const res = await fetch(
                    `/api/update-checkout?subscriptionId=${data?.user.subscriptionId}`,
                    {
                      method: "DELETE",
                    },
                  );
                  if (res.ok) {
                    setCancelled(true);
                  }
                } catch (error) {
                  setCancelled(false);
                  alert(
                    "Problem to cancel your subscription please try again in few minutes!",
                  );
                }
              }}
            >
              Cancel Subscription
            </Button>
          )}
          {data.user.lifetimePaymentId && (
            <p>{"Thanks for your support in our project!"}</p>
          )}
          {data.user.cancelAt && !data.user.lifetimePaymentId && (
            <p className="text-sm text-muted-foreground font-bold">
              This notice confirms that your subscription will terminate on{" "}
              {convertDateToIntl(data.user.cancelAt)}. No additional invoices
              will be issued.
            </p>
          )}

          <Link href="/app" className="underline mb-6 items-end">
            Go back to Graph Mode
          </Link>
          <Link
            href="https://acjr.notion.site/12db5e58148c80c19144ce5f22f3f392?pvs=105"
            className="underline items-end"
          >
            Problem with your subscription? Contact Me!
          </Link>
        </CardContent>
      </Card>
    );
}
