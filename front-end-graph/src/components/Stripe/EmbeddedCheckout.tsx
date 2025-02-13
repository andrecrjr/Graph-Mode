"use client";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import { X } from "lucide-react";
import Link from "next/link";

export interface IModalCheckoutRef {
  open: () => void;
  close: () => void;
}

export const ModalCheckout = forwardRef<IModalCheckoutRef, { priceId: string }>(
  ({ priceId }, ref) => {
    const stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    );
    const [showCheckout, setShowCheckout] = useState(false);
    const modalRef = useRef<HTMLDialogElement>(null);

    const fetchClientSecret = useCallback(() => {
      return fetch("/api/embedded-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: priceId || "month",
        }),
      })
        .then((res) => res.json())
        .then((data) => data.client_secret);
    }, []);

    const options = { fetchClientSecret };

    const handleCheckoutClick = () => {
      setShowCheckout(true);
      modalRef.current?.showModal();
    };

    const handleCloseModal = () => {
      setShowCheckout(false);
      modalRef.current?.close();
    };

    useImperativeHandle(ref, () => {
      return {
        open: () => {
          return handleCheckoutClick();
        },
        close: () => {
          return handleCloseModal();
        },
      };
    });

    return (
      <div id="checkout" className="my-4 z-40">
        <dialog ref={modalRef} className="w-11/12 py-6 sm:w-9/12">
          <div className="modal-action">
            <form method="dialog">
              <button
                className="absolute right-0 p-6"
                onClick={handleCloseModal}
              >
                <X />
              </button>
            </form>
          </div>
          <div className="modal-box w-100">
            <p className="text-center">
              You can read our terms before buying our subscription{" "}
              <Link
                href={"/terms"}
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </Link>
              .
            </p>
            <div className="py-4">
              {showCheckout && (
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={options}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              )}
            </div>
          </div>
        </dialog>
      </div>
    );
  },
);

ModalCheckout.displayName = "ModalCheckout";
