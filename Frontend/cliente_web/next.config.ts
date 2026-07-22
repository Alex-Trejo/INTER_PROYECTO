import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // En modo desarrollo Next.js bloquea sus recursos internos (/_next/*) cuando
  // se accede desde un dominio distinto de localhost. Al publicar el panel por
  // Cloudflare Tunnel eso impedia que React hidratara y el login se quedaba
  // colgado en "Te estamos llevando al inicio de sesion...".
  //
  // El subdominio de trycloudflare.com cambia en cada arranque del tunel, por
  // eso se autoriza el comodin en lugar de una URL concreta.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
