import { auth } from "@/components/Auth";
import GraphComponent from "@/components/Graph";
import { redirect } from "next/navigation";
import React from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { fetchServer } from "@/components/service/Notion";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  try {
    const id = params.id;
    if (id === "mock") {
      return {
        title: "Example Graph",
      };
    }
    const data = await auth();

    const product = await fetchServer<{ child_page: { title: string } }>(
      `/only/${id}?children=false`,
      data?.user?.tokens?.access_token!,
      {},
      true,
    );
    return {
      title: `${product.child_page.title} Page - Graph Mode`,
    };
  } catch (error) {
    console.log("Error Page", error);
    return {
      title: "Graph Page",
    };
  }
}

const GraphPage = async ({ params }: { params: { id: string } }) => {
  const data = await auth();
  if (params.id === "mock" && data) {
    redirect("/app");
  }

  return (
    <div className="overflow-hidden max-w-screen">
      <GraphComponent />
    </div>
  );
};

export default GraphPage;
