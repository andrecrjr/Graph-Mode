import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckIcon, LucideShoppingBasket } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { EmbeddedCheckoutButton } from "../Stripe/EmbeddedButton";
import { LandingAuthButton } from "../Buttons/LandingAuth";
import { Badge } from "../ui/badge";

export default function PricingTiers() {
  const data = useSession();
  const userSubscribed =
    data.data?.user.subscriptionId || data.data?.user.lifetimePaymentId;
  const userPaid = data.data?.user.lifetimePaymentId;

  return (
    <section
      className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center z-10"
      id="pricing"
    >
      <div className="container px-4 md:px-6">
        <section className="px-4 md:px-6 py-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <header className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl dark:text-white">
                Choose Your Plan
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl lg:text-base xl:text-xl dark:text-gray-400">
                Enjoy a 5-day free trial—no charges if you cancel before it
                ends.{" "}
              </p>
            </header>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Free Tier</CardTitle>
              <CardDescription>
                Perfect for testing the environment
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-4xl font-bold">$0</div>
              <ul className="grid gap-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Up to 5 Notion requests to access your pages as graphs
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Up to 5 fast notes per day
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <LandingAuthButton />
            </CardFooter>
          </Card>
          <Card className="relative border-blue-200 dark:border-blue-800">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 hover:bg-blue-500 text-white animate-pulse">
                5 DAYS FREE TRIAL
              </Badge>
            </div>
            <CardHeader>
              <CardTitle>Premium Tier</CardTitle>
              <CardDescription>
                All the features you need to be productive
              </CardDescription>

            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <div className="text-4xl font-bold flex items-center gap-2">
                  <span className="text-gray-400 line-through text-3xl">$3.00</span>
                  $2.59<span className="text-sm font-normal">/month</span>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                    Save 14%
                  </span>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Try free for 5 days, then $2.59/month
                </p>
              </div>
              <ul className="grid gap-3 text-base text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <CheckIcon
                    className="h-5 w-5 flex-shrink-0 text-green-600"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <strong className="block font-semibold text-green-700 dark:text-green-500">
                      Unlimited Notion Requests
                    </strong>
                    <p className="text-gray-600 dark:text-gray-400">
                      Access your entire Notion workspace without limits
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon
                    className="h-5 w-5 flex-shrink-0 text-green-600"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <strong className="block font-semibold text-green-700 dark:text-green-500">
                      Unlimited Fast Notes
                    </strong>
                    <p className="text-gray-600 dark:text-gray-400">
                      Create and organize unlimited notes with instant access
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon
                    className="h-5 w-5 flex-shrink-0 text-green-600"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <strong className="block font-semibold text-green-700 dark:text-green-500">
                      Page History
                    </strong>
                    <p className="text-gray-600 dark:text-gray-400">
                      Track and restore your page versions easily
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {!data.data && !userSubscribed && !userPaid && (
                <section className="flex flex-col w-full">
                  <Button
                    className="w-full mb-2"
                    onClick={(e) => {
                      e.preventDefault();
                      signIn("notion", {
                        callbackUrl: "/#pricing",
                      });
                    }}
                    disabled={data.status === "loading"}
                  >
                    {data.status === "loading"
                      ? "Getting your Notion Account"
                      : "Start Free Trial"}
                  </Button>
                  <i className="block text-sm text-center">
                    Login with Notion to start your free trial
                  </i>
                </section>
              )}

              {data.data?.user && userSubscribed && (
                <LandingAuthButton label="Currently Subscribed" />
              )}

              {data.data?.user && !userSubscribed && (
                <EmbeddedCheckoutButton
                  classNames="bg-blue-600 hover:bg-blue-700"
                  buttonLabel={
                    <p className="font-bold flex items-center dark:text-white">
                      Start Free Trial{" "}
                      <LucideShoppingBasket className="inline ml-2 w-4" />
                    </p>
                  }
                  priceId="month"
                />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
