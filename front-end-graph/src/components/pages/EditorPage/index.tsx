"use client";
import { Notebook, PenIcon, X } from "lucide-react";
import React from "react";
import { Editor } from "@/components/Editor";
import { Button } from "@/components/ui/button";
import { useGraphContextData } from "@/components/Context/GraphContext";
import SelectEditorBar from "./SelectNodeBar";
import { useEditorActionPage } from "@/components/hooks/useEditorAction";
import { useEditorContext } from "@/components/Context/EditorContext";
import clsx from "clsx";

export default function EditorPage() {
  const {
    state: { errorFetchGraph, loadingFetchGraph },
  } = useGraphContextData();
  const { createOrUpdatePage } = useEditorActionPage();

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
          className={clsx(
            "fixed bottom-7 right-8 min-w-16 sm:min-w-12 z-50 p-2 flex justify-center text-white rounded-full focus:outline-none",
            {
              "bg-green-500 hover:bg-green-700": !sidebarOpen,
              "bg-gray-500 hover:bg-gray-700": sidebarOpen,
            },
          )}
          onClick={toggleSidebar}
        >
          {!sidebarOpen ? <Notebook width={32} /> : <X />}
        </Button>
        <Button
          className={`fixed bottom-20 right-8 min-w-16 sm:min-w-12 z-50 p-2 hidden justify-center
           bg-green-600 hover:bg-green-700 text-white rounded-full focus:outline-none
            ${sidebarOpen && "flex"}`}
          onClick={createOrUpdatePage}
        >
          <PenIcon />
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
  // const { session: data } = useUserSession();
  // const { pageId } = useEditorActionPage();

  // if (
  //   data?.user.subscriptionId ||
  //   data?.user.lifetimePaymentId ||
  //   isMock(pageId)
  // )
  return (
    <>
      <section>
        <div className="px-8">
          <p className="text-center text-gray-500 font-bold">
            Fast Notes - BETA
          </p>
          <p className="italic text-gray-500 text-xs">
            Graph Convention: First heading in editor sets the page title.
          </p>
          <SelectEditorBar />
        </div>
        <Editor />
        <p className="text-center text-xs">
          Have suggestions or noticed a bug?{" "}
          <a
            href="https://acjr.notion.site/12db5e58148c80c19144ce5f22f3f392?pvs=105"
            target="_blank"
            className="underline"
            rel="noreferrer"
          >
            Let us know here!
          </a>
        </p>
      </section>
    </>
  );

  // return (
  //   <section className="w-full h-full flex flex-col justify-center items-center">
  //     <p className="font-bold">Fast Notes with Graph Mode PRO Only!</p>
  //     <p>{"Seamlessly connect to Notion with a PRO subscription."}</p>
  //     <p>
  //       Try out Fast Notes in our{" "}
  //       <Link href="/graph/mock" className="underline" target="_blank">
  //         Example Graph
  //       </Link>{" "}
  //     </p>
  //     <section className="flex justify-center gap-2 mt-2">
  //       <EmbeddedCheckoutButton priceId="month" />
  //     </section>
  //   </section>
  // );
};
