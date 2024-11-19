"use client";
import React, { useState } from "react";
import { saveStorage } from "../utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Trash } from "lucide-react";
import { Button } from "../ui/button";

const History = () => {
  const { status, data: session } = useSession();

  const [history, _] = useState(
    Object.entries(saveStorage.getAll()).filter((item) => {
      if (
        item[0].includes("data-block") &&
        !item[0].includes("data-block-mock") &&
        !item[0].includes("temp")
      )
        return item[1];
    }) || {},
  );

  if (!session) {
    return null;
  }
  console.log(session);

  if (
    status === "authenticated" &&
    history &&
    history.length > 0 &&
    (session?.user.lifetimePaymentId || session?.user.subscriptionId)
  ) {
    return (
      <section className="mx-auto text-center mt-3">
        <h3>Last Graph Pages</h3>
        <ul className="pb-3">
          {history.slice(0, 5).map((item) => {
            const pageId = item[0].replace("data-block-", "");
            return (
              <li key={item[0]} className="flex justify-center items-center">
                <Link
                  href={`/graph/${pageId}`}
                  className="underline justify-center"
                >
                  {localStorage.getItem(`title-graph-${pageId}`) ||
                    "Notion Page without Title"}
                </Link>
                <Button
                  onClick={() => {
                    localStorage.removeItem(`title-graph-${pageId}`);
                    localStorage.removeItem(`data-block-${pageId}`);
                    window.location.reload();
                  }}
                  className="hover:opacity-55"
                  variant={"ghost"}
                >
                  <Trash className="w-8" />
                </Button>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  if (!session?.user.lifetimePaymentId || !session?.user.subscriptionId) {
    return (
      <p className="text-center pt-5">
        Access your latest history with{" "}
        <Link href="/pricing" className="underline">
          PRO
        </Link>
        .
      </p>
    );
  }

  return null;
};

export default History;
