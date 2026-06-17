// ═══════════════════════════════════════════════════
// CHASKI ALERTA — App Principal
// Tab Navigation: SOS | Comunicados | Info
// ═══════════════════════════════════════════════════
import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SOSScreen from "./screens/SOSScreen";
import ComunicadosScreen from "./screens/ComunicadosScreen";
import ProfileScreen from "./screens/ProfileScreen";
import InfoScreen from "./screens/InfoScreen";
import { COLORS } from "./config";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// 1. HANDLER GLOBAL (Atrapa notificaciones en cualquier estado)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type TabKey = "sos" | "comunicados" | "perfil" | "info";

interface Tab {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  color: string;
}

const tabs: Tab[] = [
  { key: "sos", label: "SOS", icon: "alert-circle-outline", iconActive: "alert-circle", color: COLORS.red500 },
  { key: "comunicados", label: "Avisos", icon: "megaphone-outline", iconActive: "megaphone", color: COLORS.orange500 },
  { key: "perfil", label: "Perfil", icon: "person-outline", iconActive: "person", color: COLORS.teal500 },
  { key: "info", label: "Info", icon: "information-circle-outline", iconActive: "information-circle", color: COLORS.teal500 },
];

import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { ComunicadosProvider, useComunicados } from "./src/contexts/ComunicadosContext";
import LoginScreen from "./screens/LoginScreen";

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabKey>("sos");
  const { user, isLoading } = useAuth();
  const { newAlert, alertAnim } = useComunicados();

  if (isLoading) {
    return (
      <SafeAreaView style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.teal500} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case "sos": return <SOSScreen />;
      case "comunicados": return <ComunicadosScreen />;
      case "perfil": return <ProfileScreen />;
      case "info": return <InfoScreen />;
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgBody} />

      {/* In-app premium global notification banner */}
      {newAlert && (
        <Animated.View style={[s.alertBanner, {
          opacity: alertAnim,
          transform: [{ translateY: alertAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] }) }],
        }]}>
          <View style={s.alertIconWrap}>
            <Ionicons name="leaf" size={22} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.alertLabel}>NUEVO AVISO / MUSUQ WILLAY</Text>
            <Text style={s.alertText} numberOfLines={2}>{newAlert}</Text>
          </View>
        </Animated.View>
      )}

      {/* Screen content */}
      <View style={s.content}>{renderScreen()}</View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={s.tab}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={[s.tabIconWrap, isActive && { backgroundColor: tab.color + "15" }]}>
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={24}
                  color={isActive ? tab.color : COLORS.textMuted}
                />
              </View>
              <Text style={[s.tabLabel, isActive && { color: tab.color, fontWeight: "700" }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  React.useEffect(() => {
    async function setupNotifications() {
      // 2. CANALES DE ANDROID (Máxima Prioridad)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Alertas Comunitarias",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#D32F2F",
        });
      }
      
      // Request permissions for Android 13+ and iOS
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.warn("Permiso de notificaciones denegado");
      }
    }
    setupNotifications();
  }, []);

  return (
    <AuthProvider>
      <ComunicadosProvider>
        <MainApp />
      </ComunicadosProvider>
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBody },
  content: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 4 },
  tabIconWrap: { width: 42, height: 32, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tabLabel: { fontSize: 11, fontWeight: "500", color: COLORS.textMuted, marginTop: 2 },
  // Premium Notification banner (Global)
  alertBanner: { 
    position: "absolute", top: 48, left: 20, right: 20, zIndex: 100, 
    backgroundColor: "#2E7D32", 
    borderRadius: 24, padding: 18, flexDirection: "row", alignItems: "center", gap: 16, 
    elevation: 20, shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 25, shadowOffset: { width: 0, height: 10 },
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)"
  },
  alertIconWrap: { width: 44, height: 44, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  alertLabel: { fontSize: 10, fontWeight: "800", color: "#A5D6A7", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 },
  alertText: { fontSize: 15, fontWeight: "700", color: "white", lineHeight: 22 },
});
