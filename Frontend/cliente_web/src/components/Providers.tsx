"use client";

import { SessionProvider } from "next-auth/react";
import SessionTimeoutModal from "./SessionTimeoutModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <SessionTimeoutModal />
    </SessionProvider>
  );
}
