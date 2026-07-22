/**
 * Pruebas de la tarjeta de comunicado del panel de la Directiva.
 *
 * Cubren el problema P03 de la evaluacion ("No existe editar ni eliminar
 * comunicados publicados"): los botones deben aparecer solo cuando la vista
 * los habilita, y avisar con el comunicado correcto.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComunicadoCard, { getInitials } from "@/components/ComunicadoCard";

const COMUNICADO = {
  id: 42,
  titulo: "Minga Comunitaria / Minka Ayllu",
  mensaje: "Se convoca a la minga del sabado a las 7 de la manana en la plaza.",
  autor: "Admin Directiva",
  fecha_publicacion: "2026-07-22T08:00:00",
};

describe("getInitials", () => {
  it("toma la inicial de nombre y apellido", () => {
    expect(getInitials("Admin Directiva")).toBe("AD");
  });

  it("funciona con un solo nombre", () => {
    expect(getInitials("Directiva")).toBe("D");
  });

  it("nunca devuelve mas de dos letras", () => {
    expect(getInitials("Maria Dolores Quishpe Toapanta")).toHaveLength(2);
  });

  it("siempre devuelve mayusculas", () => {
    expect(getInitials("alex trejo")).toBe("AT");
  });
});

describe("ComunicadoCard", () => {
  it("muestra el titulo, el mensaje y el autor", () => {
    render(<ComunicadoCard comunicado={COMUNICADO} index={0} />);
    expect(screen.getByText(COMUNICADO.titulo)).toBeInTheDocument();
    expect(screen.getByText(COMUNICADO.mensaje)).toBeInTheDocument();
    expect(screen.getByText(COMUNICADO.autor)).toBeInTheDocument();
  });

  it("no muestra botones de gestion si no se pasan manejadores", () => {
    render(<ComunicadoCard comunicado={COMUNICADO} index={0} />);
    expect(screen.queryByLabelText("Corregir comunicado")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Retirar comunicado del muro")).not.toBeInTheDocument();
  });

  it("muestra los botones de corregir y retirar cuando la Directiva puede gestionar", () => {
    render(
      <ComunicadoCard comunicado={COMUNICADO} index={0} onEdit={() => {}} onDelete={() => {}} />
    );
    expect(screen.getByLabelText("Corregir comunicado")).toBeInTheDocument();
    expect(screen.getByLabelText("Retirar comunicado del muro")).toBeInTheDocument();
  });

  it("avisa con el comunicado correcto al pulsar corregir", async () => {
    const alEditar = jest.fn();
    render(<ComunicadoCard comunicado={COMUNICADO} index={0} onEdit={alEditar} />);

    await userEvent.click(screen.getByLabelText("Corregir comunicado"));

    expect(alEditar).toHaveBeenCalledTimes(1);
    expect(alEditar).toHaveBeenCalledWith(COMUNICADO);
  });

  it("avisa con el comunicado correcto al pulsar retirar", async () => {
    const alBorrar = jest.fn();
    render(<ComunicadoCard comunicado={COMUNICADO} index={0} onDelete={alBorrar} />);

    await userEvent.click(screen.getByLabelText("Retirar comunicado del muro"));

    expect(alBorrar).toHaveBeenCalledWith(expect.objectContaining({ id: 42 }));
  });

  it("permite mostrar solo el boton de corregir", () => {
    render(<ComunicadoCard comunicado={COMUNICADO} index={0} onEdit={() => {}} />);
    expect(screen.getByLabelText("Corregir comunicado")).toBeInTheDocument();
    expect(screen.queryByLabelText("Retirar comunicado del muro")).not.toBeInTheDocument();
  });

  it("los botones son accesibles por teclado y tienen etiqueta", () => {
    render(
      <ComunicadoCard comunicado={COMUNICADO} index={0} onEdit={() => {}} onDelete={() => {}} />
    );
    const botones = screen.getAllByRole("button");
    expect(botones).toHaveLength(2);
    botones.forEach((b) => expect(b).toHaveAttribute("aria-label"));
  });

  it("asigna colores distintos a tarjetas consecutivas", () => {
    const { container: primera } = render(<ComunicadoCard comunicado={COMUNICADO} index={0} />);
    const { container: segunda } = render(<ComunicadoCard comunicado={COMUNICADO} index={1} />);

    const fondo = (c: HTMLElement) =>
      (c.querySelector("article") as HTMLElement).style.background;

    expect(fondo(primera)).not.toBe(fondo(segunda));
  });

  it("reutiliza la paleta ciclicamente cuando hay muchos comunicados", () => {
    const { container: a } = render(<ComunicadoCard comunicado={COMUNICADO} index={0} />);
    const { container: b } = render(<ComunicadoCard comunicado={COMUNICADO} index={8} />);

    const fondo = (c: HTMLElement) =>
      (c.querySelector("article") as HTMLElement).style.background;

    expect(fondo(a)).toBe(fondo(b));
  });
});
