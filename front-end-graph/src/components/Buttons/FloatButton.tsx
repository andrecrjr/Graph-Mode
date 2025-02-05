"use client";
import { X } from "lucide-react";
import React, { useState } from "react";
import { useUserSession } from "../Context/UserSessionContext";

export const FloatButton: React.FC<{
  children: React.ReactElement;
  classNames: string;
}> = ({ children, classNames }) => {
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const { session } = useUserSession();

  const handleClose = () => {
    setIsHidden(true);
    // Remove o estado de ocultação após 5 segundos
  };

  if (
    session?.user.lifetimePaymentId ||
    session?.user.nextPaymentDate ||
    isHidden
  ) {
    return null;
  }

  return (
    <section
      className={`float-comp fixed bottom-0 flex flex-col ${classNames}`}
    >
      <span className="self-end cursor-pointer" onClick={handleClose}>
        <X />
      </span>
      {children}
    </section>
  );
};
