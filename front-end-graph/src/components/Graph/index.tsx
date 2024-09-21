"use client";
import React from "react";

import LoadingPlaceholder from "./Loading";
import Sidebar from "../Sidebar";
import EditorPage from "../EditorPage";
import GraphSvg from "./GraphSvg";
import { LoadPageData } from "./LoadPageData";

export const GraphComponent: React.FC = () => {
  return (
    <LoadPageData>
      <div className="graph overflow-hidden max-w-screen">
        <LoadingPlaceholder />
        <Sidebar />
        <GraphSvg />
        {/* <EditorPage /> */}
      </div>
    </LoadPageData>
  );
};

export default GraphComponent;
