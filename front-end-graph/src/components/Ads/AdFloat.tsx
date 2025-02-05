"use client";

import React from "react";
import { FloatButton } from "../Buttons/FloatButton";
import AdBanner from "./AdsLayout";

// import { Container } from './styles';

export const FloatAd: React.FC = () => {
  return (
    <FloatButton classNames="w-screen ad-show z-50 hidden">
      <AdBanner
        data-ad-slot="9763631377"
        id="float-graph"
        ad-style="width:100%;height:90px"
        className="w-full h-[90px] mb-2"
        onAdLoads={() => {
          document.querySelector(".ad-show")?.classList.remove("hidden");
        }}
      />
    </FloatButton>
  );
};
