/**
 * Pruebas de timeSince(), la funcion que muestra "hace 5 min" en las tarjetas.
 *
 * Tiene un detalle delicado: el backend devuelve la hora local de Ecuador
 * (UTC-5) SIN indicador de zona horaria. Si el navegador la interpretara como
 * UTC, todos los comunicados aparecerian con 5 horas de desfase. Por eso la
 * funcion añade "-05:00" cuando falta. Estas pruebas protegen ese detalle.
 */
import { timeSince } from "@/components/ComunicadoCard";

/** Construye la marca de tiempo que enviaria el backend, N segundos atras. */
function haceSegundos(n: number): string {
  const d = new Date(Date.now() - n * 1000);
  // Hora de Ecuador (UTC-5) en el formato del backend, sin zona horaria
  const ec = new Date(d.getTime() - 5 * 60 * 60 * 1000);
  return ec.toISOString().replace("Z", "").slice(0, 23);
}

describe("timeSince", () => {
  it("muestra 'justo ahora' para un comunicado recien publicado", () => {
    expect(timeSince(haceSegundos(1))).toBe("justo ahora");
  });

  it("muestra los segundos cuando pasa menos de un minuto", () => {
    expect(timeSince(haceSegundos(30))).toMatch(/^hace \d+s$/);
  });

  it("cambia a minutos al pasar el minuto", () => {
    expect(timeSince(haceSegundos(120))).toBe("hace 2 min");
  });

  it("cambia a horas al pasar los 60 minutos", () => {
    expect(timeSince(haceSegundos(3 * 3600))).toBe("hace 3h");
  });

  it("cambia a dias al pasar las 24 horas", () => {
    expect(timeSince(haceSegundos(2 * 24 * 3600))).toBe("hace 2d");
  });

  it("interpreta la hora de Ecuador sin desfase de 5 horas", () => {
    // Si no se aplicara el offset, esto diria "hace 5h" en lugar de minutos
    const resultado = timeSince(haceSegundos(300));
    expect(resultado).toBe("hace 5 min");
    expect(resultado).not.toMatch(/hace \d+h/);
  });

  it("respeta una fecha que ya trae zona horaria en Z", () => {
    const hace10min = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(timeSince(hace10min)).toBe("hace 10 min");
  });

  it("respeta una fecha que ya trae desplazamiento explicito", () => {
    const d = new Date(Date.now() - 60 * 60 * 1000 - 5 * 3600 * 1000);
    const conOffset = d.toISOString().replace("Z", "") + "-05:00";
    expect(timeSince(conOffset)).toBe("hace 1h");
  });

  it("no muestra tiempos negativos si el reloj va adelantado", () => {
    const futuro = new Date(Date.now() + 60 * 1000);
    const ec = new Date(futuro.getTime() - 5 * 3600 * 1000);
    expect(timeSince(ec.toISOString().replace("Z", ""))).toBe("justo ahora");
  });
});
