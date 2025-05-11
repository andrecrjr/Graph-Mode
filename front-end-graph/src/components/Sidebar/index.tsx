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
  CreditCard,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { memo, useState } from "react";
import { isMock, saveStorage } from "../utils";
import {
  clearNodePositions,
  saveNodePositions,
  syncPage,
} from "../utils/graph";
import { useGraphContextData } from "../Context/GraphContext";
import { GraphTheme, useTheme } from "../Context/ThemeContext";
import { themeConfigs } from "../utils/theme";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const { state } = useGraphContextData();
  const { nodes } = state;
  const path = usePathname();
  const isPathExtension = path.includes("/graph/extension/");
  const pageId = isPathExtension ? path.replace("/graph/extension/", "") : path;
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

  // Get background color from current theme
  const getSidebarBgColor = (): string => {
    try {
      const themeColor = getThemeColorClass(theme);
      return `${themeColor} bg-opacity-20`;
    } catch (error) {
      console.error("Error getting sidebar background color:", error);
      return 'bg-brown-500 bg-opacity-20'; // Default fallback
    }
  };

  // Get button hover color from current theme
  const getButtonHoverColor = (): string => {
    try {
      const baseColor = themeConfigs[theme as GraphTheme]?.nodeFill?.primary || 'fill-blue-500';
      return baseColor.replace('fill-', 'hover:bg-') + '/50';
    } catch (error) {
      console.error("Error getting button hover color:", error);
      return 'hover:bg-gray-700'; // Default fallback
    }
  };

  // Get icon color from current theme
  const getIconColorClass = (): string => {
    try {
      const baseColor = themeConfigs[theme as GraphTheme]?.nodeFill?.primary || '';
      return baseColor.replace('fill-', 'text-');
    } catch (error) {
      console.error("Error getting icon color:", error);
      return 'text-white'; // Default fallback
    }
  };

  const buttonHoverClass = getButtonHoverColor();
  const iconColorClass = theme === 'default' ? 'text-white' : getIconColorClass();

  return (
    <>
      <button
        className={`opacity-1 md:opacity-25 fixed top-4 right-0 z-40 p-2 flex justify-center ${isOpen ? getSidebarBgColor() : "bg-gray-800"} text-white bg-transparent`}
        onClick={toggleSidebar}
      >
        {isOpen ? <X className={`w-10 h-6 ${iconColorClass}`} /> : <Menu className={`w-12 h-6 ${iconColorClass}`} />}
      </button>
      <div
        className={`fixed top-0 ${getSidebarBgColor()} rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm border ${"right-0"} h-full ${isOpen ? "w-64" : "w-16"} text-white transition-all duration-300 ease-in-out z-30 overflow-hidden`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="mt-20">
          <ul className="flex flex-col">
            {(!isMock(state.pageId) || isPathExtension) && (
              <li className="w-full mt-auto self-center bg-green-700">
                <button
                  className="p-4 w-full flex items-center"
                  title="Synchronize with Notion"
                  onClick={(e) => {
                    syncPage(isPathExtension ? path.replace("/graph/extension/", "") : path.replace("/graph/", ""));
                    window.location.reload();
                  }}
                >
                  <RefreshCcw className={`${isOpen ? "mr-4" : "mx-auto"}`} />
                  {isOpen && <span>Syncronize with Notion</span>}
                </button>
              </li>
            )}
            <li className="w-full">
              <button
                className={`p-4 w-full ${buttonHoverClass} flex items-center`}
                title="Change graph theme"
                onClick={() => {
                  setIsOpen(true);
                  setShowThemeSelector(!showThemeSelector);
                }}
              >
                <Palette className={`${isOpen ? "mr-4" : "mx-auto"} ${iconColorClass}`} />
                {isOpen && <span>Change Graph Theme</span>}
              </button>
              {showThemeSelector && isOpen && (
                <div className="ml-4 pl-4 border-l border-gray-700">
                  {Object.keys(themeConfigs).map((themeName) => (
                    <button
                      key={themeName}
                      className={`p-2 w-full text-left flex items-center ${theme === themeName ? "bg-gray-700" : buttonHoverClass}`}
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
                className={`p-4 w-full ${buttonHoverClass} flex items-center`}
                title="You can fix positions to arrange the graphs later"
                onClick={(e) => {
                  e.preventDefault();
                  saveNodePositions(nodes, pageId);
                  window.location.reload();
                }}
              >
                <Pin className={`${isOpen ? "mr-4" : "mx-auto"} ${iconColorClass}`} />
                {isOpen && <span>Pin {nodes && "current"} Positions</span>}
              </button>
            </li>
            {saveStorage.get(`nodePositions-${pageId}`) && (
              <li className="w-full">
                <button
                  className={`p-4 w-full ${buttonHoverClass} flex items-center`}
                  title="You can fix positions to arrange the graphs later"
                  onClick={() => {
                    clearNodePositions(pageId);
                  }}
                >
                  <PinOff className={`${isOpen ? "mr-4" : "mx-auto"} ${iconColorClass}`} />
                  {isOpen && <span>Reset Pinned Positions</span>}
                </button>
              </li>
            )}
            <li className="w-full mt-auto self-center">
              <a
                className={`p-4 w-full ${buttonHoverClass} flex items-center`}
                href="https://ko-fi.com/B0B812WECP"
                title="Buy me a coffee"
              >
                <Coffee className={`${isOpen ? "mr-4" : "mx-auto"} ${iconColorClass}`} />
                {isOpen && <span>Buy me a coffee {";)"}</span>}
              </a>
            </li>

            {!isPathExtension && <li className="w-full mt-auto self-center">
              <a
                className={`p-4 w-full ${buttonHoverClass} flex items-center`}
                href="/app"
                title="Back to Home"
              >
                <ArrowLeft className={`${isOpen ? "mr-4" : "mx-auto"} ${iconColorClass}`} />
                {isOpen && <span>Back to Home</span>}
              </a>
            </li>}
            <li className="w-full mt-auto self-center">
              <a
                className={`p-4 w-full ${buttonHoverClass} flex items-center`}
                href={"/pricing"}
                title="Pricing"
                target="_blank"
              >
                <CreditCard className={`${isOpen ? "mr-4" : "mx-auto"} ${iconColorClass}`} />
                {isOpen && <span>Pricing</span>}
              </a>
            </li>

          </ul>
        </div>
      </div>
    </>
  );
};

export default memo(Sidebar);
