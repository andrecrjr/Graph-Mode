import AppPage from "@/components/pages/AppPage";
import React from "react";

export default async function Page() {
  return (
    <div className="flex flex-col dark:bg-gray-900 min-h-full">
      <section className="flex flex-col mx-auto sm:px-6 lg:px-8 mt-auto h-screen">
        <AppPage />
      </section>
    </div>
  );
}
