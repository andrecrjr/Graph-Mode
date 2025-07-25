"use client";
import React, { useState, useEffect } from "react";
import { useStreamGraph } from "@/components/hooks/useStreamGraph";
import { useTheme } from "@/components/Context/ThemeContext";
import { getThemeConfig } from "@/components/utils/theme";
import Link from "next/link";
import Sidebar from "../Sidebar";
import { useExtensionToastNotification } from "../hooks/useExtensionToastNotification";
import { saveStorage } from "../utils";
import { toast } from "../hooks/use-toast";

interface NewSocketGraphProps {
    notionPageId?: string;
}

export default function SocketGraphComponent({ notionPageId = "mock" }: NewSocketGraphProps) {
    const { theme } = useTheme();
    const themeConfig = getThemeConfig(theme);
    const [token, setToken] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    const [encodedKey, setEncodedKey] = useState<string>(localStorage.getItem("graph_mode_key") || "");
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    useExtensionToastNotification()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem("graph_mode_key") || "";
            const storedEmail = localStorage.getItem("graph_mode_email") || "";
            setToken(storedToken);
            setEmail(storedEmail);
            setIsAuthenticated(!!(storedToken && storedEmail));
        }
    }, []);

    const {
        isConnected,
        isLoading,
        error,
        nodeCount,
        linkCount,
        connectSocket,
        disconnectSocket,
        setSVGRef
    } = useStreamGraph({
        pageId: notionPageId,
        token: isAuthenticated ? token : "",
        email: isAuthenticated ? email : "",
        theme
    });

    useEffect(() => {
        if (isAuthenticated && token && email) {
            connectSocket();
        }
        return () => {
            disconnectSocket();
        };
    }, [isAuthenticated, token, email, connectSocket, disconnectSocket]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (encodedKey) {
                const decodedKey = atob(encodedKey);
                const [email, token] = decodedKey.split(":");
                setToken(token);
                setEmail(email);
                saveStorage.set("graph_mode_key", token);
                saveStorage.set("graph_mode_email", email);
                setIsAuthenticated(true);
            }
        } catch (error) {
            toast({
                title: "Invalid key",
                description: "Please enter a valid key",
                className: "bg-red-700 text-white",
            });
            console.error(error);
        }

    };

    const handleDisconnect = () => {
        disconnectSocket();
        setIsAuthenticated(false);
        localStorage.removeItem("graph_mode_key");
        localStorage.removeItem("graph_mode_email");
        setToken("");
        setEmail("");
    };

    if (!isAuthenticated) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${themeConfig.backgroundClass}`}>
                <form onSubmit={handleSubmit} className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2 dark:text-white">
                            Graph Mode Extension
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Connect in real-time to your Notion Page
                        </p>
                    </div>

                    <Link href="/extension" target="_blank" rel="noopener noreferrer">
                        <p className="text-sm text-gray-500 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            First time? <span className="text-blue-600 dark:text-blue-400 font-medium">Get your key here →</span>
                        </p>
                    </Link>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
                            <strong>Error:</strong> {error}
                        </div>
                    )}


                    <div className="mb-6">
                        <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Graph Mode Key
                        </label>
                        <input
                            type="password"
                            id="token"
                            value={encodedKey}
                            onChange={(e) => setEncodedKey(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 transition-colors"
                            required
                            placeholder="******************************************"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || !encodedKey}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connecting...
                            </span>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${themeConfig.backgroundClass}`}>
            {!isLoading && <Sidebar />}

            <div className="relative w-full h-screen overflow-hidden">
                <svg
                    ref={setSVGRef}
                    className={`w-full h-full cursor-move ${themeConfig.backgroundClass}`}
                />

                {nodeCount === 0 && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`text-center ${themeConfig.labelFill}`}>
                            <p className="text-lg">No data yet</p>
                            <p className="text-sm opacity-70">
                                {isConnected ? 'Waiting for data...' : 'Connecting...'}
                            </p>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        Streaming data...
                    </div>
                )}
            </div>
        </div>
    );
} 