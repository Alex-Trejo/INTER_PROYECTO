/**
 * Pruebas del servicio de notificaciones push del movil (problema P05).
 *
 * No se contacta con Firebase ni con el backend real: se simulan los modulos
 * nativos en jest.setup.js y se comprueba la logica propia.
 */
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import {
  CANAL_EMERGENCIAS,
  prepararCanalAndroid,
  obtenerTokenPush,
  registrarDispositivo,
} from "../src/services/push";

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn(async () => ({ ok: true, status: 200 })) as unknown as typeof fetch;
});

describe("canal de notificaciones", () => {
  it("el identificador del canal coincide con el que usa el backend", () => {
    // Si estos dos valores se separan, las notificaciones llegan silenciadas
    expect(CANAL_EMERGENCIAS).toBe("emergencias");
  });

  it("crea el canal con la maxima importancia", async () => {
    await prepararCanalAndroid();
    const [nombre, opciones] = (Notifications.setNotificationChannelAsync as jest.Mock).mock.calls[0];

    expect(nombre).toBe("emergencias");
    expect(opciones.importance).toBe(Notifications.AndroidImportance.MAX);
  });

  it("el canal ignora el modo No molestar para las emergencias", async () => {
    await prepararCanalAndroid();
    const [, opciones] = (Notifications.setNotificationChannelAsync as jest.Mock).mock.calls[0];

    expect(opciones.bypassDnd).toBe(true);
    expect(opciones.sound).toBe("default");
  });
});

describe("obtener el token del dispositivo", () => {
  it("devuelve el token nativo de Firebase", async () => {
    expect(await obtenerTokenPush()).toBe("token-fcm-de-prueba");
  });

  it("pide permiso solo si aun no esta concedido", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "granted" });
    await obtenerTokenPush();

    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it("solicita el permiso cuando falta (obligatorio en Android 13+)", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "undetermined" });
    await obtenerTokenPush();

    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  it("devuelve null si el usuario rechaza las notificaciones", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "denied" });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "denied" });

    expect(await obtenerTokenPush()).toBeNull();
  });

  it("no intenta obtener token en un emulador sin Google Play", async () => {
    (Device as { isDevice: boolean }).isDevice = false;
    expect(await obtenerTokenPush()).toBeNull();
    (Device as { isDevice: boolean }).isDevice = true;
  });
});

describe("registro del dispositivo en el backend", () => {
  it("envia el token con el metodo y la autorizacion correctos", async () => {
    const ok = await registrarDispositivo("mi-token-de-sesion");

    expect(ok).toBe(true);
    const [url, opciones] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("/api/dispositivos/token");
    expect(opciones.method).toBe("POST");
    expect(opciones.headers.Authorization).toBe("Bearer mi-token-de-sesion");
  });

  it("manda el token de Firebase en el cuerpo", async () => {
    await registrarDispositivo("mi-token-de-sesion");
    const [, opciones] = (global.fetch as jest.Mock).mock.calls[0];

    expect(JSON.parse(opciones.body).token).toBe("token-fcm-de-prueba");
  });

  it("informa del fallo si el backend rechaza el registro", async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 403 })) as unknown as typeof fetch;
    expect(await registrarDispositivo("token")).toBe(false);
  });

  it("no rompe la app si no hay conexion con el backend", async () => {
    global.fetch = jest.fn(async () => {
      throw new Error("Network request failed");
    }) as unknown as typeof fetch;

    await expect(registrarDispositivo("token")).resolves.toBe(false);
  });

  it("no llama al backend si no se pudo obtener el token", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "denied" });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "denied" });

    expect(await registrarDispositivo("token")).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
