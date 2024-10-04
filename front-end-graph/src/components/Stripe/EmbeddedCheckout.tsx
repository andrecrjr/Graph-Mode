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

export interface IModalCheckoutRef {
  open: () => void;
  close: () => void;
}

export const ModalCheckout = forwardRef<IModalCheckoutRef>(({}, ref) => {
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
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
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
    <div id="checkout" className="my-4">
      <dialog ref={modalRef} className="modal w-8/12">
        <div className="modal-action">
          <form method="dialog">
            <button className="absolute right-0" onClick={handleCloseModal}>
              <X />
            </button>
          </form>
        </div>
        <div className="modal-box w-100">
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
});

ModalCheckout.displayName = "ModalCheckout";
