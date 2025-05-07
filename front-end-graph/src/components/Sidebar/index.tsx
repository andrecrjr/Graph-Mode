"use client";
import {
  ArrowLeft,
  Coffee,
  Menu,
  Pin,
  PinOff,
  RefreshCcw,
  Palette,
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
import { GraphTheme, useTheme } from "../Context/ThemeContext";
import { themeConfigs } from "../utils/theme";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const { state } = useGraphContextData();
  const { nodes } = state;
  const router = useRouter();
  const data = useSession();
  const pathExtension = usePathname().includes("/graph/extension/");
  const path = pathExtension ? usePathname().replace("/graph/extension/", "") : usePathname().replace("/graph/", "");

  const { theme, setTheme } = useTheme();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeChange = (newTheme: GraphTheme) => {
    try {
      setTheme(newTheme);
      setShowThemeSelector(false);
    } catch (error) {
      console.error("Error changing theme:", error);
    }
  };

  // Safe way to get theme color class
  const getThemeColorClass = (themeName: string): string => {
    try {
      const theme = themeConfigs[themeName as GraphTheme];
      if (theme && theme.nodeFill && theme.nodeFill.primary) {
        return theme.nodeFill.primary.replace('fill-', 'bg-');
      }
      return 'bg-blue-500'; // Default fallback
    } catch (error) {
      console.error("Error getting theme color:", error);
      return 'bg-blue-500'; // Default fallback
    }
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
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="mt-20">
          <ul className="flex flex-col">
            <li className="w-full">
              <button
                className="p-4 w-full hover:bg-gray-700 flex"
                title="Change graph theme"
                onClick={() => setShowThemeSelector(!showThemeSelector)}
              >
                <Palette className="mr-4" /> Change Graph Theme
              </button>
              {showThemeSelector && (
                <div className="ml-4 pl-4 border-l border-gray-700">
                  {Object.keys(themeConfigs).map((themeName) => (
                    <button
                      key={themeName}
                      className={`p-2 w-full text-left flex items-center ${theme === themeName ? "bg-gray-700" : "hover:bg-gray-800"
                        }`}
                      onClick={() => handleThemeChange(themeName as GraphTheme)}
                    >
                      <div
                        className={`w-4 h-4 mr-2 rounded-full ${getThemeColorClass(themeName)}`}
                      ></div>
                      {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </li>
            <li className="w-full">
              <button
                className="p-4 w-full hover:bg-gray-700 flex"
                title="You can fix positions to arrange the graphs later"
                onClick={(e) => {
                  e.preventDefault();
                  saveNodePositions(nodes, path);
                  window.location.reload();
                  window.location.href = `/graph/${path}`;
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
