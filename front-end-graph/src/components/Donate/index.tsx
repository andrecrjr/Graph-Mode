/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";

export const KofiDonate = () => {
  return (
    <Link href="https://ko-fi.com/B0B812WECP">
      <Button
        variant="outline"
        className="flex items-center space-x-2 bg-yellow-300 hover:bg-yellow-200"
      >
        <Coffee className="h-4 w-4" />
        <span>Buy Me a Coffee</span>
      </Button>
    </Link>
  );
};
