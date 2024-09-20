import React from "react";
import { IS_DEVELOPMENT } from "../utils";

type Props = {};

export const GeneralFooter = (props: Props) => {
  return (
    <footer className="mt-auto mb-12 text-center ">
      {IS_DEVELOPMENT && (
        <p className="text-center text-sm w-auto mb-2">
          You are using <strong>localhost/development env</strong>
        </p>
      )}
      <p className="w-8/12 mx-auto text-xs">
        This project was initially developed as an MVP in BETA Version. However,
        some feature can be a bit bug in this beggining,{" "}
        <a href="mailto:andreandreuchiha@gmail.com">you can mail me</a>.
      </p>
    </footer>
  );
};
