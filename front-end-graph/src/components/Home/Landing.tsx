import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import BuyMeCoffee from "./BuyCoffee";


export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full md:py-24 h-screen flex flex-col items-center justify-center dark:bg-gray-900 transition-colors duration-200">
        <div className="container items-center">
          <div className="flex flex-col justify-center items-center space-y-4 text-center">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold sm:text-7xl tracking-tight dark:text-white">
                Graph Mode
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 sm:text-xl dark:text-gray-400">
                It was a nice ride, but we will be moving forward! Look at our <Link href="#last-dance" className="underline" rel="noopener noreferrer">project status</Link> below!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              <Link href="https://www.linkedin.com/in/andrecrjr/" target="_blank" rel="noopener noreferrer">
                <Button variant={"secondary"} className="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
                  Linkedin
                </Button>
              </Link>
              <Link href="https://www.ac-jr.com/" target="_blank" rel="noopener noreferrer">
                <Button variant={"secondary"} className="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
                  Portfolio
                </Button>
              </Link>
              <Link href="https://ko-fi.com/andrecrjr" target="_blank" rel="noopener noreferrer">
                <Button variant={"secondary"} className="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
                  Ko-fi
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* <Link
          href="https://notion.so?utm_source=graph-mode"
          className="mt-auto pb-8"
        >
          <NotionHome />
        </Link> */}
      </section>
      {/* <section className="w-full py-12 md:py-24 z-50 h-screen lg:py-32 bg-white dark:bg-gray-800 flex items-center justify-center transition-colors duration-200">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-5 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 dark:text-white">
                Your Knowledge, Visualized
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Our graph mode transforms Notion Pages into an intuitive,
                interconnected visual experience. See how your ideas link
                together in ways you never imagined.
              </p>
              <div className="flex space-x-4">
                <Link href="/app">
                  <Button size="lg" className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                    Start Exploring
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <img
                src="/images/iosPlaceholder.png"
                alt="Graph Mode Product Screenshot"
                width={600}
                height={400}
                loading="lazy"
                className="rounded-lg shadow-md dark:shadow-gray-900"
              />
            </div>
          </div>
        </div>
      </section>
       */}
      {/* Project closure information */}
      <section className="w-full py-12 h-screen md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800" id="last-dance">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6 dark:text-white">
                Project Status Update
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                After 1 year of development and learning, this project has come to an end. 
                It was a valuable journey that taught us many new things and helped us grow as developers.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                We're now moving on to new projects and opportunities. Thank you to everyone 
                who supported and contributed to Graph Mode during its development.
              </p>
              <div className="inline-block">
                <a 
                  href="https://github.com/andrecrjr/graph-mode" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                    View GitHub Repository
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* <ZettelkastenComparison /> */}
      <BuyMeCoffee />
    </div>
  );
}


