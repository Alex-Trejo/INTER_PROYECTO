// ═══════════════════════════════════════════════════
// Notificaciones push (FCM) — Chaski Alerta
//
// Resuelve el problema P05 de la evaluacion: con la app cerrada el
// comunero no recibia avisos. Aqui se pide el permiso, se obtiene el
// token nativo de Firebase y se registra en el backend.
// ═══════════════════════════════════════════════════
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { API_URL, COLORS } from "../../config";

/** Canal de Android. Debe coincidir con channel_id del backend (core/push.py). */
export const CANAL_EMERGENCIAS = "emergencias";

/**
 * Crea el canal de alta prioridad. Sin esto Android silencia la
 * notificacion cuando el telefono esta en reposo (Doze).
 */
export async function prepararCanalAndroid(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(CANAL_EMERGENCIAS, {
    name: "Alertas de emergencia",
    description: "Avisos SOS y comunicados urgentes de la directiva",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: COLORS.teal500,
    sound: "default",
    bypassDnd: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

/**
 * Pide el permiso de notificaciones (obligatorio desde Android 13)
 * y devuelve el token FCM del dispositivo, o null si no fue posible.
 */
export async function obtenerTokenPush(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("[PUSH] Las notificaciones push no funcionan en emulador sin Google Play.");
    return null;
  }

  const { status: actual } = await Notifications.getPermissionsAsync();
  let estado = actual;

  if (estado !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    estado = status;
  }

  if (estado !== "granted") {
    console.log("[PUSH] El usuario no concedio el permiso de notificaciones.");
    return null;
  }

  try {
    // Token nativo de FCM: es el que entiende firebase-admin en el backend.
    const { data } = await Notifications.getDevicePushTokenAsync();
    return typeof data === "string" ? data : null;
  } catch (e) {
    console.log("[PUSH] No se pudo obtener el token FCM:", e);
    return null;
  }
}

/** Envia el token al backend para que pueda notificar a este telefono. */
export async function registrarDispositivo(accessToken: string): Promise<boolean> {
  const token = await obtenerTokenPush();
  if (!token) return false;

  try {
    const res = await fetch(`${API_URL}/api/dispositivos/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ token, plataforma: Platform.OS }),
    });

    if (!res.ok) {
      console.log("[PUSH] El backend rechazo el registro:", res.status);
      return false;
    }
    console.log("[PUSH] Dispositivo registrado para notificaciones.");
    return true;
  } catch (e) {
    console.log("[PUSH] Sin conexion para registrar el dispositivo:", e);
    return false;
  }
}

/** Da de baja el telefono al cerrar sesion, para no seguir notificandolo. */
export async function darDeBajaDispositivo(accessToken: string): Promise<void> {
  try {
    const token = await obtenerTokenPush();
    if (!token) return;
    await fetch(`${API_URL}/api/dispositivos/token`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ token, plataforma: Platform.OS }),
    });
  } catch {
    // Si falla, el backend desactivara el token cuando FCM lo rechace.
  }
}
