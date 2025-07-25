import { auth } from "@/components/Auth";
import { GraphComponent } from "@/components/Graph";
import React from "react";
import type { Metadata } from "next";
import { fetchNotionServer } from "@/components/service/Notion";
import { isMock } from "@/components/utils";
import { redirect } from "next/navigation";


type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const id = params.id;
    if (isMock(id)) {
      return {
        title: "Example Graph",
      };
    }
    const data = await auth();

    const product = await fetchNotionServer<{ child_page: { title: string } }>(
      `https://api.notion.com/v1/blocks/${id}`,
      data?.user?.tokens?.access_token!,
    );
    return {
      title: `${product.child_page.title} Page - Graph Mode`,
      robots: "noindex, nofollow",
    };
  } catch (error) {
    return {
      title: "Graph Page",
    };
  }
}

export default async function GraphPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="overflow-hidden max-w-screen">
      <GraphComponent />
    </div>
  );
}
