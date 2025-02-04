import React from "react";
import { IS_DEVELOPMENT } from "../utils";
import { NotionHome } from "../svg/NotionHome";
import Link from "next/link";
import AdBanner from "../Ads/AdsLayout";

export const GeneralFooter = () => {
  return (
    <footer className="mt-auto h-auto pt-5 bg-gray-50 text-center flex justify-center flex-col items-center  z-50">
      <AdBanner
        data-ad-format="auto"
        data-ad-slot="5070735560"
        data-full-width-responsive="true"
        className="w-full mt-3 h-[70px] mb-2"
      />
      <div className="pb-2">
        <NotionHome />
      </div>
      <Link
        className="text-sm font-medium underline underline-offset-4 strong"
        href="/terms"
      >
        Privacy Terms
      </Link>
      {IS_DEVELOPMENT && (
        <p className="text-center text-sm w-auto mb-2">
          You are using <strong>localhost/development env</strong>
        </p>
      )}
      <p className="w-8/12 mx-auto text-xs">
        This project is currently in its BETA stage, initially developed as an
        MVP. While we strive for a smooth experience, some features may still
        have minor bugs. If you encounter any issues, feel free to{" "}
        <a
          href="https://acjr.notion.site/12db5e58148c80c19144ce5f22f3f392?pvs=105"
          className="bold"
        >
          contact me via Contact Support Form
        </a>
        .
      </p>
    </footer>
  );
};
