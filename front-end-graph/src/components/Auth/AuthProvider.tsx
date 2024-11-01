"use client";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { UserSessionProvider } from "../Context/UserSessionContext";

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session;
}) {
  return (
    <SessionProvider session={session}>
      <UserSessionProvider>{children}</UserSessionProvider>
    </SessionProvider>
  );
}
