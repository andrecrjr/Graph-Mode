"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { saveStorage } from "../utils";

export type GraphTheme = "default" | "dark" | "blue" | "green";

type ThemeContextType = {
    theme: GraphTheme;
    setTheme: (theme: GraphTheme) => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: "default",
    setTheme: () => null,
});

export const ThemeProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [theme, setThemeState] = useState<GraphTheme>("default");

    useEffect(() => {
        // Load theme from localStorage on initial render
        try {
            const savedTheme = localStorage.getItem("graph-theme");
            if (savedTheme) {
                // Check if it's a valid theme
                const parsedTheme = JSON.parse(savedTheme);
                if (parsedTheme && typeof parsedTheme === "string") {
                    setThemeState(parsedTheme as GraphTheme);
                }
            }
        } catch (error) {
            console.error("Error loading theme:", error);
            // If there's an error, set default theme
            setThemeState("default");
        }
    }, []);

    const setTheme = (newTheme: GraphTheme) => {
        setThemeState(newTheme);
        try {
            // Always stringify the theme value to ensure valid JSON
            localStorage.setItem("graph-theme", JSON.stringify(newTheme));
        } catch (error) {
            console.error("Error saving theme:", error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}; 