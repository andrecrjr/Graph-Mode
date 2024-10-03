import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CloudIcon, NetworkIcon, SearchIcon, PenToolIcon } from "lucide-react";

export default function ImprovedFeatures() {
  return (
    <section
      className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-900 z-10 min-h-screen"
      id="features"
    >
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            Revolutionize Your Notion Experience
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 md:text-xl">
            Unlock the full potential of your Notion pages with our graph
            visualization
          </p>
        </div>
        <div className="flex flex-wrap sm:grid sm:grid-flow-col sm:gap-10">
          <div className="text-center mb-5 sm:mb-0">
            <NetworkIcon className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Visualize Connections
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {`Easily map out how your notes and ideas are interwoven with a
              dynamic, interactive graph. Get a bird's-eye view of any Notion
              page, revealing the structure and relationships within your
              cloud-stored content like never before.`}
            </p>
          </div>
          <div className="text-center mb-5 sm:mb-0">
            <SearchIcon className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Enhanced Discovery</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Uncover hidden patterns, connections, and insights buried deep
              within your Notion pages. Our cloud-based approach allows you to
              explore and make sense of your information across your entire
              Notion workspace, not just local documents.
            </p>
          </div>
          <div className="text-center mb-5 sm:mb-0">
            <CloudIcon className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Seamless Cloud Integration
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Experience the power of graph visualization, seamlessly synced
              between devices with your cloud-based Notion workspace. Log in
              with your Notion account, paste any page URL, and watch as your
              content transforms into an interactive, dynamic graph - accessible
              anywhere on your smartphone, tablet, or computer.
            </p>
          </div>
          {/* <div className="text-center mb-3 sm:mb-0">
            <PenToolIcon className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Excalidraw Mode</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Unleash your creativity with our unique Excalidraw mode. Sketch,
              annotate, and ideate directly on your graph visualizations,
              combining the power of visual thinking with the structure of your
              Notion content.
            </p>
          </div> */}
        </div>
        {/* <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-primary">
            Unlike other tools, we work directly with your cloud-based Notion
            content - no local files needed!
          </p>
        </div> */}
      </div>
    </section>
  );
}
