"use client";
import { useEffect, useState, MouseEvent } from "react";
import { Button } from "../ui/button";
import { Puzzle, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
    e.preventDefault();
    router.push("/extension");
    // if (deferredPrompt) {
    //   deferredPrompt.prompt();
    //   deferredPrompt.userChoice.then((choiceResult) => {
    //     if (choiceResult.outcome === "accepted") {
    //       console.log("User accepted the install prompt");
    //     } else {
    //       console.log("User dismissed the install prompt");
    //     }
    //     setDeferredPrompt(null);
    //     setIsInstallable(false);
    //   });
    // }
  };

  const handleClose = () => {
    setIsHidden(true);
    const hideDate = new Date();
    hideDate.setDate(hideDate.getDate() + 2); // two days
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
        Chrome Extension <Puzzle className="ml-2" />
      </Button>
      <Link
        className="font-bold text-sm underline pb-3 text-center text-gray-500"
        target="_blank"
        rel="noopener noreferrer"
        href="/contact"
      >
        Send feedbacks in our Contact form!
      </Link>
    </section>
  );
}

export default ButtonPWA;
