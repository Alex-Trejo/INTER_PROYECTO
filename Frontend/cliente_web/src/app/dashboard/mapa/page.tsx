"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center h-full card-static"
      style={{ borderRadius: "var(--radius-xl)" }}
    >
      <div className="text-center">
        <div
          style={{
            width: "44px",
            height: "44px",
            border: "3px solid var(--teal-500)",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "rotate 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p className="text-[14px] font-medium" style={{ color: "var(--text-muted)" }}>
          Cargando mapa...
        </p>
      </div>
    </div>
  ),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Alerta {
  id: number;
  lat: number;
  lng: number;
  usuario_nombre: string;
  fecha_hora: string;
}

export default function MapaPage() {
  const { data: session, status } = useSession();
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAlertas = useCallback(async () => {
    if (status !== "authenticated" || !session) return;
    try {
      const token = (session as any)?.access_token;
      const res = await fetch(`${API_URL}/api/alertas`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Error al obtener alertas");
      const data = await res.json();
      setAlertas(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexion");
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  const handleResolveAlert = async (id: number, estado: "RESUELTA" | "FALSA_ALARMA") => {
    if (status !== "authenticated" || !session) return;
    try {
      const token = (session as any)?.access_token;
      const res = await fetch(`${API_URL}/api/alertas/${id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ estado })
      });
      
      if (!res.ok) throw new Error("Error al actualizar la alerta");
      
      // Update local state by removing the resolved alert
      setAlertas(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la acción");
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchAlertas();
      const interval = setInterval(fetchAlertas, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchAlertas, status]);

  const today = new Date().toDateString();
  const todayCount = alertas.filter(
    (a) => new Date(a.fecha_hora).toDateString() === today
  ).length;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "28px 32px", gap: "24px" }}>
      {/* ─── Header ──────────────────────────────── */}
      <header className="animate-fadeUp">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <h1
                className="text-[28px] font-extrabold"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}
              >
                Mapa de Incidencias
              </h1>
              <span className="badge badge-teal">Alerta Allpamapa</span>
            </div>
            <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
              Monitoreo en tiempo real de alertas de emergencia comunitaria
            </p>
          </div>

          {/* Stat cards */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Total */}
            <div className="stat-card">
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: alertas.length > 0 ? "var(--red-100)" : "var(--green-100)",
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke={alertas.length > 0 ? "#DC2626" : "#16A34A"}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <p className="text-[22px] font-extrabold" style={{ color: alertas.length > 0 ? "var(--red-600)" : "var(--green-600)", lineHeight: 1 }}>
                  {alertas.length}
                </p>
                <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Alertas totales</p>
              </div>
            </div>

            {/* Today */}
            <div className="stat-card">
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--orange-100)",
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8650A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="text-[22px] font-extrabold" style={{ color: "var(--orange-600)", lineHeight: 1 }}>
                  {todayCount}
                </p>
                <p className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Hoy</p>
              </div>
            </div>

            {/* Live */}
            {lastUpdate && (
              <div className="stat-card">
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "var(--green-500)",
                    animation: "pulseDot 2s ease-in-out infinite",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p className="text-[13px] font-bold" style={{ color: "var(--green-600)" }}>En vivo</p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {lastUpdate.toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div
          className="animate-slideDown"
          style={{
            padding: "14px 20px",
            borderRadius: "var(--radius-md)",
            background: "var(--red-50)",
            border: "1px solid var(--red-100)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[13px] font-medium" style={{ color: "var(--red-600)" }}>
            {error} — Reintentando cada 5 segundos...
          </p>
        </div>
      )}

      {/* Map */}
      <div
        className="animate-scaleIn card-static"
        style={{ flex: 1, minHeight: "400px", borderRadius: "var(--radius-xl)", overflow: "hidden" }}
      >
        {loading ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ background: "var(--bg-card)" }}
          >
            <div className="text-center">
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "3px solid var(--teal-400)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "rotate 0.8s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <p className="text-[15px] font-medium" style={{ color: "var(--text-secondary)" }}>
                Conectando con el servidor...
              </p>
            </div>
          </div>
        ) : (
          <MapView alertas={alertas} onResolveAlert={handleResolveAlert} />
        )}
      </div>
    </div>
  );
}
