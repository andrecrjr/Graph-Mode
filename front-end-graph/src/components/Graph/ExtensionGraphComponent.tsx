"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGraph } from "@/components/hooks/useGraph";
import { fetchAndSaveCacheData, processGraphData } from "@/components/utils/graph";
import { useTheme } from "@/components/Context/ThemeContext";
import { getThemeConfig } from "@/components/utils/theme";
import { LoadingGraphLazyComponent } from "@/components/Graph";
import Sidebar from "@/components/Sidebar";
import { saveStorage } from "@/components/utils";
import Link from "next/link";
import { useGraphContextData } from "../Context/GraphContext";

interface ExtensionGraphProps {
    notionPageId?: string;
}

export default function ExtensionGraphComponent({ notionPageId = "mock" }: ExtensionGraphProps) {
    const { dispatch, state } = useGraphContextData();

    const processGraphDataMemoized = useCallback(
        (data: any) => processGraphData(data, notionPageId),
        [notionPageId],
    );

    const svgRef = useRef<SVGSVGElement | null>(null);
    const { mountGraph } = useGraph();

    const { theme } = useTheme();
    const [token, setToken] = useState<string>(localStorage.getItem("notionKey") || "");
    const [email, setEmail] = useState<string>(localStorage.getItem("notion_email") || "");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Get theme config safely
    const themeConfig = React.useMemo(() => {
        try {
            return getThemeConfig(theme);
        } catch (error) {
            console.error("Error getting theme config:", error);
            return getThemeConfig("default");
        }
    }, [theme]);

    const loadGraphData = useCallback(async () => {
        if (!token || !email) return;

        setIsLoading(true);
        setError(null);

        try {
            let data: any;

            data = await fetchAndSaveCacheData(notionPageId, token, email);

            const processedData = processGraphDataMemoized(data);
            dispatch({
                type: "UPDATE_NODES",
                payload: processedData,
            });
            dispatch({
                type: "SET_PAGE_ID",
                payload: notionPageId,
            });

            setIsAuthenticated(true);
        } catch (err) {
            console.error("Failed to load graph data:", err);
            setError("Failed to authenticate or load data. Please check your token and email.");
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, [token, email, notionPageId]);

    useEffect(() => {
        if (localStorage.getItem("notionKey") && localStorage.getItem("notion_email")) {
            loadGraphData();
        }
    }, []);

    useEffect(() => {
        if (state.nodes && svgRef.current) {
            mountGraph(state.nodes, svgRef, theme);
        }
    }, [state.nodes, mountGraph, theme]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loadGraphData();
    };

    return (
        <div className={`graph-extension overflow-hidden w-full h-full ${themeConfig.backgroundClass}`}>
            {isAuthenticated && <Sidebar />}

            {!isAuthenticated ? (
                <div className="flex flex-col items-center justify-center h-full p-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                            <p className="mt-4 text-lg">Loading graph data...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="w-full max-w-md p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-6 text-center dark:text-white">Graph Mode Authentication</h2>
                            <Link href="/app/extension" target="_blank" rel="noopener noreferrer">
                                <p className="text-sm text-gray-500 mb-4">
                                    First time using this? <span className="text-indigo-500">Click here to get your Notion Secret Key and E-mail</span>
                                </p>
                            </Link>
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}


                            <div className="mb-6">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notion E-mail
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        localStorage.setItem("notion_email", e.target.value);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notion Secret Key
                                </label>
                                <input
                                    type="password"
                                    id="token"
                                    value={token}
                                    onChange={(e) => {
                                        setToken(e.target.value);
                                        localStorage.setItem("notionKey", e.target.value);
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Enter your Notion access token"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Load Graph'}
                            </button>
                        </form>
                    )}
                </div>
            ) : (
                <div className="w-full h-full">
                    {isLoading ? (
                        <LoadingGraphLazyComponent />
                    ) : (
                        <svg
                            ref={svgRef}
                            className="w-full h-full"
                            style={{ minHeight: "100%", minWidth: "100%" }}
                        ></svg>
                    )}
                </div>
            )}
        </div>
    );
} 