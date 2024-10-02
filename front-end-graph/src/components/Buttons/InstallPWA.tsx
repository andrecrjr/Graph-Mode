"use client";
import { useEffect, useState, MouseEvent } from "react";
import { Button } from "../ui/button";

interface DeferredPrompt extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function ButtonPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt | null>(
    null,
  );
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log(e);
      setDeferredPrompt(e as DeferredPrompt);
      setIsInstallable(true);
    };

    console.log("estou aqui");

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null);
        setIsInstallable(false);
      });
    }
  };

  if (isInstallable) {
    return (
      <section className="fixed bottom-0 m-4 z-50 bg-transparent">
        <Button
          className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full mx-auto"
          onClick={handleInstallClick}
        >
          Add Graph Mode to Home Screen
        </Button>
      </section>
    );
  }
}

export default ButtonPWA;
