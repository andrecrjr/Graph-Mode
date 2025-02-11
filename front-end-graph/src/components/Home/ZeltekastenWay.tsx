import React from "react";
import { Card } from "@/components/ui/card";
import { FileText, Network, Share2, Pencil } from "lucide-react";

const ZettelkastenComparison = () => {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-20 z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transform Your Notion Experience
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From linear thinking to connected knowledge
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Traditional View */}
          <Card className="p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-6">
              <FileText className="w-8 h-8 text-gray-400 mr-3" />
              <h3 className="text-2xl font-semibold text-gray-700">
                Traditional View
              </h3>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <ul className="space-y-4">
                <li className="flex items-center text-gray-600">
                  <span className="w-6 h-6 mr-3 flex-shrink-0">📄</span>
                  Graph Mode
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-6 h-6 mr-3 flex-shrink-0">👤</span>
                  Contact Form - Graph Mode
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-6 h-6 mr-3 flex-shrink-0">ℹ️</span>
                  About Project
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="w-6 h-6 mr-3 flex-shrink-0">📚</span>
                  Front End Documentation
                </li>
              </ul>
            </div>
          </Card>

          {/* Graph View */}
          <Card className="p-8 border-blue-100 hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="flex items-center mb-6">
              <Network className="w-8 h-8 text-blue-500 mr-3" />
              <h3 className="text-2xl font-semibold text-gray-700">
                Graph Mode View
              </h3>
            </div>
            <div className="relative bg-white border border-gray-200 rounded-lg p-4 min-h-[200px]">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Central Node */}
                <circle cx="200" cy="100" r="20" className="fill-blue-500" />
                <text
                  x="200"
                  y="105"
                  textAnchor="middle"
                  className="text-sm fill-white"
                >
                  GM
                </text>

                {/* Contact Form Node */}
                <circle cx="320" cy="60" r="10" className="fill-gray-400" />
                <line
                  x1="220"
                  y1="100"
                  x2="310"
                  y2="60"
                  className="stroke-gray-300"
                  strokeWidth="2"
                />
                <text
                  x="330"
                  y="45"
                  textAnchor="start"
                  className="text-xs fill-gray-600"
                >
                  Contact
                </text>

                {/* About Project Node */}
                <circle cx="100" cy="80" r="10" className="fill-gray-400" />
                <line
                  x1="180"
                  y1="100"
                  x2="110"
                  y2="80"
                  className="stroke-gray-300"
                  strokeWidth="2"
                />
                <text
                  x="80"
                  y="65"
                  textAnchor="end"
                  className="text-xs fill-gray-600"
                >
                  About
                </text>

                {/* Documentation Node */}
                <circle cx="280" cy="150" r="10" className="fill-gray-400" />
                <line
                  x1="220"
                  y1="100"
                  x2="270"
                  y2="150"
                  className="stroke-gray-300"
                  strokeWidth="2"
                />
                <text
                  x="290"
                  y="165"
                  textAnchor="start"
                  className="text-xs fill-gray-600"
                >
                  Docs
                </text>
              </svg>
            </div>

            {/* Highlight Badge */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                Zettelkasten Style
              </span>
            </div>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8">
            Why Graph Mode?
          </h3>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Network className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800">
                Visual Connections
              </h4>
              <p className="text-gray-600">
                See how your notes connect and relate to each other
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Share2 className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800">Natural Flow</h4>
              <p className="text-gray-600">
                Navigate your knowledge like you think - in connections
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800">
                Better Organization
              </h4>
              <p className="text-gray-600">
                Structure your Notion pages in a more intuitive way
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Pencil className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800">Fast Notes</h4>
              <p className="text-gray-600">
                Quickly create ideas within your knowledge graph
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ZettelkastenComparison;
