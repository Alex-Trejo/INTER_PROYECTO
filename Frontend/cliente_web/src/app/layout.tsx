import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Chaski Alerta | Panel de Monitoreo Comunitario",
  description:
    "Sistema de Alerta Comunitaria Intercultural Andina — Seguridad Comunitaria Digital. Monitoreo de emergencias y comunicados para comunidades rurales del Ecuador.",
  keywords: [
    "chaski",
    "alerta comunitaria",
    "emergencia",
    "comunidad andina",
    "Ecuador",
    "interculturalidad",
    "seguridad comunitaria",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="/Recurso/Captura de pantalla 2026-05-11 001658.png"
          type="image/png"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('chaski-theme');
                  if (theme === 'dark' || theme === 'light') {
                    document.documentElement.setAttribute('data-theme', theme);
                  } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
