import React from "react";
import { IS_DEVELOPMENT } from "../utils";
import { NotionHome } from "../svg/NotionHome";

export const GeneralFooter = () => {
  return (
    <footer className="mt-auto h-auto pt-5 bg-gray-50 text-center flex justify-center flex-col items-center  z-50">
      <div className="pb-2">
        <NotionHome />
      </div>
      {IS_DEVELOPMENT && (
        <p className="text-center text-sm w-auto mb-2">
          You are using <strong>localhost/development env</strong>
        </p>
      )}
      <p className="w-8/12 mx-auto text-xs">
        This project is currently in its BETA stage, initially developed as an
        MVP. While we strive for a smooth experience, some features may still
        have minor bugs. If you encounter any issues, feel free to{" "}
        <a href="mailto:andreandreuchiha@gmail.com">contact me via email</a>.
      </p>
    </footer>
  );
};
