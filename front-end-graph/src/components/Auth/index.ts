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
      try {
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
      } catch (error) {
        console.error(error);
        session.user = { ...userData } as any;
        return session;
      }
    },
  },
  session: {
    strategy: "jwt",
  },

  debug: process.env.NODE_ENV === "development",
  cookies: {
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
    },
  },
});

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
