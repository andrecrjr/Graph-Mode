import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coffee, Sparkles } from "lucide-react";
import { KofiDonate } from "../Donate";

export default function BuyMeCoffee() {
  return (
    <section
      id="support"
      className="w-full flex py-12 min-h-screen items-center md:py-24 z-10 lg:py-32 bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
    >
      <div className="container px-4 md:px-6">
        <Card className="max-w-2xl mx-auto dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center dark:text-white">
              Support New Features
            </CardTitle>
            <CardDescription className="text-center dark:text-gray-300">
              Help us bring exciting new features to Graph Mode
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Coffee className="h-12 w-12 text-amber-500" />
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Your support helps us develop new features and improve Graph Mode.
              Every coffee counts!
            </p>
            <div className="flex justify-center space-x-2">
              <KofiDonate />
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
              Your support helps us bring new features to life!
            </p>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
