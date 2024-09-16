"use client";
import { Notebook, X } from "lucide-react";
import React, { useState } from "react";
import { Editor } from "../Editor";

export default function EditorPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [markdown, setMarkdown] = useState("");

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleChange = (e: any) => {
    setMarkdown(e.target.value);
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-4 min-w-12 z-50 p-2 flex justify-center bg-blue-500 text-white rounded-full focus:outline-none"
        onClick={toggleSidebar}
      >
        {isOpen ? <Notebook /> : <X />}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-6/12 bg-white dark:bg-gray-800 transform ${
          isOpen ? "translate-x-full" : "translate-x-0"
        } transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="mt-20 mx-2">
          <Editor />
        </div>
      </div>
    </>
  );
}
