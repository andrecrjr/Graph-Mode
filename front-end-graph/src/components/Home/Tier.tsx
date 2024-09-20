import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckIcon } from "lucide-react";

export function PricingTiers() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900 h-screen flex items-center justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Choose Your Plan
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Select the perfect plan for your needs. Upgrade or downgrade at
              any time.
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Free Tier</CardTitle>
              {/* <CardDescription>Perfect for getting started</CardDescription> */}
              <CardDescription>
                Only this tier now to getting started
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-4xl font-bold">$0</div>
              <ul className="grid gap-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Basic graph visualization
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Up to 50 nodes
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Get Started</Button>
            </CardFooter>
          </Card>
          {/* <Card>
            <CardHeader>
              <CardTitle>Monthly Tier</CardTitle>
              <CardDescription>For power users and teams</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-4xl font-bold">
                $4<span className="text-sm font-normal">/month</span>
              </div>
              <ul className="grid gap-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Advanced graph visualization
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Unlimited nodes
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Custom themes
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Collaboration features
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Subscribe Now</Button>
            </CardFooter>
          </Card> */}
        </div>
      </div>
    </section>
  );
}
