// ═══════════════════════════════════════════════════
// Pantalla Perfil — Gestión nativa de usuario
// ═══════════════════════════════════════════════════
import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, ScrollView, Modal, FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL, COLORS } from "../config";
import { useAuth } from "../src/contexts/AuthContext";

interface Sector {
  id: number;
  nombre: string;
}

export default function ProfileScreen() {
  const { user, accessToken, logout } = useAuth();
  const [telefono, setTelefono] = useState("");
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [extraData, setExtraData] = useState<{cedula: string, telefono: string}>({ cedula: "", telefono: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchSectores();
      if (accessToken) {
        await fetchPerfil();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPerfil = async () => {
    try {
      const res = await fetch(`${API_URL}/api/perfil/mi-perfil`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      if (res.status === 401) {
        logout(); // Token expired
        return;
      }
      if (!res.ok) throw new Error("Error obteniendo perfil");
      const data = await res.json();
      setExtraData({ cedula: data.cedula || "", telefono: data.telefono || "" });
      setTelefono(data.telefono || "");
      if (data.id_sector) {
        setSelectedSector({ id: data.id_sector, nombre: data.sector || "" });
      }
    } catch (err) {
      console.error("Error perfil:", err);
    }
  };

  const fetchSectores = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sectores`);
      if (!res.ok) throw new Error("Error obteniendo sectores");
      const data = await res.json();
      setSectores(data);
    } catch (err) {
      console.error("Error sectores:", err);
    }
  };

  const handleUpdate = async () => {
    if (!accessToken) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/api/perfil/mi-perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          telefono: telefono || null,
          id_sector: selectedSector ? selectedSector.id : null
        })
      });

      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error("Fallo al actualizar el perfil");
      
      Alert.alert("Éxito", "Perfil actualizado correctamente. (Se reflejará en la Base de Datos y en Keycloak).");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Error al actualizar perfil");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.avatarCircle}>
          <Text style={s.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
        </View>
        <Text style={s.headerTitle}>{user?.name || "Comunero"}</Text>
        <Text style={s.headerSub}>{user?.email}</Text>
      </View>

      {/* Info Card (Read-only from Token) */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Datos Oficiales (Solo Lectura)</Text>
        
        <View style={s.infoRow}>
          <Ionicons name="card-outline" size={20} color={COLORS.textMuted} />
          <View style={s.infoTextWrap}>
            <Text style={s.infoLabel}>Cédula de Identidad</Text>
            <Text style={s.infoValue}>{extraData.cedula || user?.cedula || "No registrada"}</Text>
          </View>
        </View>
        
        <View style={s.infoRow}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />
          <View style={s.infoTextWrap}>
            <Text style={s.infoLabel}>Correo Electrónico</Text>
            <Text style={s.infoValue}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Editable Form Card */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Actualizar Datos Personales</Text>

        <Text style={s.inputLabel}>Teléfono Móvil</Text>
        <View style={s.inputContainer}>
          <Ionicons name="call-outline" size={20} color={COLORS.teal500} style={s.inputIcon} />
          <TextInput
            style={s.input}
            placeholder="Ej: +593987654321"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={s.inputLabel}>Sector de Residencia</Text>
        <TouchableOpacity
          style={s.inputContainer}
          onPress={() => setPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="map-outline" size={20} color={COLORS.teal500} style={s.inputIcon} />
          <Text style={[s.input, { color: selectedSector ? COLORS.textPrimary : COLORS.textMuted, marginTop: 14 }]}>
            {selectedSector ? selectedSector.nombre : (loading ? "Cargando sectores..." : "Seleccione su sector")}
          </Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[s.updateBtn, updating && { opacity: 0.7 }]} 
          onPress={handleUpdate}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={s.updateBtnText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={22} color={COLORS.red500} />
        <Text style={s.logoutBtnText}>Cerrar Sesión / Lluqsiy</Text>
      </TouchableOpacity>

      {/* Custom Picker Modal */}
      <Modal visible={isPickerVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Elija un Sector</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={sectores}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.modalItem}
                  onPress={() => {
                    setSelectedSector(item);
                    setPickerVisible(false);
                  }}
                >
                  <Text style={s.modalItemText}>{item.nombre}</Text>
                  {selectedSector?.id === item.id && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.teal500} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBody, paddingHorizontal: 20 },
  header: { alignItems: "center", marginTop: 40, marginBottom: 24 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.teal100, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: "bold", color: COLORS.teal600 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: COLORS.textPrimary },
  headerSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  
  card: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.teal600, marginBottom: 16, letterSpacing: -0.5 },
  
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  infoTextWrap: { marginLeft: 12 },
  infoLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", fontWeight: "600", marginBottom: 2 },
  infoValue: { fontSize: 15, color: COLORS.textPrimary, fontWeight: "500" },
  
  inputLabel: { fontSize: 12, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 6, marginLeft: 4 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.bgBody, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderLight, paddingHorizontal: 12, height: 50, marginBottom: 16 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  
  updateBtn: { backgroundColor: COLORS.teal500, borderRadius: 12, height: 50, alignItems: "center", justifyContent: "center", marginTop: 8 },
  updateBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
  
  logoutBtn: { flexDirection: "row", backgroundColor: COLORS.red100, borderRadius: 12, height: 54, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.red500 },
  logoutBtnText: { color: COLORS.red600, fontSize: 16, fontWeight: "700", marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "60%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderColor: COLORS.borderLight },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.textPrimary },
  modalItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 16, borderBottomWidth: 1, borderColor: COLORS.bgBody },
  modalItemText: { fontSize: 16, color: COLORS.textSecondary }
});
