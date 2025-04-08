"use client";
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useDarkMode } from "../Context/DarkModeContext";

export default function DarkModeToggle({ className = "" }: { className?: string }) {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <button
            onClick={toggleDarkMode}
            className={`p-2 top-[35px] right-[14px] rounded-full focus:outline-none transition-colors ${isDarkMode
                ? "text-yellow-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-200"
                } ${className}`}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDarkMode ? (
                <Sun size={20} className="animate-slow-spin transition-transform duration-300" />
            ) : (
                <Moon size={20} className="transition-transform duration-300 hover:rotate-12" />
            )}
        </button>
    );
} 