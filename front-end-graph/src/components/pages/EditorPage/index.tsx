"use client";
import { Notebook, PenIcon, X } from "lucide-react";
import React from "react";
import { Editor } from "@/components/Editor";
import { Button } from "@/components/ui/button";
import { useGraphContextData } from "@/components/Context/GraphContext";
import SelectEditorBar from "./SelectNodeBar";
import { useEditorActionPage } from "@/components/hooks/useEditorAction";
import Link from "next/link";
import { useUserSession } from "@/components/Context/UserSessionContext";
import { IS_DEVELOPMENT, isMock } from "@/components/utils";
import { useEditorContext } from "@/components/Context/EditorContext";

export default function EditorPage() {
  const {
    state: { errorFetchGraph, loadingFetchGraph },
  } = useGraphContextData();

  const {
    state: { sidebarOpen },
    editorDispatch,
  } = useEditorContext();

  const toggleSidebar = () => {
    editorDispatch({
      type: "OPEN_SIDEBAR",
      payload: { sidebarOpen: !sidebarOpen },
    });
  };

  if (!loadingFetchGraph && !errorFetchGraph) {
    return (
      <>
        <Button
          className="fixed bottom-7 right-8 min-w-16 sm:min-w-12 z-50 p-2 flex justify-center bg-black hover:bg-gray-700 text-white rounded-full focus:outline-none"
          onClick={toggleSidebar}
        >
          {!sidebarOpen ? <Notebook width={32} /> : <X />}
        </Button>

        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-8/12 bg-white overflow-y-scroll dark:bg-gray-800 transform pt-10 ${
            !sidebarOpen ? "translate-x-full" : "translate-x-0"
          } transition-transform duration-200 ease-in-out z-40`}
        >
          <EditorPageContent isOpen={sidebarOpen} />
        </div>
      </>
    );
  }
}

const EditorPageContent = ({ isOpen }: { isOpen: boolean }) => {
  const { session: data } = useUserSession();
  const { createOrUpdatePage, pageId } = useEditorActionPage();
  if (data?.user.subscriptionId || isMock(pageId))
    return (
      <>
        <Button
          className={`fixed bottom-20 right-4 min-w-16 sm:min-w-12 z-50 p-2 hidden justify-center
           bg-green-600 hover:bg-green-700 text-white rounded-full focus:outline-none
            ${isOpen && "flex"}`}
          onClick={createOrUpdatePage}
        >
          <PenIcon />
        </Button>
        <section>
          <div className="px-8">
            <p className="text-center text-gray-500 font-bold">
              Fast Notes - BETA
            </p>
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
      <p className="font-bold">
        Fast Notes: Coming Soon with Graph Mode (PRO Only)!
      </p>
      <p>
        {
          "You'll can create seamless connections to Notion directly from here being PRO!"
        }
      </p>
      <p>
        Try out Fast Notes in our{" "}
        <Link href="/graph/mock" className="underline" target="_blank">
          Example Graph
        </Link>{" "}
      </p>
    </section>
  );
};
