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
import { CheckIcon } from "lucide-react";
import { IModalCheckoutRef, ModalCheckout } from "../Stripe/EmbeddedCheckout";
import { useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import AuthButton from "../Buttons";

export function PricingTiers() {
  const data = useSession();
  const modalCheckoutRef = useRef<IModalCheckoutRef>(null);
  console.log(data);

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
              <CardDescription>Perfect for normal user usage</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-4xl font-bold">$0</div>
              <ul className="grid gap-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Up to 50 Notion fetchs to get some pages
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Up to 10 Fast Notes creation per day
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Get Started</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Tier</CardTitle>
              <CardDescription>Premium tier, perfector for heavy users and creativete docs</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-4xl font-bold">
                $3<span className="text-sm font-normal">/month</span>
              </div>
              <ul className="grid gap-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Unlimited Notion fetchs to get entire pages inside your page
                </li>

                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Unlimited Fast Notes creation per day
                </li>
                <li className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Graph Excalidraw Mode
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {!data.data && (
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
              {!!data.data && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => {
                      modalCheckoutRef.current?.open();
                    }}
                  >
                    Subscribe Now
                  </Button>
                  <ModalCheckout ref={modalCheckoutRef} />
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
