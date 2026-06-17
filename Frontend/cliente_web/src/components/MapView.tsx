"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Alerta {
  id: number;
  lat: number;
  lng: number;
  usuario_nombre: string;
  fecha_hora: string;
}

function FitBounds({ alertas }: { alertas: Alerta[] }) {
  const map = useMap();
  const prevCount = useRef(0);

  useEffect(() => {
    if (alertas.length > 0 && alertas.length !== prevCount.current) {
      const bounds = L.latLngBounds(alertas.map((a) => [a.lat, a.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      prevCount.current = alertas.length;
    }
  }, [alertas, map]);

  return null;
}

function formatDate(dateStr: string): string {
  const localDateStr = dateStr.includes("+") || dateStr.includes("Z") ? dateStr : dateStr + "-05:00";
  return new Date(localDateStr).toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" });
}

function timeSince(dateStr: string): string {
  const localDateStr = dateStr.includes("+") || dateStr.includes("Z") ? dateStr : dateStr + "-05:00";
  const seconds = Math.floor((Date.now() - new Date(localDateStr).getTime()) / 1000);
  if (seconds < 0 || seconds < 5) return "justo ahora";
  if (seconds < 60) return `hace ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

/* ─── Theme-aware tile URL ────────────────────────── */
function ThemeAwareTiles() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    };
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const lightUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  const darkUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <TileLayer
      key={isDark ? "dark" : "light"}
      attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
      url={isDark ? darkUrl : lightUrl}
    />
  );
}

export default function MapView({ alertas, onResolveAlert }: { alertas: Alerta[], onResolveAlert?: (id: number, estado: "RESUELTA" | "FALSA_ALARMA") => void }) {
  const center: [number, number] = [-1.5, -78.5];

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ height: "100%", width: "100%", borderRadius: "var(--radius-xl)" }}
      zoomControl={true}
    >
      <ThemeAwareTiles />

      {alertas.map((alerta) => (
        <Marker key={alerta.id} position={[alerta.lat, alerta.lng]} icon={redIcon}>
          <Popup>
            <div style={{
              padding: "18px 22px",
              minWidth: "260px",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}>
              {/* Header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
                paddingBottom: "14px",
                borderBottom: "1px solid var(--border-light)",
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #EF4444, #DC2626)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(220,38,38,0.3)",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <p style={{ color: "#DC2626", fontWeight: 800, fontSize: "15px", margin: 0 }}>
                    ALERTA SOS
                  </p>
                  <p style={{ color: "#94A3B8", fontSize: "11px", margin: "2px 0 0 0" }}>
                    {timeSince(alerta.fecha_hora)}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div style={{ fontSize: "13px", lineHeight: "2.2" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94A3B8" }}>Usuario</span>
                  <span style={{ color: "#0F172A", fontWeight: 700 }}>{alerta.usuario_nombre}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94A3B8" }}>Fecha</span>
                  <span style={{ color: "#475569" }}>{formatDate(alerta.fecha_hora)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94A3B8" }}>Coordenadas</span>
                  <span style={{ color: "#64748B", fontFamily: "monospace", fontSize: "12px" }}>
                    {alerta.lat.toFixed(5)}, {alerta.lng.toFixed(5)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {onResolveAlert && (
                <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-light)" }}>
                  <button
                    onClick={() => onResolveAlert(alerta.id, "FALSA_ALARMA")}
                    style={{
                      flex: 1, padding: "8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                      background: "var(--red-50)", color: "var(--red-600)", border: "1px solid var(--red-200)",
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    Falsa Alarma
                  </button>
                  <button
                    onClick={() => onResolveAlert(alerta.id, "RESUELTA")}
                    style={{
                      flex: 1, padding: "8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                      background: "var(--green-500)", color: "white", border: "none",
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    Resuelta
                  </button>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      <FitBounds alertas={alertas} />
    </MapContainer>
  );
}
