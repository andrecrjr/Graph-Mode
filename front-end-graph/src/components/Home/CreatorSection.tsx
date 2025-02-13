import React from "react";
import { Coffee, Briefcase, Github } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CreatorSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-gray-100 flex items-center z-50 py-20 min-h-screen">
      <div className="container mx-auto px-4 lg:px-8">
        <Card className="overflow-hidden">
          <CardContent className="p-8 lg:p-12">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Header */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  About The Creator
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Hey! I&apos;m <span className="font-semibold">AC JR</span>, a
                  software engineer who loves building tools that make knowledge
                  management easier. Graph Mode combines the best of Notion with
                  the visual power of tools like Obsidian - helping you see your
                  notes in a whole new way.
                </p>
              </div>

              {/* Social Links */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-lg text-gray-700 mb-4">
                  Want to support or connect?
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://ko-fi.com/andrecrjr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors duration-200"
                  >
                    <Coffee className="w-4 h-4 mr-2" />
                    Buy me a Coffee
                  </a>
                  <a
                    href="https://github.com/andrecrjr"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </a>
                  <a
                    href="https://andrecrjr.github.io/?utm_source=graphmode"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Portfolio
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CreatorSection;
