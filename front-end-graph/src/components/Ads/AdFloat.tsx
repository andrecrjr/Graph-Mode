"use client";

import React from "react";
import { FloatButton } from "../Buttons/FloatButton";
import AdsTerraBanner from "./Adsterra";

export const FloatAd: React.FC = () => {
  return (
    <FloatButton classNames="w-screen ad-show z-50 h-90">
      <AdsTerraBanner />
    </FloatButton>
  );
};
