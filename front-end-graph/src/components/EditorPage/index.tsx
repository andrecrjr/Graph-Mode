"use client";
import { Notebook, Send, X } from "lucide-react";
import React, { useState } from "react";
import { Editor } from "../Editor";
import { Button } from "../ui/button";
import { useEditorContext } from "../Context/EditorContext";
import { fetchServer } from "../service/Notion";
import { useGraphContextData } from "../Context/GraphContext";
import { createOrUpdateNode, IS_DEVELOPMENT, saveStorage } from "../utils";
import { INotionPage } from "../../../types/notionPage";
import { useToast } from "@/components/hooks/use-toast";

export default function EditorPage() {
  const [isOpen, setIsOpen] = useState(true);
  const { toast } = useToast();
  const {
    state: { editorDocument, pageId, initialContentDocument },
  } = useEditorContext();
  console.log(editorDocument?.document);
  const {
    dispatch,
    state: { errorFetchGraph, loadingFetchGraph },
  } = useGraphContextData();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const createOrUpdatePage = async () => {
    try {
      if (editorDocument?.document && editorDocument.document.length > 0) {
        const data = await fetchServer<INotionPage>(
          "/translate/page",
          saveStorage.get("notionKey", true),
          {
            method: "POST",
            body: JSON.stringify({
              children: editorDocument.document,
              parentId: pageId,
              debug: false,
            }),
          },
        );
        // dispatch({
        //   type: "UPDATE_NODES",
        //   payload: createOrUpdateNode(pageId, data),
        // });
        setIsOpen(false);
        editorDocument.replaceBlocks(
          editorDocument.document,
          initialContentDocument,
        );
      }
    } catch (error) {
      console.error(error);
      toast({
        title: `Error`,
        description: "Problem to create your new Page Node, please try again.",
        className: "bg-red-500 text-white",
      });
    }
  };

  if (
    pageId !== "mock" &&
    !loadingFetchGraph &&
    !errorFetchGraph &&
    IS_DEVELOPMENT
  )
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
          className={`fixed top-0 right-0 h-full w-full sm:w-8/12 bg-white overflow-y-scroll dark:bg-gray-800 transform ${
            !isOpen ? "translate-x-full" : "translate-x-0"
          } transition-transform duration-200 ease-in-out z-40`}
        >
          <div className="mt-20">
            <Editor />
          </div>
        </div>
      </>
    );
}
