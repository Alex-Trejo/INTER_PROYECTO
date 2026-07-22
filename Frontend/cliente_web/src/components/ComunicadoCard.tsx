interface Comunicado {
  id: number;
  titulo: string;
  mensaje: string;
  autor: string;
  fecha_publicacion: string;
}

export function timeSince(dateStr: string): string {
  // El backend devuelve la hora local de Ecuador (UTC-5) sin indicador de zona.
  // Se le añade el desplazamiento para que JavaScript no la lea como UTC y
  // muestre todos los comunicados con 5 horas de desfase.
  //
  // La comprobacion mira el FINAL de la cadena: buscar solo "+" o "Z" no
  // detectaba un desplazamiento negativo ya presente (p. ej. "-05:00") y se
  // añadia un segundo offset, produciendo una fecha invalida ("hace NaNd").
  const yaTieneZonaHoraria = /(?:Z|[+-]\d{2}:?\d{2})$/.test(dateStr);
  const localDateStr = yaTieneZonaHoraria ? dateStr : dateStr + "-05:00";
  const seconds = Math.floor((Date.now() - new Date(localDateStr).getTime()) / 1000);
  if (seconds < 0 || seconds < 5) return "justo ahora";
  if (seconds < 60) return `hace ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

export function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ─── Gradient palettes for cards ─────────────────── */
const cardGradients = [
  "linear-gradient(135deg, #0D7377 0%, #14919B 50%, #23B5C0 100%)",
  "linear-gradient(135deg, #F97316 0%, #FB923C 60%, #FDBA74 100%)",
  "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)",
  "linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)",
  "linear-gradient(135deg, #2563EB 0%, #3B82F6 50%, #60A5FA 100%)",
  "linear-gradient(135deg, #DC2626 0%, #EF4444 50%, #F87171 100%)",
  "linear-gradient(135deg, #DB2777 0%, #EC4899 50%, #F472B6 100%)",
  "linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FBBF24 100%)",
];

const cardIcons = [
  /* megaphone */ "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",
  /* document */ "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
  /* star */ "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  /* shield */ "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  /* bell */ "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",
  /* globe */ "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
];

function getCardGradient(index: number): string {
  return cardGradients[index % cardGradients.length];
}

export default function ComunicadoCard({
  comunicado,
  index,
  onEdit,
  onDelete,
}: {
  comunicado: Comunicado;
  index: number;
  onEdit?: (c: Comunicado) => void;
  onDelete?: (c: Comunicado) => void;
}) {
  const gradient = getCardGradient(index);
  const iconPath = cardIcons[index % cardIcons.length];
  const conAcciones = Boolean(onEdit || onDelete);

  const accionEstilo: React.CSSProperties = {
    width: "34px",
    height: "34px",
    borderRadius: "11px",
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(8px)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(255,255,255,0.95)",
  };

  return (
    <article
      className="gradient-card animate-fadeUp"
      style={{
        background: gradient,
        animationDelay: `${index * 0.08}s`,
        animationFillMode: "backwards",
        minHeight: "220px",
      }}
    >
      {/* Decorative icon / acciones de la Directiva */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 3,
        }}
      >
        {conAcciones ? (
          <>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(comunicado)}
                style={accionEstilo}
                title="Corregir este comunicado"
                aria-label="Corregir comunicado"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(comunicado)}
                style={accionEstilo}
                title="Retirar del muro"
                aria-label="Retirar comunicado del muro"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </>
        ) : (
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={iconPath} />
            </svg>
          </div>
        )}
      </div>

      {/* Geometric decoration */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "-20px",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          transform: "translateY(-50%)",
          zIndex: 0,
        }}
      />

      {/* Author badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(8px)",
          padding: "6px 12px",
          borderRadius: "20px",
          marginBottom: "12px",
          width: "fit-content",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: 800,
            color: "white",
          }}
        >
          {getInitials(comunicado.autor)}
        </div>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.95)" }}>
          {comunicado.autor}
        </span>
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
          · {timeSince(comunicado.fecha_publicacion)}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: "white",
          lineHeight: 1.3,
          marginBottom: "8px",
          letterSpacing: "-0.01em",
        }}
      >
        {comunicado.titulo}
      </h3>

      {/* Message preview */}
      <p
        style={{
          fontSize: "13px",
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.8)",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
        }}
      >
        {comunicado.mensaje}
      </p>
    </article>
  );
}
