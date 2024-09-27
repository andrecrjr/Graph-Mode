"use client";
import React from "react";

import LoadingPlaceholder from "./Loading";
import Sidebar from "../Sidebar";
import EditorPage from "../EditorPage";
import GraphSvg from "./GraphSvg";
import MockPage from "../MockPage";
import { LoadPageData } from "./LoadPageData";

export const GraphComponent: React.FC = () => {
  return (
    <LoadPageData>
      <MockPage>
        <div className="graph overflow-hidden max-w-screen">
          <LoadingPlaceholder />
          <Sidebar />
          <GraphSvg />
          <EditorPage />
        </div>
      </MockPage>
    </LoadPageData>
  );
};

export default GraphComponent;
