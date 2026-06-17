import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const response = await fetch(url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_ID || "web-admin",
        client_secret: process.env.KEYCLOAK_SECRET || "web-admin-secret",
        grant_type: "refresh_token",
        refresh_token: token.refresh_token,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    return {
      ...token,
      access_token: refreshedTokens.access_token,
      id_token: refreshedTokens.id_token,
      expires_at: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
      refresh_token: refreshedTokens.refresh_token ?? token.refresh_token,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || "web-admin",
      clientSecret: process.env.KEYCLOAK_SECRET || "web-admin-secret",
      issuer: process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/chaski-realm",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        token.id_token = account.id_token;
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
        token.expires_at = account.expires_at;
        return token;
      }
      
      // Return previous token if the access token has not expired yet (with a 2 min margin)
      if (Date.now() < (token.expires_at as number) * 1000 - 120000) {
        return token;
      }
      
      // Access token has expired, try to update it
      return await refreshAccessToken(token);
    },
    async session({ session, token }: any) {
      session.access_token = token.access_token;
      session.id_token = token.id_token;
      session.error = token.error;
      session.expires_at = token.expires_at;
      session.issuer = process.env.KEYCLOAK_ISSUER;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
