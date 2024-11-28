"use client";
import React, { ReactElement, useRef } from "react";
import { Button } from "../ui/button";
import { IModalCheckoutRef, ModalCheckout } from "./EmbeddedCheckout";

export function EmbeddedCheckoutButton({
  buttonLabel,
  priceId = "month",
  classNames,
}: {
  buttonLabel?: ReactElement;
  priceId: string;
  classNames?: string;
}) {
  const modalCheckoutRef = useRef<IModalCheckoutRef>(null);
  return (
    <>
      <Button
        className={`w-full ${classNames}`}
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
