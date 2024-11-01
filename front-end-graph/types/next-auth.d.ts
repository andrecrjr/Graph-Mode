import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      tokens: {
        access_token?: string;
        workspace_name?: string;
        workspace_id?: string;
      };
      person?: {
        email: string;
      };
      subscriptionId?: string | null;
      lifetimePaymentId?: string | null;
      nextPaymentDate?: string;
    } & DefaultSession["user"];
  }
}
