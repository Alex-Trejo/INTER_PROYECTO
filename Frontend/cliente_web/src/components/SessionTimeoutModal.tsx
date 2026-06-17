"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SessionTimeoutModal() {
  const { data: session, status, update } = useSession();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.expires_at) return;

    // Check expiration every 10 seconds
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at as number;
      const timeLeft = expiresAt - now;

      // Show warning 2 minutes (120 seconds) before expiration
      if (timeLeft <= 120 && timeLeft > 0) {
        setShowWarning(true);
      } else if (timeLeft <= 0 || session.error === "RefreshAccessTokenError") {
        // Expired or failed to refresh -> Force logout
        federatedLogout();
      } else {
        setShowWarning(false);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [session, status]);

  const federatedLogout = async () => {
    if (session?.id_token && session?.issuer) {
      const logoutUrl = `${session.issuer}/protocol/openid-connect/logout?id_token_hint=${session.id_token}&post_logout_redirect_uri=${window.location.origin}`;
      await signOut({ redirect: false });
      window.location.href = logoutUrl;
    } else {
      signOut({ callbackUrl: "/" });
    }
  };

  const handleKeepActive = async () => {
    // Calling update() triggers the jwt callback which refreshes the token
    await update();
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="animate-scaleIn"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "var(--orange-100)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--orange-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="text-[20px] font-bold" style={{ color: "var(--text-primary)", marginBottom: "12px" }}>
          Sesión por expirar
        </h2>
        <p className="text-[14px]" style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
          Tu sesión caducará pronto por inactividad. ¿Deseas mantener tu sesión activa o salir del sistema?
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={federatedLogout}
            className="btn-secondary"
            style={{ padding: "10px 20px", flex: 1 }}
          >
            Salir / Lluqsiy
          </button>
          <button
            onClick={handleKeepActive}
            className="btn-primary"
            style={{ padding: "10px 20px", flex: 1 }}
          >
            Mantener Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
