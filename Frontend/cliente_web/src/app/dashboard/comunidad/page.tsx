"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UsuarioAprobado {
  keycloak_id: string;
  email: string;
  nombres: string;
  cedula: string;
  telefono: string;
  sector: string;
  estado_membresia: string;
  fecha_registro: string | null;
}

export default function ComunidadPage() {
  const { data: session, status } = useSession();
  const [comunidad, setComunidad] = useState<UsuarioAprobado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComunidad = useCallback(async () => {
    if (status !== "authenticated" || !session) return;
    try {
      setLoading(true);
      const token = (session as any)?.access_token;
      const res = await fetch(`${API_URL}/api/membresia/aprobados`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Error al obtener la lista de comuneros");
      const data = await res.json();
      setComunidad(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchComunidad();
    }
  }, [fetchComunidad, status]);

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
                Comunidad Activa
              </h1>
              <span className="badge badge-teal">Ayllu Runa</span>
            </div>
            <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
              Lista de todos los miembros aprobados (Comuneros) en el sistema.
            </p>
          </div>

          <button onClick={fetchComunidad} className="btn-secondary" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Actualizar
          </button>
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

      {/* ─── CARDS GRID ──────────────────────────── */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="card-static"
              style={{ padding: "24px", minHeight: "180px" }}
            >
              <div className="skeleton" style={{ width: "120px", height: "24px", marginBottom: "16px" }} />
              <div className="skeleton" style={{ width: "80%", height: "16px", marginBottom: "12px" }} />
              <div className="skeleton" style={{ width: "90%", height: "16px", marginBottom: "8px" }} />
              <div className="skeleton" style={{ width: "100%", height: "36px", marginTop: "24px" }} />
            </div>
          ))}
        </div>
      ) : comunidad.length === 0 ? (
        <div
          className="card-static animate-scaleIn"
          style={{ textAlign: "center", padding: "64px 32px" }}
        >
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
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <p className="text-[18px] font-bold" style={{ color: "var(--text-primary)", marginBottom: "6px" }}>
            No hay comuneros registrados
          </p>
          <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>
            Todavía no existen miembros aprobados en la comunidad.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "24px",
          }}
        >
          {comunidad.map((user) => (
            <div
              key={user.keycloak_id}
              className="card-static hover-scale"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: "var(--gradient-primary)", color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "bold", fontSize: "16px"
                  }}>
                    {user.nombres ? user.nombres.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)", marginBottom: "2px" }}>
                      {user.nombres || user.email.split("@")[0]}
                    </h3>
                    <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--bg-body)", padding: "12px", borderRadius: "8px", display: "grid", gap: "8px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Cédula:</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{user.cedula || "N/A"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Teléfono:</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{user.telefono || "N/A"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Sector:</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{user.sector || "N/A"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Registro:</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
