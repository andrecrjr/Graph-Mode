"use client";
import {
  ArrowLeft,
  Coffee,
  Menu,
  Pin,
  PinOff,
  RefreshCcw,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { isMock, saveStorage } from "../utils";
import {
  clearNodePositions,
  saveNodePositions,
  syncPage,
} from "../utils/graph";
import { useGraphContextData } from "../Context/GraphContext";
import { useSession } from "next-auth/react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useGraphContextData();
  const { nodes } = state;
  const router = useRouter();
  const data = useSession();
  const path = usePathname().replace("/graph/", "");

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        className={`fixed top-4 left-4 z-40 p-2 flex justify-center ${isOpen ? "bg-gray-700" : "bg-gray-800"} text-white rounded-full focus:outline-none`}
        onClick={toggleSidebar}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="mt-20">
          <ul className="flex flex-col">
            <li className="w-full">
              <button
                className="p-4 w-full hover:bg-gray-700 flex"
                title="You can fix positions to arrange the graphs later"
                onClick={(e) => {
                  e.preventDefault();
                  saveNodePositions(nodes, path);
                  window.location.reload();
                }}
              >
                <Pin className="mr-4" /> Pin {nodes && "current"} Positions
              </button>
            </li>
            {saveStorage.get(`nodePositions-${path}`) && (
              <li className="w-full">
                <button
                  className="p-4 w-full hover:bg-gray-700 flex"
                  title="You can fix positions to arrange the graphs later"
                  onClick={() => {
                    clearNodePositions(path);
                  }}
                >
                  <PinOff className="mr-4" /> Reset Pinned Positions
                </button>
              </li>
            )}
            <li className="w-full mt-auto self-center">
              <a
                className="p-4 w-full hover:bg-gray-700 flex"
                href="https://ko-fi.com/B0B812WECP"
              >
                <Coffee className="mr-4" /> Buy me a coffee {";)"}
              </a>
            </li>
            {!isMock(state.pageId) && (
              <li className="w-full mt-auto self-center">
                <button
                  className="p-4 w-full hover:bg-gray-700 flex"
                  onClick={(e) => {
                    syncPage(path);
                    window.location.reload();
                  }}
                >
                  <RefreshCcw className="mr-4" /> Syncronize with Notion
                </button>
              </li>
            )}
            <li className="w-full mt-auto self-center">
              <a className="p-4 w-full hover:bg-gray-700 flex" href="/app">
                <ArrowLeft className="mr-4" /> Back to Home
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
