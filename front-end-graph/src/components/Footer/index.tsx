import React from "react";
import { IS_DEVELOPMENT } from "../utils";
import { NotionHome } from "../svg/NotionHome";
import Link from "next/link";
import AdBanner from "../Ads/AdsLayout";

export const GeneralFooter = () => {
  return (
    <footer className="mt-auto h-auto pt-5 bg-gray-50 dark:bg-gray-900 text-center flex justify-center flex-col items-center z-50 transition-colors duration-200">
      <div className="pb-2">
        <NotionHome />
      </div>
      <Link
        className="text-sm font-medium underline underline-offset-4 strong dark:text-white"
        href="/terms"
      >
        Privacy Terms
      </Link>
      {IS_DEVELOPMENT && (
        <p className="text-center text-sm w-auto mb-2 dark:text-gray-300">
          You are using <strong>localhost/development env</strong>
        </p>
      )}
      <p className="w-8/12 mx-auto text-xs dark:text-gray-300">
        This project is currently in its BETA stage, initially developed as an
        MVP. While we strive for a smooth experience, some features may still
        have minor bugs. If you encounter any issues, feel free to{" "}
        <a
          href="https://acjr.notion.site/12db5e58148c80c19144ce5f22f3f392?pvs=105"
          className="bold dark:text-blue-300"
        >
          contact me via Contact Support Form
        </a>
        .
      </p>
    </footer>
  );
};
