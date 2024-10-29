"use client";
import { Notebook, Send, X } from "lucide-react";
import React, { useState } from "react";
import { Editor } from "@/components/Editor";
import { Button } from "@/components/ui/button";
import { useGraphContextData } from "@/components/Context/GraphContext";
import SelectEditorBar from "./SelectNodeBar";
import { useEditorActionPage } from "@/components/hooks/useEditorAction";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Session } from "next-auth";

export default function EditorPage() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    state: { errorFetchGraph, loadingFetchGraph },
  } = useGraphContextData();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  if (!loadingFetchGraph && !errorFetchGraph) {
    return (
      <>
        <Button
          className="fixed bottom-7 right-8 min-w-16 sm:min-w-12 z-50 p-2 flex justify-center bg-black hover:bg-gray-700 text-white rounded-full focus:outline-none"
          onClick={toggleSidebar}
        >
          {!isOpen ? <Notebook width={32} /> : <X />}
        </Button>

        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-8/12 bg-white overflow-y-scroll dark:bg-gray-800 transform pt-10 ${
            !isOpen ? "translate-x-full" : "translate-x-0"
          } transition-transform duration-200 ease-in-out z-40`}
        >
          <EditorPageContent isOpen={isOpen} />
        </div>
      </>
    );
  }
}

const EditorPageContent = ({ isOpen }: { isOpen: boolean }) => {
  const { data } = useSession();
  const { createOrUpdatePage } = useEditorActionPage();

  if (data?.user.subscriptionId)
    return (
      <>
        <Button
          className={`fixed bottom-20 right-8 min-w-16 sm:min-w-12 z-50 p-2 hidden justify-center
           bg-green-600 hover:bg-green-700 text-white rounded-full focus:outline-none
            ${isOpen && "flex"}`}
          onClick={createOrUpdatePage}
        >
          <Send />
        </Button>
        <section>
          <div className="px-8">
            <p className="italic text-gray-500 text-sm">
              Graph Convention: First heading in editor sets the page title.
            </p>
            <SelectEditorBar />
          </div>
          <Editor />
        </section>
      </>
    );

  return (
    <section className="w-full h-full flex flex-col justify-center items-center">
      <p className="font-bold">Soon with Graph Mode PRO Only!</p>
      <p>
        You can test this function in our{" "}
        <Link href="/graph/mock" className="underline">
          DEMO
        </Link>
      </p>
    </section>
  );
};
