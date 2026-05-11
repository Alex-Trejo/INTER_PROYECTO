// ═══════════════════════════════════════════════════
// Pantalla Comunicados — Feed con notificaciones in-app
// ═══════════════════════════════════════════════════
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  ActivityIndicator, TouchableOpacity, Animated, Vibration, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL, COLORS } from "../config";

interface Comunicado {
  id: number;
  titulo: string;
  mensaje: string;
  autor: string;
  fecha_publicacion: string;
}

const GRADIENTS = [
  ["#0D7377", "#23B5C0"],
  ["#F97316", "#FB923C"],
  ["#7C3AED", "#A78BFA"],
  ["#059669", "#34D399"],
  ["#2563EB", "#60A5FA"],
  ["#DC2626", "#F87171"],
  ["#DB2777", "#F472B6"],
];

const POLL_INTERVAL = 10000; // Check every 10 seconds

function timeSince(dateStr: string): string {
  const localDateStr = dateStr.includes("+") || dateStr.includes("Z") ? dateStr : dateStr + "-05:00";
  const seconds = Math.floor((Date.now() - new Date(localDateStr).getTime()) / 1000);
  if (seconds < 0 || seconds < 5) return "justo ahora";
  if (seconds < 60) return `hace ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function ComunicadosScreen() {
  const [data, setData] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState<string | null>(null);
  const lastKnownIds = useRef<Set<number>>(new Set());
  const isFirstLoad = useRef(true);
  const alertAnim = useRef(new Animated.Value(0)).current;

  // Show in-app notification banner + vibration + system alert
  const showNotification = useCallback((comunicado: Comunicado) => {
    // 1. Vibrate phone (double buzz)
    Vibration.vibrate([0, 300, 150, 300]);

    // 2. Show animated banner inside the app
    setNewAlert(`📢 ${comunicado.autor}: ${comunicado.titulo}`);
    alertAnim.setValue(0);
    Animated.sequence([
      Animated.timing(alertAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(5000),
      Animated.timing(alertAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setNewAlert(null));

    // 3. Show system Alert dialog
    Alert.alert(
      "📢 Nuevo Comunicado",
      `${comunicado.autor}:\n\n${comunicado.titulo}\n\n${comunicado.mensaje.substring(0, 150)}...`,
      [{ text: "Entendido", style: "default" }],
      { cancelable: true }
    );
  }, [alertAnim]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/comunicados`);
      if (!res.ok) throw new Error("Error al obtener comunicados");
      const comunicados: Comunicado[] = await res.json();

      // Check for new comunicados (not on first load)
      if (!isFirstLoad.current && comunicados.length > 0) {
        const newComunicados = comunicados.filter(c => !lastKnownIds.current.has(c.id));
        for (const newC of newComunicados) {
          showNotification(newC);
        }
      }

      // Update known IDs
      lastKnownIds.current = new Set(comunicados.map(c => c.id));
      isFirstLoad.current = false;

      setData(comunicados);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexion");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showNotification]);

  // Initial fetch
  useEffect(() => { fetchData(); }, [fetchData]);

  // Polling every 10 seconds for new comunicados
  useEffect(() => {
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const renderCard = ({ item, index }: { item: Comunicado; index: number }) => {
    const colors = GRADIENTS[index % GRADIENTS.length];
    return (
      <View style={[s.card, { backgroundColor: colors[0] }]}>
        {/* Author badge */}
        <View style={s.authorRow}>
          <View style={s.authorBadge}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{getInitials(item.autor)}</Text>
            </View>
            <Text style={s.authorName}>{item.autor}</Text>
          </View>
          <Text style={s.timeText}>{timeSince(item.fecha_publicacion)}</Text>
        </View>
        {/* Content */}
        <Text style={s.cardTitle}>{item.titulo}</Text>
        <Text style={s.cardMessage} numberOfLines={4}>{item.mensaje}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={s.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.teal500} />
        <Text style={s.loadingText}>Cargando comunicados...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* In-app notification banner */}
      {newAlert && (
        <Animated.View style={[s.alertBanner, {
          opacity: alertAnim,
          transform: [{ translateY: alertAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, 0] }) }],
        }]}>
          <View style={s.alertIconWrap}>
            <Ionicons name="notifications" size={20} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.alertLabel}>Nuevo comunicado</Text>
            <Text style={s.alertText} numberOfLines={2}>{newAlert}</Text>
          </View>
        </Animated.View>
      )}

      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Comunicados</Text>
          <Text style={s.headerSub}>Willaykuna · Auto-actualización cada 10s</Text>
        </View>
        <TouchableOpacity onPress={fetchData} style={s.refreshBtn}>
          <Ionicons name="refresh" size={20} color={COLORS.teal500} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={s.errorBanner}>
          <Ionicons name="warning" size={16} color={COLORS.red600} />
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCard}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.teal500} />}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textMuted} />
            <Text style={s.emptyText}>No hay comunicados aun</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBody, paddingTop: 60 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.bgBody },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textMuted },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: COLORS.textPrimary },
  headerSub: { fontSize: 11, fontWeight: "600", color: COLORS.orange500, letterSpacing: 0.5 },
  refreshBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.bgCard, alignItems: "center", justifyContent: "center", elevation: 2, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8 },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 20, marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: COLORS.red100 },
  errorText: { fontSize: 12, color: COLORS.red600, flex: 1 },
  card: { borderRadius: 20, padding: 22, marginBottom: 16, minHeight: 160, elevation: 6, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 16 },
  authorRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  authorBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  avatar: { width: 24, height: 24, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 10, fontWeight: "800", color: "white" },
  authorName: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.9)" },
  timeText: { fontSize: 11, color: "rgba(255,255,255,0.6)" },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "white", marginBottom: 8, lineHeight: 24 },
  cardMessage: { fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 20 },
  emptyContainer: { alignItems: "center", paddingTop: 80 },
  emptyText: { fontSize: 16, color: COLORS.textMuted, marginTop: 12 },
  // Notification banner
  alertBanner: { position: "absolute", top: 44, left: 16, right: 16, zIndex: 100, backgroundColor: COLORS.teal600, borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, elevation: 12, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 20 },
  alertIconWrap: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  alertLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  alertText: { fontSize: 14, fontWeight: "700", color: "white" },
});
