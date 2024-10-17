"use client";
import { Notebook, Send, X } from "lucide-react";
import React, { useState } from "react";
import { Editor } from "@/components/Editor";
import { Button } from "@/components/ui/button";
import { useGraphContextData } from "@/components/Context/GraphContext";
import { IS_DEVELOPMENT } from "@/components/utils";
import SelectEditorBar from "./SelectNodeBar";
import { useEditorActionPage } from "@/components/hooks/useEditorAction";

export default function EditorPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { createOrUpdatePage } = useEditorActionPage();

  const {
    state: { errorFetchGraph, loadingFetchGraph },
  } = useGraphContextData();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  if (!loadingFetchGraph && !errorFetchGraph && IS_DEVELOPMENT)
    return (
      <>
        <Button
          className="fixed bottom-7 right-8 min-w-16 sm:min-w-12 z-50 p-2 flex justify-center bg-black hover:bg-gray-700 text-white rounded-full focus:outline-none"
          onClick={toggleSidebar}
        >
          {!isOpen ? <Notebook width={32} /> : <X />}
        </Button>
        <Button
          className={`fixed bottom-20 right-8 min-w-16 sm:min-w-12 z-50 p-2 hidden justify-center
           bg-green-600 hover:bg-green-700 text-white rounded-full focus:outline-none
            ${isOpen && "flex"}`}
          onClick={createOrUpdatePage}
        >
          <Send />
        </Button>
        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-8/12 bg-white overflow-y-scroll dark:bg-gray-800 transform pt-10 ${
            !isOpen ? "translate-x-full" : "translate-x-0"
          } transition-transform duration-200 ease-in-out z-40`}
        >
          <section>
            <div className="px-8">
              <p className="italic text-gray-500">
                Heading will be your title page in Notion
              </p>
              <SelectEditorBar />
            </div>
            <Editor />
          </section>
        </div>
      </>
    );
}
