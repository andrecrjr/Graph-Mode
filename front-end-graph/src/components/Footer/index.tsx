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
        This project was initially developed as an MVP in Alpha Version.
        However, it is open-source, and contributions are welcome. You can
        contribute to the project on{" "}
        <b className="underline">
          <a href="https://github.com/andrecrjr/Notion-Graph-View">Github</a>
        </b>
        .
      </p>
    </footer>
  );
};
