// ═══════════════════════════════════════════════════
// Pantalla Info — Ayuda para el comunero
// Los datos tecnicos quedan ocultos tras 7 toques en el logo.
// ═══════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Linking, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL, COLORS, DIRECTIVA_PHONE } from "../config";
import Onboarding from "../src/components/Onboarding";

const TOQUES_MODO_TECNICO = 7;

type Ayuda = { icono: keyof typeof Ionicons.glyphMap; color: string; titulo: string; texto: string };

const AYUDAS: Ayuda[] = [
  {
    icono: "alert-circle",
    color: COLORS.red500,
    titulo: "Boton SOS / Yanapaway",
    texto: "Manten pulsado el boton rojo 3 segundos. La directiva recibe tu aviso con tu ubicacion. Si lo sueltas antes, no se envia nada.",
  },
  {
    icono: "megaphone",
    color: COLORS.orange500,
    titulo: "Avisos / Willaykuna",
    texto: "Aqui aparecen los comunicados de la directiva: mingas, asambleas y avisos urgentes. Se actualizan solos.",
  },
  {
    icono: "person",
    color: COLORS.teal500,
    titulo: "Perfil",
    texto: "Revisa tus datos y manten actualizado tu telefono y tu sector. El sector se usa si tu telefono no tiene senal GPS.",
  },
];

