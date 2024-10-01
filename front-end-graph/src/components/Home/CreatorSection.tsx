/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
import React from "react";

const CreatorSection: React.FC = () => {
  return (
    <section className="bg-gray-200 flex items-center z-50 py-20 min-h-screen">
      <div className="container mx-auto px-6 lg:px-20">
        <div className="bg-white shadow-md rounded-lg p-10 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/3 w-full flex justify-center">
            <img
              className="rounded-full mx-auto lg:mx-0 w-48 h-48 object-cover shadow-lg"
              src="/myself.jpg"
              alt="Photo of the Myself AC. Junior"
              loading="lazy"
            />
          </div>
          <div className="lg:w-2/3 w-full lg:pl-10 mt-8 lg:mt-0">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Who created Graph-Mode?
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Hi! I'm <span className="font-bold">AC. Junior</span>, the
              developer behind "Graph Mode". Inspired by my passion for Notion,
              Zettelkasten, and simple yet powerful tools like Obsidian, I
              created this site as part of my portfolio. My goal is to make the
              concept of a second brain accessible to everyone using Notion.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              With a background in software engineering, I hope "Graph Mode"
              aims to help users explore and visualize data effectively, taking
              inspiration from Zettelkasten methods like those seen in Obsidian.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              If you enjoy it, feel free to support or follow me on social
              networks:
            </p>
            <section className="w-full flex-col flex md:flex-row py-2">
              <a
                href="https://ko-fi.com/andrecrjr"
                target="_blank"
                className="bg-yellow-400 ml-2 mt-2 md:mt-0  text-black px-6 py-3 rounded-md shadow hover:bg-yellow-500 transition-all duration-200"
              >
                Ko-fi
              </a>
              <a
                href="https://www.linkedin.com/in/andrecrjr/"
                target="_blank"
                className="bg-blue-500 ml-2 mt-2 md:mt-0  text-white px-6 py-3 rounded-md shadow hover:bg-blue-600 transition-all duration-200"
              >
                Linkedin
              </a>
              <a
                href="https://andrecrjr.github.io/"
                target="_blank"
                className="bg-gray-500 ml-2 mt-2 md:mt-0  text-white px-6 py-3 rounded-md shadow hover:bg-gray-600 transition-all duration-200"
              >
                Portfolio
              </a>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatorSection;
