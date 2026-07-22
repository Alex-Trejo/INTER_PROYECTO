/**
 * Pruebas de la guia de bienvenida (problema P07: "No existe ayuda ni
 * onboarding para el usuario final").
 *
 * Se prueba la LOGICA: cuando debe mostrarse la guia y que su contenido cubra
 * las funciones criticas. No se renderiza la interfaz porque
 * @testing-library/react-native 14 es incompatible con React 19.1 en este
 * preset (su render devuelve un objeto vacio).
 */
import * as SecureStore from "expo-secure-store";
import { PASOS, debeMostrarOnboarding } from "../src/components/Onboarding";

beforeEach(() => jest.clearAllMocks());

describe("cuando mostrar la guia", () => {
  it("se muestra si el comunero nunca la ha visto", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    expect(await debeMostrarOnboarding()).toBe(true);
  });

  it("no se vuelve a mostrar si ya se vio", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("si");
    expect(await debeMostrarOnboarding()).toBe(false);
  });

  it("consulta la clave correcta del almacenamiento", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
    await debeMostrarOnboarding();
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("onboarding_visto");
  });

  it("ante un error de lectura no bloquea al usuario", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error("sin acceso"));
    expect(await debeMostrarOnboarding()).toBe(false);
  });

  it("un valor inesperado se trata como no vista", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("cualquier-cosa");
    expect(await debeMostrarOnboarding()).toBe(true);
  });
});

describe("contenido de la guia", () => {
  const texto = PASOS.map((p) => `${p.titulo} ${p.kichwa} ${p.texto}`).join(" ");

  it("tiene exactamente tres pasos", () => {
    expect(PASOS).toHaveLength(3);
  });

  it("el primer paso es el SOS, la funcion critica del sistema", () => {
    expect(PASOS[0].titulo).toMatch(/SOS/i);
    expect(PASOS[0].icono).toBe("alert-circle");
  });

  it("explica que hay que mantener pulsado 3 segundos (P04)", () => {
    expect(texto).toMatch(/3 segundos/i);
  });

  it("aclara que no se envia nada si se suelta antes", () => {
    expect(texto).toMatch(/no se envia nada/i);
  });

  it("avisa de que los avisos llegan con la aplicacion cerrada (P05)", () => {
    expect(texto).toMatch(/aplicacion cerrada/i);
  });

  it("explica que el sector sirve cuando no hay GPS (P09)", () => {
    expect(texto).toMatch(/sin senal GPS/i);
  });

  it("cada paso incluye su termino en Kichwa", () => {
    expect(PASOS.map((p) => p.kichwa)).toEqual(["Yanapaway", "Willaykuna", "Ayllu Runa"]);
  });

  it("cada paso tiene icono, color y texto explicativo", () => {
    PASOS.forEach((p) => {
      expect(p.icono).toBeTruthy();
      expect(p.color).toMatch(/^#/);
      expect(p.texto.length).toBeGreaterThan(50);
    });
  });

  it("usa un color distinto por paso para diferenciarlos", () => {
    const colores = PASOS.map((p) => p.color);
    expect(new Set(colores).size).toBe(3);
  });

  it("no contiene jerga tecnica dirigida a desarrolladores", () => {
    expect(texto).not.toMatch(/API|endpoint|token|backend|JSON/i);
  });

  it("los textos son suficientemente cortos para leerse en una pantalla", () => {
    PASOS.forEach((p) => expect(p.texto.length).toBeLessThan(260));
  });
});
