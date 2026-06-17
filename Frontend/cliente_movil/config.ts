// ═══════════════════════════════════════════════════
// CHASKI ALERTA — App Móvil (Expo + React Native)
// Configuración de API
// ═══════════════════════════════════════════════════

// IMPORTANTE: Cambia esta IP por la de tu computadora (misma red WiFi)
// Ejecuta 'ipconfig' en Windows para obtenerla
// Con USB (adb reverse): usa localhost
// Sin USB (misma WiFi): usa tu IP LAN, ej: http://192.168.50.10:8000
export const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
export const DIRECTIVA_PHONE = process.env.EXPO_PUBLIC_DIRECTIVA_PHONE as string;
export const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL as string;
export const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID as string;

// Colores del design system
export const COLORS = {
  teal600: "#0D7377",
  teal500: "#14919B",
  teal400: "#23B5C0",
  teal100: "#D6F5F8",
  teal50: "#EEFBFC",
  orange600: "#E8650A",
  orange500: "#F97316",
  orange100: "#FFEDD5",
  green600: "#16A34A",
  green500: "#22C55E",
  green100: "#DCFCE7",
  red600: "#DC2626",
  red500: "#EF4444",
  red100: "#FEE2E2",
  bgBody: "#F0F4F8",
  bgCard: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  borderLight: "#E2E8F0",
};
