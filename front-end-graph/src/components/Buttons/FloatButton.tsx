"use client";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";

const ONE_MINUTE = 60000;

const floatHidden = "floatIsHiddenAd";

export const FloatButton: React.FC<{
  children: React.ReactElement;
  classNames: string;
}> = ({ children, classNames }) => {
  const [isHidden, setIsHidden] = useState<boolean>(false);

  useEffect(() => {
    // Verifica o estado de ocultação no localStorage ao montar o componente
    const isHiddenStorage = localStorage.getItem(floatHidden);
    if (isHiddenStorage === "true") {
      setIsHidden(true);
    }
  }, []);

  const handleClose = () => {
    setIsHidden(true);
    localStorage.setItem(floatHidden, "true");

    // Remove o estado de ocultação após 5 segundos
    setTimeout(() => {
      localStorage.removeItem(floatHidden);
      setIsHidden(false);
    }, ONE_MINUTE);
  };

  if (isHidden) {
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
