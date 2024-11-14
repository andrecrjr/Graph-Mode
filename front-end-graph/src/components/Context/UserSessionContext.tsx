"use client";
import React, { createContext, useContext } from "react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";

// Define o tipo para o contexto
type UserSessionContextType = {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
};

const UserSessionContext = createContext<UserSessionContextType>({
  session: null,
  status: "loading",
});

export const UserSessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session, status } = useSession();
  return (
    <UserSessionContext.Provider value={{ session, status }}>
      {children}
    </UserSessionContext.Provider>
  );
};

export const useUserSession = () => {
  const context = useContext(UserSessionContext);

  if (context === undefined) {
    throw new Error(
      "useUserSession deve ser usado dentro de um UserSessionProvider",
    );
  }
  console.log(context);

  return context;
};
