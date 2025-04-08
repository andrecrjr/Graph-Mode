"use client";
import React from "react";

import Sidebar from "../Sidebar";
import EditorPage from "@/components/pages/EditorPage";
import { GraphSVGLazyComponent, LoadingGraphLazyComponent } from "./index";
import { LoadPageData } from "./LoadPageData";
import MockPage from "@/components/pages/MockPage";
import { useTheme } from "../Context/ThemeContext";
import { getThemeConfig } from "../utils/theme";

export const GraphComponent: React.FC = () => {
  const { theme } = useTheme();

  // Get theme config safely
  const themeConfig = React.useMemo(() => {
    try {
      return getThemeConfig(theme);
    } catch (error) {
      console.error("Error getting theme config:", error);
      return getThemeConfig("default");
    }
  }, [theme]);

  return (
    <MockPage>
      <LoadPageData>
        <div className={`graph overflow-hidden max-w-screen ${themeConfig.backgroundClass || "dark:bg-black bg-white"}`}>
          <Sidebar />
          <LoadingGraphLazyComponent />
          <GraphSVGLazyComponent />
          <EditorPage />
        </div>
      </LoadPageData>
    </MockPage>
  );
};

export default GraphComponent;
