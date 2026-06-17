"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AlertaHistorial {
  id: number;
  lat: number;
  lng: number;
  usuario_nombre: string;
  estado_incidencia: string;
  fecha_hora: string;
}

export default function HistorialAlertasPage() {
  const { data: session, status } = useSession();
  const [alertas, setAlertas] = useState<AlertaHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistorial = useCallback(async () => {
    if (status !== "authenticated" || !session) return;
    try {
      setLoading(true);
      const token = (session as any)?.access_token;
      const res = await fetch(`${API_URL}/api/alertas/historial`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Error al obtener el historial de alertas");
      const data = await res.json();
      setAlertas(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexion");
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchHistorial();
    }
  }, [fetchHistorial, status]);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "ACTIVA":
        return <span className="badge badge-red" style={{ background: "var(--red-100)", color: "var(--red-600)", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>ACTIVA</span>;
      case "RESUELTA":
        return <span className="badge badge-green" style={{ background: "var(--green-100)", color: "var(--green-600)", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>RESUELTA</span>;
      case "FALSA_ALARMA":
        return <span className="badge badge-orange" style={{ background: "var(--orange-100)", color: "var(--orange-600)", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>FALSA ALARMA</span>;
      default:
        return <span className="badge">{estado}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('es-EC', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', hour12: true 
    }).format(d);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "32px" }}>
      {/* ─── Header ──────────────────────────────── */}
      <header className="animate-fadeUp" style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <h1
                className="text-[28px] font-extrabold"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}
              >
                Historial de Alertas
              </h1>
              <span className="badge badge-orange" style={{ background: "var(--teal-100)", color: "var(--teal-600)", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>Riksiy Allpamapa</span>
            </div>
            <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
              Registro histórico y trazabilidad de todas las incidencias de la comunidad
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={fetchHistorial} className="btn-secondary" type="button" style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", background: "var(--bg-card)", border: "1px solid var(--border-light)", color: "var(--text-secondary)", fontWeight: "bold", cursor: "pointer"
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </header>

      {/* ─── Error Banner ────────────────────────── */}
      {error && (
        <div
          className="animate-slideDown"
          style={{
            marginBottom: "24px",
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            background: "var(--red-50)",
            border: "1px solid var(--red-100)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[13px] font-medium" style={{ color: "var(--red-600)" }}>{error}</p>
        </div>
      )}

      {/* ─── TABLE CONTENT ──────────────────────────── */}
      <div className="card-static animate-scaleIn" style={{ overflow: "hidden", padding: 0 }}>
        {loading ? (
          <div style={{ padding: "32px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                border: "3px solid var(--teal-200)",
                borderTopColor: "var(--teal-500)",
                borderRadius: "50%",
                animation: "rotate 0.8s linear infinite",
              }}
            />
            <span style={{ marginLeft: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Cargando historial...</span>
          </div>
        ) : alertas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 32px" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "var(--radius-xl)",
                background: "var(--teal-50)",
                border: "2px solid var(--teal-100)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--teal-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p className="text-[18px] font-bold" style={{ color: "var(--text-primary)", marginBottom: "6px" }}>
              No hay alertas registradas
            </p>
            <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>
              Aún no se ha emitido ninguna incidencia SOS en la comunidad.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ background: "var(--bg-body)", borderBottom: "1px solid var(--border-light)" }}>
                <tr>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fecha y Hora</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Comunero</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ubicación</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Estado</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>ID</th>
                </tr>
              </thead>
              <tbody>
                {alertas.map((alerta) => (
                  <tr key={alerta.id} style={{ borderBottom: "1px solid var(--border-light)", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: 500, fontSize: "14px" }}>
                      {formatDate(alerta.fecha_hora)}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--teal-100)", color: "var(--teal-600)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px" }}>
                          {alerta.usuario_nombre.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "14px" }}>
                          {alerta.usuario_nombre}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <a 
                        href={`https://maps.google.com/?q=${alerta.lat},${alerta.lng}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: "var(--teal-500)", textDecoration: "none", fontWeight: 500, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Ver en mapa
                      </a>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      {getStatusBadge(alerta.estado_incidencia)}
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right", color: "var(--text-muted)", fontSize: "13px", fontFamily: "monospace" }}>
                      #{alerta.id.toString().padStart(4, '0')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
