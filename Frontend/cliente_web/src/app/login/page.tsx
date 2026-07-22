"use client";

import { signIn } from "next-auth/react";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Pantalla de acceso propia (P10).
 * Sustituye la pagina generica en ingles de NextAuth: muestra la identidad de
 * Chaski Alerta y redirige directamente a Keycloak.
 */
function AccesoChaski() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard/mapa";
  const error = params.get("error");

  useEffect(() => {
    // Sin error, se va directo al proveedor: el usuario nunca ve una pagina intermedia.
    if (!error) signIn("keycloak", { callbackUrl });
  }, [callbackUrl, error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--bg-body)",
      }}
    >
      <div
        className="card-static animate-scaleIn"
        style={{ maxWidth: "420px", width: "100%", padding: "40px 32px", textAlign: "center" }}
      >
        <div
          style={{
            width: "68px",
            height: "68px",
            margin: "0 auto 20px",
            borderRadius: "20px",
            background: "var(--teal-50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>

        <h1 className="text-[26px] font-extrabold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Chaski Alerta
        </h1>
        <p className="text-[13px] font-semibold" style={{ color: "var(--teal-500)", marginTop: "4px", letterSpacing: "0.08em" }}>
          SEGURIDAD COMUNITARIA
        </p>

        {error ? (
          <>
            <p className="text-[14px]" style={{ color: "var(--text-secondary)", margin: "24px 0 20px", lineHeight: 1.6 }}>
              No se pudo completar el inicio de sesion. Verifica tu correo y contrasena e intentalo otra vez.
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ width: "100%", padding: "14px" }}
              onClick={() => signIn("keycloak", { callbackUrl })}
            >
              Reintentar / Yaykuy
            </button>
          </>
        ) : (
          <>
            <p className="text-[14px]" style={{ color: "var(--text-secondary)", margin: "24px 0 22px", lineHeight: 1.6 }}>
              Te estamos llevando al inicio de sesion seguro de la comunidad...
            </p>
            <div
              style={{
                width: "34px",
                height: "34px",
                margin: "0 auto",
                border: "3px solid var(--teal-400)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "rotate 0.8s linear infinite",
              }}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AccesoChaski />
    </Suspense>
  );
}
