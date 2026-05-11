"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/mapa");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-body)",
        gap: "24px",
      }}
    >
      <div className="animate-float">
        <Image
          src="/Recurso/Captura de pantalla 2026-05-11 001658.png"
          alt="Chaski Alerta"
          width={80}
          height={80}
          style={{ borderRadius: "20px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <h1
          className="text-[24px] font-extrabold"
          style={{ color: "var(--text-primary)", marginBottom: "4px" }}
        >
          Chaski Alerta
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
          Cargando sistema de monitoreo...
        </p>
      </div>
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "3px solid var(--teal-500)",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "rotate 0.8s linear infinite",
        }}
      />
    </div>
  );
}
