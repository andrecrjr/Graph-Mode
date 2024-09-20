import React from "react";

// MainContainer.js
export function MainContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-100">
      {children}
    </main>
  );
}
