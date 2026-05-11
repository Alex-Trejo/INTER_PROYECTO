// ═══════════════════════════════════════════════════
// Pantalla Info — Estado del sistema + instrucciones
// ═══════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Linking, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL, COLORS } from "../config";

export default function InfoScreen() {
  const [apiStatus, setApiStatus] = useState<"loading" | "ok" | "error">("loading");
  const [apiInfo, setApiInfo] = useState<{ version?: string } | null>(null);

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
      {/* Logo */}
      <View style={s.logoSection}>
        <Image source={require("../assets/logo.png")} style={s.logo} />
        <Text style={s.title}>Chaski Alerta</Text>
        <Text style={s.subtitle}>Sistema de Alerta Comunitaria Intercultural</Text>
        <Text style={s.version}>v1.0.0 — Seguridad Comunitaria Digital</Text>
      </View>

      {/* Status Card */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Ionicons name="server" size={20} color={COLORS.teal500} />
          <Text style={s.cardTitle}>Estado del Sistema</Text>
        </View>
        <View style={s.statusRow}>
          <View style={[s.dot, { backgroundColor: apiStatus === "ok" ? COLORS.green500 : apiStatus === "error" ? COLORS.red500 : COLORS.orange500 }]} />
          <Text style={s.statusLabel}>API Backend:</Text>
          <Text style={[s.statusValue, { color: apiStatus === "ok" ? COLORS.green600 : COLORS.red600 }]}>
            {apiStatus === "loading" ? "Verificando..." : apiStatus === "ok" ? "Conectado" : "Sin conexion"}
          </Text>
        </View>
        <View style={s.statusRow}>
          <Ionicons name="link" size={14} color={COLORS.textMuted} />
          <Text style={s.statusLabel}>URL:</Text>
          <Text style={s.statusValue}>{API_URL}</Text>
        </View>
        {apiInfo?.version && (
          <View style={s.statusRow}>
            <Ionicons name="code-slash" size={14} color={COLORS.textMuted} />
            <Text style={s.statusLabel}>Version API:</Text>
            <Text style={s.statusValue}>{apiInfo.version}</Text>
          </View>
        )}
      </View>

      {/* Network Info */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Ionicons name="wifi" size={20} color={COLORS.orange500} />
          <Text style={s.cardTitle}>Requisitos de Red</Text>
        </View>
        <Text style={s.infoText}>
          • El telefono y la computadora deben estar en la <Text style={s.bold}>misma red WiFi</Text>.
        </Text>
        <Text style={s.infoText}>
          • El backend debe estar corriendo en la computadora con host <Text style={s.bold}>0.0.0.0</Text>.
        </Text>
        <Text style={s.infoText}>
          • La IP en <Text style={s.bold}>config.ts</Text> debe coincidir con la IP de la computadora.
        </Text>
        <Text style={s.infoText}>
          • Si cambias de red, actualiza la IP y reinicia la app.
        </Text>
      </View>

      {/* Docs link */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Ionicons name="document-text" size={20} color={COLORS.teal500} />
          <Text style={s.cardTitle}>Documentacion API</Text>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(`${API_URL}/docs`)} style={s.linkBtn}>
          <Ionicons name="open-outline" size={16} color={COLORS.teal500} />
          <Text style={s.linkText}>Swagger UI — {API_URL}/docs</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(`${API_URL}/redoc`)} style={s.linkBtn}>
          <Ionicons name="open-outline" size={16} color={COLORS.teal500} />
          <Text style={s.linkText}>ReDoc — {API_URL}/redoc</Text>
        </TouchableOpacity>
      </View>

      {/* Credits */}
      <Text style={s.credits}>Universidad de las Fuerzas Armaddas ESPE{"\n"}Interculturalidad — Parcial I — 2026</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBody, paddingTop: 60 },
  logoSection: { alignItems: "center", marginBottom: 28, paddingHorizontal: 24 },
  logo: { width: 90, height: 90, borderRadius: 24, marginBottom: 14 },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.teal500, fontWeight: "600", marginTop: 2, textAlign: "center" },
  version: { fontSize: 11, color: COLORS.textMuted, marginTop: 6 },
  card: { backgroundColor: COLORS.bgCard, marginHorizontal: 20, marginBottom: 16, borderRadius: 18, padding: 20, elevation: 2, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, borderWidth: 1, borderColor: COLORS.borderLight },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 13, color: COLORS.textSecondary },
  statusValue: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary, flex: 1 },
  infoText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 6 },
  bold: { fontWeight: "700", color: COLORS.textPrimary },
  linkBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: COLORS.teal50, marginBottom: 8 },
  linkText: { fontSize: 13, fontWeight: "600", color: COLORS.teal600 },
  credits: { textAlign: "center", fontSize: 11, color: COLORS.textMuted, marginTop: 8, lineHeight: 18 },
});
