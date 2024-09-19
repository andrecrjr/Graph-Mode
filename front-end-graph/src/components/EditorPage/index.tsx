"use client";
import { Notebook, X } from "lucide-react";
import React, { useState } from "react";
import { Editor } from "../Editor";
import { Button } from "../ui/button";
import { useEditorContext } from "../Context/EditorContext";
import { fetchServer } from "../service/Notion";
import { useGraphContextData } from "../Context/GraphContext";
import { saveStorage, uuidFormatted } from "../utils";
import { INotionPage } from "../../../types/notionPage";

export default function EditorPage() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    state: { editorDocument, pageId },
  } = useEditorContext();
  const { dispatch } = useGraphContextData();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const createOrUpdatePage = async () => {
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
      console.log(data);
      // dispatch({
      //   type: "UPDATE_NODES",
      //   payload: {
      //     nodes: [
      //       {
      //         id,
      //         label: properties?.title.title[0].plain_text,
      //       },
      //     ],
      //     links: [
      //       {
      //         source: id,
      //         target: uuidFormatted(pageId),
      //       },
      //     ],
      //   },
      // });
      //setIsOpen(false);
    }
  };
  return (
    <>
      <button
        className="fixed bottom-6 right-4 min-w-12 z-50 p-2 flex justify-center bg-blue-500 text-white rounded-full focus:outline-none"
        onClick={toggleSidebar}
      >
        {!isOpen ? <Notebook /> : <X />}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-6/12 bg-white dark:bg-gray-800 transform ${
          !isOpen ? "translate-x-full" : "translate-x-0"
        } transition-transform duration-200 ease-in-out z-40`}
      >
        <div className="mt-20">
          <Button onClick={createOrUpdatePage}>Create Page</Button>

          <Editor />
        </div>
      </div>
    </>
  );
}
