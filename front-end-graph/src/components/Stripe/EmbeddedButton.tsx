"use client";
import React, { useRef } from "react";
import { Button } from "../ui/button";
import { IModalCheckoutRef, ModalCheckout } from "./EmbeddedCheckout";

export function EmbeddedCheckoutButton({
  buttonLabel,
  priceId = "month",
}: {
  buttonLabel?: string;
  priceId: string;
}) {
  const modalCheckoutRef = useRef<IModalCheckoutRef>(null);
  return (
    <>
      <Button
        className="w-full"
        onClick={() => {
          modalCheckoutRef.current?.open();
        }}
      >
        {buttonLabel ? buttonLabel : "Subscribe Now!"}
      </Button>
      <ModalCheckout ref={modalCheckoutRef} priceId={priceId} />
    </>
  );
}
