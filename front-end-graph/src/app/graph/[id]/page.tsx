import { auth } from "@/components/Auth";
import GraphComponent from "@/components/Graph";
import { redirect } from "next/navigation";
import React from "react";

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
