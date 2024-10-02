"use client";
import { useEffect, useState, MouseEvent } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface DeferredPrompt extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function ButtonPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt | null>(
    null,
  );
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  useEffect(() => {
    const hideDate = localStorage.getItem("hideDate");
    if (hideDate) {
      const hideUntil = new Date(hideDate);
      const now = new Date();
      if (now < hideUntil) {
        setIsHidden(true);
        return;
      } else {
        localStorage.removeItem("hideDate");
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as DeferredPrompt);
      setIsInstallable(true);
    };

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

  const handleClose = () => {
    setIsHidden(true);
    const hideDate = new Date();
    hideDate.setMinutes(hideDate.getMinutes() + 90);
    localStorage.setItem("hideDate", hideDate.toISOString());
  };

  if (isHidden || !isInstallable) {
    return null;
  }

  return (
    <section className="fixed bottom-0 m-4 z-50 bg-transparent w-auto flex flex-col">
      <span className="self-end cursor-pointer" onClick={handleClose}>
        <X />
      </span>
      <Button
        className="bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full mx-auto"
        onClick={handleInstallClick}
      >
        Add Graph Mode to Home Screen
      </Button>
    </section>
  );
}

export default ButtonPWA;
