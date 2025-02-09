"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckIcon, LucideShoppingBasket, ShoppingBagIcon } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { EmbeddedCheckoutButton } from "../Stripe/EmbeddedButton";
import { LandingAuthButton } from "../Buttons/LandingAuth";

export default function PricingTiers() {
  const data = useSession();
  const userSubscribed =
    data.data?.user.subscriptionId && !data.data?.user.cancelAtPeriodEnd;

  const userPaid = data.data?.user.lifetimePaymentId;
  return (
    <section
      className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900 
    min-h-screen flex items-center justify-center z-10"
      id="pricing"
    >
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
              <CardDescription>
                Free purpose only for testing the environment
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-4xl font-bold">$0</div>
              <ul className="grid gap-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Up to 5 Notion requests to access your pages as graphs.
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Up to 5 fast notes per day to stay organized and productive
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <LandingAuthButton />
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Tier</CardTitle>
              <CardDescription>
                Premium tier, the best way for users
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-4xl font-bold">
                $3<span className="text-sm font-normal">/month</span>
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
                      Access and retrieve entire pages from your Notion graph
                      without limitations
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
                      Create and organize as many notes as you need daily with
                      instant access
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
                      Easily revisit and restore recently viewed pages with
                      version tracking
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
                      : "Login with Notion"}
                  </Button>
                  <i className="block text-sm text-center">
                    Login with Notion first to subscribe.
                  </i>
                </section>
              )}

              {data.data?.user && userSubscribed && (
                <LandingAuthButton label="Subscribed" />
              )}

              {data.data?.user && !userSubscribed && (
                <EmbeddedCheckoutButton
                  classNames={"bg-blue-600 hover:bg-blue-700"}
                  buttonLabel={
                    <p className="font-bold flex items-center">
                      Subscribe{" "}
                      <LucideShoppingBasket className="inline ml-2 w-4" />
                    </p>
                  }
                  priceId={"month"}
                />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
