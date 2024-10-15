"use client";
import React, { useState } from "react";
import { saveStorage } from "../utils";
import { useSession } from "next-auth/react";
import Link from "next/link";

export const History = () => {
  const data = useSession();

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

  if (data.status === "authenticated" && history && history.length > 0) {
    return (
      <section className="mx-auto text-center mt-3">
        <h3>Last Graph Pages</h3>
        <ul>
          {history.slice(0, 4).map((item) => {
            const pageId = item[0].replace("data-block-", "");
            return (
              <li key={item[0]}>
                <Link href={`/graph/${pageId}`} className="underline pb-2">
                  {localStorage.getItem(`title-graph-${pageId}`) ||
                    "Notion Page without Title"}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }
  return null;
};
