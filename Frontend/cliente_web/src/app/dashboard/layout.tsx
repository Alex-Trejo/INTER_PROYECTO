"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ReactNode, useState, useEffect } from "react";

/* ─── Theme Toggle Hook ───────────────────────────── */
function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("chaski-theme") as "light" | "dark" | null;
    const initial = stored || "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("chaski-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return { theme, toggle, mounted };
}

/* ─── Navigation Items ────────────────────────────── */
interface NavItem {
  href: string;
  label: string;
  labelKichwa: string;
  icon: (active: boolean) => ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard/mapa",
    label: "Mapa de Alertas",
    labelKichwa: "Alerta Allpamapa",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
  {
    href: "/dashboard/avisos",
    label: "Comunicados",
    labelKichwa: "Willaykuna",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, toggle, mounted } = useTheme();

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-body)" }}>
      {/* ─── Sidebar ─────────────────────────────── */}
      <aside
        className="flex flex-col"
        style={{
          width: "var(--sidebar-width)",
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border-card)",
          boxShadow: "4px 0 30px rgba(0,0,0,0.03)",
          transition: "background-color 0.4s ease, border-color 0.4s ease",
        }}
      >
        {/* Andean accent bar */}
        <div className="andean-bar" />

        {/* ─── Logo Section (BIG) ───────────────── */}
        <div style={{ padding: "28px 24px 20px" }}>
          <Link href="/dashboard/mapa" className="no-underline block">
            <div className="flex flex-col items-center text-center">
              <div
                className="animate-float"
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "24px",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-lg), var(--shadow-glow)",
                  marginBottom: "16px",
                  border: "3px solid var(--teal-100)",
                }}
              >
                <Image
                  src="/Recurso/Captura de pantalla 2026-05-11 001658.png"
                  alt="Chaski Alerta"
                  width={90}
                  height={90}
                  className="object-cover"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <h1
                className="text-[20px] font-extrabold tracking-[-0.03em]"
                style={{ color: "var(--text-primary)", lineHeight: "1.2" }}
              >
                Chaski Alerta
              </h1>
              <p
                className="text-[11px] font-bold tracking-[0.12em] uppercase mt-1"
                style={{ color: "var(--teal-500)" }}
              >
                Seguridad Comunitaria
              </p>
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div style={{ margin: "0 20px", height: "1px", background: "var(--border-light)" }} />

        {/* ─── Navigation ───────────────────────── */}
        <nav style={{ flex: 1, padding: "20px 16px 12px" }}>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "var(--text-muted)", padding: "0 12px", marginBottom: "12px" }}
          >
            Panel de Control
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="no-underline flex items-center gap-12px"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    background: isActive
                      ? "linear-gradient(135deg, var(--teal-50), rgba(20,145,155,0.06))"
                      : "transparent",
                    border: isActive
                      ? "1px solid var(--teal-100)"
                      : "1px solid transparent",
                    transition: "all 0.25s ease",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isActive
                        ? "var(--gradient-primary)"
                        : "var(--bg-body)",
                      boxShadow: isActive
                        ? "0 4px 12px rgba(13, 115, 119, 0.3)"
                        : "var(--shadow-xs)",
                      color: isActive ? "white" : "var(--text-muted)",
                      transition: "all 0.25s ease",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon(isActive)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      className="text-[13px] font-semibold"
                      style={{
                        color: isActive ? "var(--teal-600)" : "var(--text-secondary)",
                        margin: 0,
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{
                        color: isActive ? "var(--teal-400)" : "var(--text-muted)",
                        margin: 0,
                      }}
                    >
                      {item.labelKichwa}
                    </p>
                  </div>
                  {isActive && (
                    <div
                      style={{
                        width: "5px",
                        height: "24px",
                        borderRadius: "3px",
                        background: "var(--gradient-primary)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ─── Theme Toggle + Status ────────────── */}
        <div style={{ padding: "12px 16px 16px" }}>
          {/* Theme toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-card-alt)",
              marginBottom: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {mounted && theme === "light" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal-300)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              <span className="text-[12px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                {mounted ? (theme === "light" ? "Modo Claro" : "Modo Oscuro") : "Tema"}
              </span>
            </div>
            <button
              onClick={toggle}
              className="theme-toggle"
              aria-label="Toggle theme"
              type="button"
            >
              <div className="theme-toggle-thumb" />
            </button>
          </div>

          {/* Status */}
          <div
            style={{
              padding: "16px",
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, var(--teal-50), var(--green-50))",
              border: "1px solid var(--teal-100)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--green-500)",
                  animation: "pulseDot 2s ease-in-out infinite",
                }}
              />
              <span className="text-[11px] font-bold" style={{ color: "var(--green-600)" }}>
                Sistema Kawsashka
              </span>
            </div>
            <p className="text-[11px]" style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Protegiendo a la comunidad en tiempo real
            </p>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────────── */}
      <main
        style={{
          flex: 1,
          overflow: "auto",
          background: "var(--bg-body)",
          transition: "background-color 0.4s ease",
        }}
      >
        {children}
      </main>
    </div>
  );
}