export default function InfoScreen() {
  const [apiStatus, setApiStatus] = useState<"loading" | "ok" | "error">("loading");
  const [apiInfo, setApiInfo] = useState<{ version?: string } | null>(null);
  const [toques, setToques] = useState(0);
  const [verGuia, setVerGuia] = useState(false);

  const modoTecnico = toques >= TOQUES_MODO_TECNICO;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/`);
        if (res.ok) {
          setApiInfo(await res.json());
          setApiStatus("ok");
        } else {
          setApiStatus("error");
        }
      } catch {
        setApiStatus("error");
      }
    })();
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Logo — 7 toques activan la vista tecnica */}
      <View style={s.logoSection}>
        <TouchableOpacity activeOpacity={1} onPress={() => setToques((t) => t + 1)}>
          <Image source={require("../assets/logo.png")} style={s.logo} />
        </TouchableOpacity>
        <Text style={s.title}>Chaski Alerta</Text>
        <Text style={s.subtitle}>Sistema de Alerta Comunitaria Intercultural</Text>
      </View>

      {/* Estado en lenguaje sencillo */}
      <View style={s.card}>
        <View style={s.statusRow}>
          <View
            style={[
              s.dot,
              {
                backgroundColor:
                  apiStatus === "ok" ? COLORS.green500 : apiStatus === "error" ? COLORS.red500 : COLORS.orange500,
              },
            ]}
          />
          <Text style={s.estadoTexto}>
            {apiStatus === "loading"
              ? "Comprobando la conexion..."
              : apiStatus === "ok"
              ? "Conectado con la comunidad"
              : "Sin conexion — tu SOS se enviara por mensaje de texto"}
          </Text>
        </View>
      </View>

      {/* Ayuda: como usar la app */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Ionicons name="help-buoy" size={20} color={COLORS.teal500} />
          <Text style={s.cardTitle}>Como usar Chaski Alerta</Text>
        </View>
        {AYUDAS.map((a) => (
          <View key={a.titulo} style={s.ayudaFila}>
            <View style={[s.ayudaIcono, { backgroundColor: `${a.color}1A` }]}>
              <Ionicons name={a.icono} size={22} color={a.color} />
            </View>
            <View style={s.ayudaTexto}>
              <Text style={s.ayudaTitulo}>{a.titulo}</Text>
              <Text style={s.infoText}>{a.texto}</Text>
            </View>
          </View>
        ))}

        {/* Vuelve a abrir la guia de bienvenida (P07) */}
        <TouchableOpacity onPress={() => setVerGuia(true)} style={s.linkBtn}>
          <Ionicons name="play-circle" size={16} color={COLORS.teal600} />
          <Text style={s.linkText}>Ver la guia de bienvenida otra vez</Text>
        </TouchableOpacity>
      </View>

      {/* Que pasa cuando pido ayuda */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.green600} />
          <Text style={s.cardTitle}>Cuando pides ayuda</Text>
        </View>
        <Text style={s.infoText}>• Con internet, tu alerta aparece al instante en el mapa de la directiva.</Text>
        <Text style={s.infoText}>• Sin internet, la app abre un mensaje de texto para la directiva.</Text>
        <Text style={s.infoText}>• Si tu telefono no tiene senal GPS, se informa el sector de tu perfil.</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${DIRECTIVA_PHONE}`)} style={s.linkBtn}>
          <Ionicons name="call" size={16} color={COLORS.teal600} />
          <Text style={s.linkText}>Llamar a la directiva: {DIRECTIVA_PHONE}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Vista tecnica (oculta) ───────────────────── */}
      {modoTecnico && (
        <View style={[s.card, s.cardTecnica]}>
          <View style={s.cardHeader}>
            <Ionicons name="construct" size={20} color={COLORS.textMuted} />
            <Text style={s.cardTitle}>Informacion tecnica</Text>
          </View>
          <View style={s.statusRow}>
            <Ionicons name="link" size={14} color={COLORS.textMuted} />
            <Text style={s.statusLabel}>API:</Text>
            <Text style={s.statusValue}>{API_URL}</Text>
          </View>
          {apiInfo?.version && (
            <View style={s.statusRow}>
              <Ionicons name="code-slash" size={14} color={COLORS.textMuted} />
              <Text style={s.statusLabel}>Version:</Text>
              <Text style={s.statusValue}>{apiInfo.version}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => Linking.openURL(`${API_URL}/docs`)} style={s.linkBtn}>
            <Ionicons name="open-outline" size={16} color={COLORS.teal500} />
            <Text style={s.linkText}>Swagger UI</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(`${API_URL}/redoc`)} style={s.linkBtn}>
            <Ionicons name="open-outline" size={16} color={COLORS.teal500} />
            <Text style={s.linkText}>ReDoc</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setToques(0)} style={s.ocultarBtn}>
            <Text style={s.ocultarTexto}>Ocultar</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={s.credits}>Chaski Alerta v1.0.0{"\n"}Seguridad comunitaria digital</Text>

      {/* Al cerrarse, el propio componente deja marcada la guia como vista */}
      {verGuia && <Onboarding onFinalizar={() => setVerGuia(false)} />}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBody, paddingTop: 60 },
  logoSection: { alignItems: "center", marginBottom: 28, paddingHorizontal: 24 },
  logo: { width: 90, height: 90, borderRadius: 24, marginBottom: 14 },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.teal500, fontWeight: "600", marginTop: 2, textAlign: "center" },
  card: { backgroundColor: COLORS.bgCard, marginHorizontal: 20, marginBottom: 16, borderRadius: 18, padding: 20, elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, borderWidth: 1, borderColor: COLORS.borderLight },
  cardTecnica: { backgroundColor: COLORS.bgBody, borderStyle: "dashed" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  estadoTexto: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, flex: 1 },
  statusLabel: { fontSize: 13, color: COLORS.textSecondary },
  statusValue: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary, flex: 1 },
  ayudaFila: { flexDirection: "row", gap: 14, marginBottom: 18 },
  ayudaIcono: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  ayudaTexto: { flex: 1 },
  ayudaTitulo: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 3 },
  infoText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 21, marginBottom: 6 },
  linkBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: COLORS.teal50, marginTop: 8 },
  linkText: { fontSize: 13, fontWeight: "600", color: COLORS.teal600 },
  ocultarBtn: { alignSelf: "flex-start", marginTop: 12, paddingVertical: 6, paddingHorizontal: 12 },
  ocultarTexto: { fontSize: 12, fontWeight: "700", color: COLORS.textMuted },
  credits: { textAlign: "center", fontSize: 11, color: COLORS.textMuted, marginTop: 8, lineHeight: 18 },
});
