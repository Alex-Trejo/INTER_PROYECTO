// ═══════════════════════════════════════════════════
// Onboarding de primer uso — Chaski Alerta
//
// Resuelve el problema P07 de la evaluacion: "No existe ayuda ni
// onboarding para el usuario final". Se muestra una sola vez, tras
// el primer inicio de sesion, con pictogramas grandes y texto simple
// pensado para comuneros con poca experiencia digital.
// ═══════════════════════════════════════════════════
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { COLORS } from "../../config";

const CLAVE_VISTO = "onboarding_visto";
const { width } = Dimensions.get("window");

type Paso = {
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
  fondo: string;
  titulo: string;
  kichwa: string;
  texto: string;
};

export const PASOS: Paso[] = [
  {
    icono: "alert-circle",
    color: COLORS.red500,
    fondo: COLORS.red100,
    titulo: "Pide ayuda con el boton SOS",
    kichwa: "Yanapaway",
    texto:
      "Manten pulsado el boton rojo durante 3 segundos. La directiva vera tu aviso con tu ubicacion en el mapa.\n\nSi lo sueltas antes, no se envia nada: asi evitamos falsas alarmas.",
  },
  {
    icono: "megaphone",
    color: COLORS.orange500,
    fondo: COLORS.orange100,
    titulo: "Enterate de los avisos",
    kichwa: "Willaykuna",
    texto:
      "En la pestana Avisos apareceran los comunicados de la directiva: mingas, asambleas y alertas.\n\nTu telefono te avisara aunque tengas la aplicacion cerrada.",
  },
  {
    icono: "person-circle",
    color: COLORS.teal500,
    fondo: COLORS.teal100,
    titulo: "Manten tus datos al dia",
    kichwa: "Ayllu Runa",
    texto:
      "En Perfil puedes actualizar tu telefono y tu sector de residencia.\n\nSi tu telefono se queda sin senal GPS, se usara tu sector para saber donde buscarte.",
  },
];

export default function Onboarding({ onFinalizar }: { onFinalizar: () => void }) {
  const [paso, setPaso] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const esUltimo = paso === PASOS.length - 1;

  const irA = (indice: number) => {
    scrollRef.current?.scrollTo({ x: indice * width, animated: true });
    setPaso(indice);
  };

  const cerrar = async () => {
    try {
      await SecureStore.setItemAsync(CLAVE_VISTO, "si");
    } catch {
      // Si no se puede guardar, se volvera a mostrar: es preferible a bloquear al usuario.
    }
    onFinalizar();
  };

  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <View style={s.contenedor}>
        {/* Saltar */}
        <View style={s.barraSuperior}>
          {!esUltimo && (
            <TouchableOpacity onPress={cerrar} style={s.saltar}>
              <Text style={s.saltarTexto}>Saltar</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setPaso(Math.round(e.nativeEvent.contentOffset.x / width))
          }
        >
          {PASOS.map((p) => (
            <View key={p.titulo} style={[s.pagina, { width }]}>
              <View style={[s.circulo, { backgroundColor: p.fondo }]}>
                <Ionicons name={p.icono} size={92} color={p.color} />
              </View>
              <Text style={s.titulo}>{p.titulo}</Text>
              <Text style={[s.kichwa, { color: p.color }]}>{p.kichwa}</Text>
              <Text style={s.texto}>{p.texto}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Puntos */}
        <View style={s.puntos}>
          {PASOS.map((p, i) => (
            <TouchableOpacity
              key={p.titulo}
              onPress={() => irA(i)}
              style={[
                s.punto,
                i === paso ? s.puntoActivo : null,
                i === paso ? { backgroundColor: PASOS[paso].color } : null,
              ]}
            />
          ))}
        </View>

        {/* Boton principal */}
        <TouchableOpacity
          style={[s.boton, { backgroundColor: PASOS[paso].color }]}
          onPress={() => (esUltimo ? cerrar() : irA(paso + 1))}
          activeOpacity={0.85}
        >
          <Text style={s.botonTexto}>{esUltimo ? "Empezar / Kallariy" : "Siguiente"}</Text>
          <Ionicons
            name={esUltimo ? "checkmark-circle" : "arrow-forward"}
            size={20}
            color="white"
          />
        </TouchableOpacity>

        <Text style={s.pie}>Puedes volver a ver esta ayuda en la pestana Info</Text>
      </View>
    </Modal>
  );
}

/** Indica si el usuario todavia no ha visto la guia de bienvenida. */
export async function debeMostrarOnboarding(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(CLAVE_VISTO)) !== "si";
  } catch {
    return false;
  }
}

const s = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.bgBody, paddingTop: 50, paddingBottom: 32 },
  barraSuperior: { height: 44, justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 22 },
  saltar: { paddingHorizontal: 14, paddingVertical: 8 },
  saltarTexto: { fontSize: 14, fontWeight: "700", color: COLORS.textMuted },
  pagina: { alignItems: "center", justifyContent: "flex-start", paddingHorizontal: 34 },
  circulo: {
    width: 190,
    height: 190,
    borderRadius: 95,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 38,
  },
  titulo: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 32,
  },
  kichwa: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 18,
  },
  texto: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 25,
  },
  puntos: { flexDirection: "row", justifyContent: "center", gap: 9, marginVertical: 26 },
  punto: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.borderLight },
  puntoActivo: { width: 26 },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 34,
    paddingVertical: 17,
    borderRadius: 16,
    elevation: 3,
  },
  botonTexto: { color: "white", fontSize: 16, fontWeight: "800" },
  pie: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 16,
    paddingHorizontal: 34,
  },
});
