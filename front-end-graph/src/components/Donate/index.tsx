/* eslint-disable @next/next/no-img-element */
import React from "react";

type Props = {};

export const KofiDonate = (props: Props) => {
  //   if (process.env.NODE_ENV === "production")
  return (
    <a
      href="https://ko-fi.com/B0B812WECP"
      className="w-[125px] mt-10"
      target="_blank"
    >
      <img
        height="36"
        className="w-[125px]"
        src="https://storage.ko-fi.com/cdn/kofi5.png?v=3"
        alt="Buy Me a Coffee at ko-fi.com"
        loading="lazy"
      />
    </a>
  );
};
