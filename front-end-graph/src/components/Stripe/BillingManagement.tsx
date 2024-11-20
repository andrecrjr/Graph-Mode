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
import { Session } from "next-auth";
import Link from "next/link";

export function SubscriptionSettings({ data }: { data: Session | null }) {
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
                {(data?.user.nextPaymentDate &&
                  convertDateToIntl(data?.user.nextPaymentDate || "")) ||
                  "Wait..."}
              </p>
            )}
          </>
          {!data?.user.lifetimePaymentId && !data.user.cancelAt && (
            <Button
              variant="destructive"
              onClick={() => {
                fetch(
                  `/api/update-checkout?subscriptionId=${data?.user.subscriptionId}`,
                  {
                    method: "DELETE",
                  },
                ).then((res) => {
                  window.location.reload();
                });
              }}
            >
              Cancel Subscription
            </Button>
          )}
          {data?.user.lifetimePaymentId && (
            <p>{"Thanks for your support in our project!"}</p>
          )}
          {data.user.cancelAt && !data?.user.lifetimePaymentId && (
            <p className="text-sm text-muted-foreground font-bold">
              This notice confirms that your subscription will terminate on{" "}
              {convertDateToIntl(data?.user.cancelAt || "")}. No additional
              invoices will be issued.
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
