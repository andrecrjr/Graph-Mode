import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
    params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: `Graph Mode - Project Ended`,
        description: "Graph Mode project has concluded. Visit our portfolio for more projects.",
    };
}

export default function SocketGraphPage({ params }: Props) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-2xl w-full text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Project Status: Ended
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    The Graph Mode socket project has concluded after 1 year of development. Thank you for your interest.
                </p>
                <p className="text-md text-gray-600 dark:text-gray-400 mb-8">
                    Visit our portfolio for more projects and updates.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="https://www.ac-jr.com/" target="_blank" rel="noopener noreferrer">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
                            Visit Portfolio
                        </Button>
                    </Link>
                    <Link href="https://ko-fi.com/andrecrjr" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg">
                            Follow on Ko-fi for future projects
                        </Button>
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Socket graph page ID: {params.id}
                    </p>
                </div>
            </div>
        </div>
    );
}