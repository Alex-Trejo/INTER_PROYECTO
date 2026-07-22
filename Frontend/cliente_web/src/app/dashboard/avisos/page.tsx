"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useSession } from "next-auth/react";
import ComunicadoCard from "@/components/ComunicadoCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Comunicado {
  id: number;
  titulo: string;
  mensaje: string;
  autor: string;
  fecha_publicacion: string;
}

export default function AvisosPage() {
  const { data: session, status } = useSession();
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [autor, setAutor] = useState("");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [editando, setEditando] = useState<Comunicado | null>(null);
  const [confirmacion, setConfirmacion] = useState<
    { tipo: "publicar" } | { tipo: "eliminar"; comunicado: Comunicado } | null
  >(null);

  // Longitudes minimas: deben coincidir con la validacion del backend.
  const MIN_TITULO = 5;
  const MIN_MENSAJE = 10;
  const tituloValido = titulo.trim().length >= MIN_TITULO;
  const mensajeValido = mensaje.trim().length >= MIN_MENSAJE;

  const fetchComunicados = useCallback(async () => {
    if (status !== "authenticated" || !session) return;
    try {
      const token = (session as any)?.access_token;
      const res = await fetch(`${API_URL}/api/comunicados`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Error al obtener comunicados");
      const data = await res.json();
      setComunicados(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexion");
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  // Auto-actualizacion cada 10 s, igual que el mapa y el muro movil.
  useEffect(() => {
    if (status === "authenticated") {
      fetchComunicados();
      const interval = setInterval(fetchComunicados, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchComunicados, status]);

  // El formulario ya no publica directamente: primero pide confirmacion.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!tituloValido || !mensajeValido) return;
    setConfirmacion({ tipo: "publicar" });
  };

  const limpiarFormulario = () => {
    setTitulo("");
    setMensaje("");
    setAutor("");
    setEditando(null);
    setShowForm(false);
  };

  const publicarConfirmado = async () => {
    setSubmitting(true);
    setSuccessMsg(null);
    setConfirmacion(null);

    const esEdicion = editando !== null;
    const url = esEdicion
      ? `${API_URL}/api/comunicados/${editando.id}`
      : `${API_URL}/api/comunicados`;

    try {
      const token = (session as any)?.access_token;
      const res = await fetch(url, {
        method: esEdicion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(
          esEdicion
            ? { titulo: titulo.trim(), mensaje: mensaje.trim() }
            : {
                titulo: titulo.trim(),
                mensaje: mensaje.trim(),
                autor: autor.trim() || "Directiva Comunal",
              }
        ),
      });

      if (!res.ok) {
        throw new Error(
          esEdicion ? "Error al corregir el comunicado" : "Error al publicar comunicado"
        );
      }

      limpiarFormulario();
      setSuccessMsg(esEdicion ? "Comunicado corregido" : "Comunicado publicado exitosamente");
      await fetchComunicados();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setSubmitting(false);
    }
  };

  const iniciarEdicion = (c: Comunicado) => {
    setEditando(c);
    setTitulo(c.titulo);
    setMensaje(c.mensaje);
    setAutor(c.autor);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarConfirmado = async (c: Comunicado) => {
    setConfirmacion(null);
    setSubmitting(true);
    try {
      const token = (session as any)?.access_token;
      const res = await fetch(`${API_URL}/api/comunicados/${c.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al retirar el comunicado");
      setSuccessMsg("Comunicado retirado del muro");
      await fetchComunicados();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al retirar");
    } finally {
      setSubmitting(false);
    }
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
                Comunicados Oficiales
              </h1>
              <span className="badge badge-orange">Willaykuna</span>
            </div>
            <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
              Publica y consulta avisos de la directiva comunal
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {lastUpdate && (
              <div className="stat-card" style={{ padding: "8px 14px" }}>
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
            <button onClick={fetchComunicados} className="btn-secondary" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Actualizar
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
              type="button"
              style={{ padding: "12px 22px" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {showForm ? "Cerrar" : "Nuevo Comunicado"}
            </button>
          </div>
        </div>
      </header>

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

      {/* ─── FORM MODAL/CARD ─────────────────────── */}
      {showForm && (
        <div className="animate-slideDown" style={{ marginBottom: "32px" }}>
          <div
            className="card-static"
            style={{ padding: "0", maxWidth: "720px", margin: "0 auto" }}
          >
            {/* Form Header */}
            <div
              style={{
                padding: "28px 32px 20px",
                borderBottom: "1px solid var(--border-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--gradient-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(13,115,119,0.25)",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                    {editando ? "Corregir Comunicado" : "Nuevo Comunicado"}
                  </h2>
                  <p className="text-[12px] font-medium" style={{ color: "var(--teal-500)" }}>
                    {editando ? "Allichiy Willay" : "Mushuk Willay"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                type="button"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "var(--bg-hover)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Form Body - Two column layout */}
            <form onSubmit={handleSubmit} style={{ padding: "28px 32px 32px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                {/* Left column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label htmlFor="titulo" className="input-label">
                      Titulo <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>/ Shutikuna</span>
                      {titulo.length > 0 && !tituloValido && (
                        <span style={{ float: "right", color: "var(--orange-600)", fontSize: "11px" }}>
                          minimo {MIN_TITULO} caracteres
                        </span>
                      )}
                    </label>
                    <input
                      id="titulo"
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej: Minga Comunitaria"
                      required
                      maxLength={200}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="autor" className="input-label">
                      Autor <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(opcional)</span>
                    </label>
                    <input
                      id="autor"
                      type="text"
                      value={autor}
                      onChange={(e) => setAutor(e.target.value)}
                      placeholder="Directiva Comunal"
                      maxLength={100}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Right column */}
                <div>
                  <label htmlFor="mensaje" className="input-label">
                    Mensaje <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>/ Willachiy</span>
                    {mensaje.length > 0 && (
                      <span
                        style={{
                          float: "right",
                          color: mensajeValido ? "var(--teal-500)" : "var(--orange-600)",
                          fontSize: "11px",
                        }}
                      >
                        {mensajeValido ? `${mensaje.length} caracteres` : `minimo ${MIN_MENSAJE} caracteres`}
                      </span>
                    )}
                  </label>
                  <textarea
                    id="mensaje"
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Escriba el contenido del comunicado..."
                    required
                    className="input-field"
                    style={{
                      minHeight: "124px",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "8px" }}>
                <button
                  type="submit"
                  disabled={submitting || !tituloValido || !mensajeValido}
                  className="btn-primary"
                  style={{ minWidth: "220px", padding: "16px 32px", fontSize: "15px" }}
                >
                  {submitting ? (
                    <>
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          border: "2px solid white",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "rotate 0.6s linear infinite",
                        }}
                      />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      {editando ? "Guardar correccion" : "Publicar Comunicado"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CARDS GRID ──────────────────────────── */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="card-static"
              style={{ padding: "24px", minHeight: "200px" }}
            >
              <div className="skeleton" style={{ width: "100px", height: "28px", marginBottom: "16px" }} />
              <div className="skeleton" style={{ width: "80%", height: "20px", marginBottom: "12px" }} />
              <div className="skeleton" style={{ width: "100%", height: "14px", marginBottom: "8px" }} />
              <div className="skeleton" style={{ width: "90%", height: "14px", marginBottom: "8px" }} />
              <div className="skeleton" style={{ width: "60%", height: "14px" }} />
            </div>
          ))}
        </div>
      ) : comunicados.length === 0 ? (
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-[18px] font-bold" style={{ color: "var(--text-primary)", marginBottom: "6px" }}>
            No hay comunicados aun
          </p>
          <p className="text-[14px]" style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
            Publica el primer aviso para la comunidad
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Crear primer comunicado
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {comunicados.map((com, idx) => (
            <ComunicadoCard
              key={com.id}
              comunicado={com}
              index={idx}
              onEdit={iniciarEdicion}
              onDelete={(c) => setConfirmacion({ tipo: "eliminar", comunicado: c })}
            />
          ))}
        </div>
      )}

      {/* ─── DIALOGO DE CONFIRMACION ─────────────── */}
      {confirmacion && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "24px",
          }}
          onClick={() => setConfirmacion(null)}
        >
          <div
            className="card-static animate-scaleIn"
            style={{ maxWidth: "460px", width: "100%", padding: "28px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "14px",
                  background: confirmacion.tipo === "eliminar" ? "var(--red-50)" : "var(--teal-50)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={confirmacion.tipo === "eliminar" ? "var(--red-500)" : "var(--teal-500)"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                {confirmacion.tipo === "eliminar" ? "Retirar del muro" : "Confirmar publicacion"}
              </h3>
            </div>

            <p className="text-[14px]" style={{ color: "var(--text-secondary)", marginBottom: "24px", lineHeight: 1.6 }}>
              {confirmacion.tipo === "eliminar" ? (
                <>
                  El comunicado <strong>&laquo;{confirmacion.comunicado.titulo}&raquo;</strong> dejara de
                  verse en la aplicacion de todos los comuneros. Esta accion no se puede deshacer.
                </>
              ) : editando ? (
                <>
                  Se guardaran los cambios del comunicado <strong>&laquo;{titulo.trim()}&raquo;</strong> y
                  todos los comuneros veran la version corregida.
                </>
              ) : (
                <>
                  El comunicado <strong>&laquo;{titulo.trim()}&raquo;</strong> se enviara a{" "}
                  <strong>toda la comunidad</strong>. Revisa el texto antes de continuar.
                </>
              )}
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button type="button" className="btn-secondary" onClick={() => setConfirmacion(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                style={
                  confirmacion.tipo === "eliminar"
                    ? { background: "var(--red-500)", boxShadow: "none" }
                    : undefined
                }
                onClick={() =>
                  confirmacion.tipo === "eliminar"
                    ? eliminarConfirmado(confirmacion.comunicado)
                    : publicarConfirmado()
                }
              >
                {confirmacion.tipo === "eliminar"
                  ? "Si, retirar"
                  : editando
                  ? "Guardar cambios"
                  : "Si, publicar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
