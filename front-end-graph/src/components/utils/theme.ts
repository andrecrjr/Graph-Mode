import { GraphTheme } from "../Context/ThemeContext";

export interface ThemeConfig {
    nodeFill: {
        primary: string;
        secondary: string;
    };
    linkStroke: string;
    labelFill: string;
    backgroundClass: string;
}

// Default theme configuration to use as fallback
const defaultTheme: ThemeConfig = {
    nodeFill: {
        primary: "fill-blue-500 dark:fill-blue-700",
        secondary: "fill-gray-600 dark:fill-gray-200",
    },
    linkStroke: "stroke-gray-700 dark:stroke-gray-100",
    labelFill: "fill-gray-800 dark:fill-yellow-300",
    backgroundClass: "dark:bg-black bg-white",
};

export const themeConfigs: Record<GraphTheme, ThemeConfig> = {
    default: defaultTheme,
    dark: {
        nodeFill: {
            primary: "fill-purple-500",
            secondary: "fill-gray-300",
        },
        linkStroke: "stroke-gray-300",
        labelFill: "fill-yellow-300",
        backgroundClass: "bg-gray-900",
    },
    light: {
        nodeFill: {
            primary: "fill-blue-600",
            secondary: "fill-gray-700",
        },
        linkStroke: "stroke-gray-800",
        labelFill: "fill-gray-900",
        backgroundClass: "bg-gray-100",
    },
    blue: {
        nodeFill: {
            primary: "fill-blue-600",
            secondary: "fill-blue-300",
        },
        linkStroke: "stroke-blue-500",
        labelFill: "fill-blue-800",
        backgroundClass: "bg-blue-50",
    },
    green: {
        nodeFill: {
            primary: "fill-green-600",
            secondary: "fill-green-300",
        },
        linkStroke: "stroke-green-500",
        labelFill: "fill-green-800",
        backgroundClass: "bg-green-50",
    },
};

export const getThemeConfig = (theme: GraphTheme): ThemeConfig => {
    try {
        // Validate the theme is one of our defined themes
        if (theme && themeConfigs[theme]) {
            return themeConfigs[theme];
        }
        return defaultTheme;
    } catch (error) {
        console.error("Error getting theme config:", error);
        return defaultTheme;
    }
}; 