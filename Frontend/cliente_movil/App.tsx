// ═══════════════════════════════════════════════════
// CHASKI ALERTA — App Principal
// Tab Navigation: SOS | Comunicados | Info
// ═══════════════════════════════════════════════════
import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SOSScreen from "./screens/SOSScreen";
import ComunicadosScreen from "./screens/ComunicadosScreen";
import InfoScreen from "./screens/InfoScreen";
import { COLORS } from "./config";

type TabKey = "sos" | "comunicados" | "info";

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
  { key: "info", label: "Sistema", icon: "information-circle-outline", iconActive: "information-circle", color: COLORS.teal500 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("sos");

  const renderScreen = () => {
    switch (activeTab) {
      case "sos": return <SOSScreen />;
      case "comunicados": return <ComunicadosScreen />;
      case "info": return <InfoScreen />;
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgBody} />

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
});
