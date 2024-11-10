"use client";
import React from "react";

import LoadingPlaceholder from "./Loading";
import Sidebar from "../Sidebar";
import EditorPage from "@/components/pages/EditorPage";
import GraphSvg from "./GraphSvg";
import { LoadPageData } from "./LoadPageData";
import MockPage from "@/components/pages/MockPage";

export const GraphComponent: React.FC = () => {
  return (
    <MockPage>
      <LoadPageData>
        <div className="graph overflow-hidden max-w-screen">
          <LoadingPlaceholder />
          <Sidebar />
          <GraphSvg />
          <EditorPage />
        </div>
      </LoadPageData>
    </MockPage>
  );
};

export default GraphComponent;
