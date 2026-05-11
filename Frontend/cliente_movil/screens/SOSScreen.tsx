// ═══════════════════════════════════════════════════
// Pantalla SOS — Botón de Emergencia con GPS
// ═══════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  Animated, Vibration, ActivityIndicator, Platform,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { API_URL, COLORS } from "../config";

export default function SOSScreen() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(loc);
    })();
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const sendSOS = async () => {
    if (sending) return;
    setSending(true);
    Vibration.vibrate([0, 200, 100, 200]);

    try {
      let loc = location;
      if (!loc) {
        loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(loc);
      }

      const res = await fetch(`${API_URL}/api/alertas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          usuario_nombre: "Usuario Movil",
        }),
      });

      if (!res.ok) throw new Error("Error del servidor");

      setSent(true);
      Animated.timing(successAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      setTimeout(() => {
        setSent(false);
        successAnim.setValue(0);
      }, 4000);
    } catch (err) {
      Alert.alert("Error", "No se pudo enviar la alerta. Verifica tu conexion a la red.");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Ionicons name="shield-checkmark" size={28} color={COLORS.teal500} />
        <Text style={s.headerTitle}>Chaski Alerta</Text>
        <Text style={s.headerSub}>Yanapaway / Emergencia</Text>
      </View>

      {/* GPS Status */}
      <View style={[s.statusCard, { borderColor: permissionDenied ? COLORS.red100 : COLORS.green100 }]}>
        <View style={[s.statusDot, { backgroundColor: permissionDenied ? COLORS.red500 : COLORS.green500 }]} />
        <Text style={s.statusText}>
          {permissionDenied
            ? "GPS no disponible — Habilita permisos de ubicacion"
            : location
            ? `GPS activo: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
            : "Obteniendo ubicacion..."}
        </Text>
      </View>

      {/* SOS Button */}
      <View style={s.sosContainer}>
        {sent ? (
          <Animated.View style={[s.successCircle, { opacity: successAnim }]}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.green500} />
            <Text style={s.successText}>Alerta Enviada</Text>
            <Text style={s.successSub}>La comunidad ha sido notificada</Text>
          </Animated.View>
        ) : (
          <>
            <Animated.View style={[s.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
            <TouchableOpacity
              style={[s.sosButton, sending && s.sosButtonDisabled]}
              onPress={sendSOS}
              disabled={sending || permissionDenied}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <>
                  <Ionicons name="alert-circle" size={48} color="white" />
                  <Text style={s.sosText}>SOS</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={s.instructions}>
        Presiona el boton para enviar una alerta de emergencia con tu ubicacion GPS
      </Text>

      {/* Connection info */}
      <View style={s.infoCard}>
        <Ionicons name="wifi" size={16} color={COLORS.teal500} />
        <Text style={s.infoText}>Conectado a: {API_URL}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBody, alignItems: "center", paddingTop: 60, paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: COLORS.textPrimary, marginTop: 8 },
  headerSub: { fontSize: 12, fontWeight: "600", color: COLORS.teal500, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 },
  statusCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.bgCard, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, width: "100%", marginBottom: 40 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  sosContainer: { alignItems: "center", justifyContent: "center", marginBottom: 32 },
  pulseRing: { position: "absolute", width: 200, height: 200, borderRadius: 100, borderWidth: 3, borderColor: "rgba(220,38,38,0.15)", backgroundColor: "rgba(220,38,38,0.04)" },
  sosButton: { width: 160, height: 160, borderRadius: 80, backgroundColor: COLORS.red500, alignItems: "center", justifyContent: "center", elevation: 12, shadowColor: COLORS.red600, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20 },
  sosButtonDisabled: { backgroundColor: COLORS.textMuted },
  sosText: { fontSize: 28, fontWeight: "900", color: "white", marginTop: 4, letterSpacing: 4 },
  successCircle: { alignItems: "center" },
  successText: { fontSize: 22, fontWeight: "800", color: COLORS.green600, marginTop: 12 },
  successSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  instructions: { fontSize: 14, color: COLORS.textMuted, textAlign: "center", paddingHorizontal: 32, lineHeight: 22 },
  infoCard: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: COLORS.teal50, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginTop: 24 },
  infoText: { fontSize: 11, color: COLORS.teal600, fontWeight: "600" },
});
