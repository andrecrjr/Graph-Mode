import Notion, { NotionProfile } from "@auth/core/providers/notion";
import NextAuth from "next-auth";
import Stripe from "stripe";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Notion({
      clientId: process.env.NOTION_CLIENT,
      clientSecret: process.env.NOTION_SECRET!,
      redirectUri: process.env.NOTION_REDIRECT_URL!,
      async profile(profile, tokens) {
        const { access_token, workspace_name, workspace_id } = tokens;
        profile.tokens = { access_token, workspace_name, workspace_id };
        return profile;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      user && (token.user = user);
      return token;
    },
    async session({ session, token, user }) {
      const userData = token.user as NotionProfile;

      const resp = await fetch(process.env.SERVER_API + "/user", {
        method: "POST",
        body: JSON.stringify(userData),
        headers: {
          Authorization: `Bearer ${userData.tokens.access_token}`,
          "Content-Type": "application/json",
        },
      });
      const subscriptionData = await resp.json();
      session.user = { ...userData, ...subscriptionData } as any;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
});

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
