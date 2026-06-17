"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface UsuarioPendiente {
  keycloak_id: string;
  email: string;
  nombres: string;
  cedula: string;
  telefono: string;
  sector: string;
  estado_membresia: string;
  fecha_registro: string | null;
}

interface Sector {
  id: number;
  nombre: string;
}

export default function MembresiaPage() {
  const { data: session, status } = useSession();
  const [pendientes, setPendientes] = useState<UsuarioPendiente[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<UsuarioPendiente | null>(null);
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPendientesYSectores = useCallback(async () => {
    if (status !== "authenticated" || !session) return;
    try {
      setLoading(true);
      const token = (session as any)?.access_token;
      
      const [resPendientes, resSectores] = await Promise.all([
        fetch(`${API_URL}/api/membresia/pendientes`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/sectores`)
      ]);

      if (!resPendientes.ok) throw new Error("Error al obtener solicitudes pendientes");
      if (!resSectores.ok) throw new Error("Error al obtener sectores");

      const dataPendientes = await resPendientes.json();
      const dataSectores = await resSectores.json();

      setPendientes(dataPendientes);
      setSectores(dataSectores);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPendientesYSectores();
    }
  }, [fetchPendientesYSectores, status]);

  const handleRechazar = async (userId: string) => {
    try {
      setError(null);
      setSuccessMsg(null);
      const token = (session as any)?.access_token;
      const res = await fetch(`${API_URL}/api/membresia/${userId}/rechazar`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ accion: "RECHAZAR" }),
      });

      if (!res.ok) throw new Error("Error al rechazar usuario");

      setSuccessMsg("Usuario rechazado con éxito.");
      await fetchPendientesYSectores();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la acción");
    }
  };

  const handleAprobar = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);
      const token = (session as any)?.access_token;
      
      const sectorSeleccionado = sectores.find(s => s.id === Number(sectorId));
      
      const payload = {
        accion: "APROBAR",
        cedula: cedula.trim() || undefined,
        telefono: telefono.trim() || undefined,
        id_sector: sectorId ? Number(sectorId) : undefined,
        nombre_sector: sectorSeleccionado?.nombre || undefined
      };

      const res = await fetch(`${API_URL}/api/membresia/${selectedUser.keycloak_id}/aprobar`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al aprobar usuario");

      setSuccessMsg("Usuario aprobado y actualizado con éxito.");
      setSelectedUser(null);
      await fetchPendientesYSectores();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la acción");
    } finally {
      setSubmitting(false);
    }
  };

  const openApproveModal = (user: UsuarioPendiente) => {
    setSelectedUser(user);
    setCedula(user.cedula || "");
    setTelefono(user.telefono || "");
    const matchingSector = sectores.find(s => s.nombre === user.sector);
    setSectorId(matchingSector ? String(matchingSector.id) : "");
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
                Solicitudes de Membresía
              </h1>
              <span className="badge badge-teal">Ayllu Tukuy</span>
            </div>
            <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
              Aprueba o rechaza nuevos miembros de la comunidad
            </p>
          </div>

          <button onClick={fetchPendientesYSectores} className="btn-secondary" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Actualizar
          </button>
        </div>
      </header>

      {/* ─── MODAL DE APROBACIÓN ─────────────────── */}
      {selectedUser && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div className="card-static animate-scaleIn" style={{ padding: "32px", width: "100%", maxWidth: "480px" }}>
            <h2 className="text-[20px] font-bold" style={{ color: "var(--text-primary)", marginBottom: "8px" }}>
              Aprobar y Completar Datos
            </h2>
            <p className="text-[14px]" style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              Complete la información del comunero <strong style={{ color: "var(--teal-600)" }}>{selectedUser.nombres}</strong> antes de aprobar.
            </p>

            <form onSubmit={handleAprobar} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="input-label">Cédula de Identidad</label>
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Ej: 1712345678"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">Teléfono / Celular</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 0991234567"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="input-label">Sector</label>
                <select
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">-- Seleccione un sector --</option>
                  {sectores.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {submitting ? "Guardando..." : "Guardar y Aprobar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Success Banner ──────────────────────── */}
      {successMsg && (
        <div
          className="animate-slideDown"
          style={{
            marginBottom: "24px",
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            background: "var(--green-50)",
            border: "1px solid var(--green-100)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{
            width: "32px", height: "32px", borderRadius: "10px",
            background: "var(--gradient-success)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-[14px] font-semibold" style={{ color: "var(--green-600)" }}>
            {successMsg}
          </p>
        </div>
      )}

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
          {[1, 2, 3].map((i) => (
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
      ) : pendientes.length === 0 ? (
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <p className="text-[18px] font-bold" style={{ color: "var(--text-primary)", marginBottom: "6px" }}>
            No hay solicitudes pendientes
          </p>
          <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>
            Todos los usuarios han sido gestionados
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
          {pendientes.map((user) => (
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
                <div>
                  <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)", marginBottom: "4px" }}>
                    {user.nombres || user.email.split("@")[0]}
                  </h3>
                  <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    {user.email}
                  </p>
                </div>
                <span className="badge badge-orange">Pendiente</span>
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
                  <span style={{ color: "var(--text-muted)" }}>Fecha:</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "auto" }}>
                <button
                  onClick={() => handleRechazar(user.keycloak_id)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: "center", color: "var(--red-600)", border: "1px solid var(--red-200)", background: "var(--red-50)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Rechazar
                </button>
                <button
                  onClick={() => openApproveModal(user)}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Aprobar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
