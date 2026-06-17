import { withAuth } from "next-auth/middleware";

const authMiddleware = withAuth({
  pages: {
    signIn: "/api/auth/signin",
  },
});

export default function proxy(req: any, event: any) {
  return (authMiddleware as any)(req, event);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
