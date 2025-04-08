"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type DarkModeContextType = {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType>({
    isDarkMode: false,
    toggleDarkMode: () => null,
});

export const DarkModeProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check if darkMode is stored in localStorage
        try {
            const storedDarkMode = localStorage.getItem("darkMode");
            if (storedDarkMode !== null) {
                setIsDarkMode(JSON.parse(storedDarkMode));
            } else {
                // If not stored, check system preference
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                setIsDarkMode(prefersDark);
            }
        } catch (error) {
            console.error("Error loading dark mode preference:", error);
        }
    }, []);

    useEffect(() => {
        // Apply dark mode class to html element whenever isDarkMode changes
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        // Save preference to localStorage
        try {
            localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
        } catch (error) {
            console.error("Error saving dark mode preference:", error);
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (context === undefined) {
        throw new Error("useDarkMode must be used within a DarkModeProvider");
    }
    return context;
}; 