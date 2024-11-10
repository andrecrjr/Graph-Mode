"use client";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { UserSessionProvider } from "../Context/UserSessionContext";

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={60 * 60}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <UserSessionProvider>{children}</UserSessionProvider>
    </SessionProvider>
  );
}
