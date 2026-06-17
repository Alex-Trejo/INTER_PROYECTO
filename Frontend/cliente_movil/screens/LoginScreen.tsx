import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { COLORS } from '../config';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Ionicons name="shield-checkmark" size={64} color={COLORS.teal500} />
        <Text style={s.title}>Chaski Alerta</Text>
        <Text style={s.subtitle}>Sistema de Emergencia Comunal</Text>
      </View>

      <View style={s.content}>
        <Text style={s.description}>
          Inicia sesión con tus credenciales de la comunidad para tener acceso al botón SOS y a la red de alertas.
        </Text>

        <TouchableOpacity 
          style={s.button} 
          onPress={login} 
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={s.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>Conectado mediante Keycloak Enterprise Auth</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgBody, justifyContent: 'space-between', padding: 24, paddingTop: 80 },
  header: { alignItems: 'center', marginTop: 40 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.textPrimary, marginTop: 16, letterSpacing: 1 },
  subtitle: { fontSize: 14, fontWeight: '600', color: COLORS.teal600, marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 },
  content: { alignItems: 'center', marginVertical: 40 },
  description: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 40, paddingHorizontal: 16 },
  button: { backgroundColor: COLORS.teal600, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center', elevation: 4, shadowColor: COLORS.teal600, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  footer: { alignItems: 'center', marginBottom: 24 },
  footerText: { fontSize: 12, color: COLORS.textMuted },
});
