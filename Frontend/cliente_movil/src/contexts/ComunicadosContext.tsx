import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Animated, Vibration } from "react-native";
import * as Notifications from "expo-notifications";
import { API_URL } from "../../config";

export interface Comunicado {
  id: number;
  titulo: string;
  mensaje: string;
  autor: string;
  fecha_publicacion: string;
}

interface ComunicadosContextData {
  data: Comunicado[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  newAlert: string | null;
  alertAnim: Animated.Value;
  onRefresh: () => void;
  fetchData: () => Promise<void>;
}

const ComunicadosContext = createContext<ComunicadosContextData>({} as ComunicadosContextData);

export function ComunicadosProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI State for Global Banner
  const [newAlert, setNewAlert] = useState<string | null>(null);
  const alertAnim = useRef(new Animated.Value(0)).current;
  
  const lastKnownIds = useRef<Set<number>>(new Set());
  const isFirstLoad = useRef(true);

  const showNotification = useCallback(async (comunicado: Comunicado) => {
    Vibration.vibrate([0, 300, 150, 300]);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📢 Nuevo Aviso / Musuq Willay",
        body: `${comunicado.autor}: ${comunicado.titulo}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null,
    });

    setNewAlert(`📢 ${comunicado.autor}: ${comunicado.titulo}`);
    alertAnim.setValue(0);
    Animated.sequence([
      Animated.timing(alertAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(6000),
      Animated.timing(alertAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setNewAlert(null));
  }, [alertAnim]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/comunicados`);
      if (!res.ok) throw new Error("Error al obtener comunicados");
      const comunicados: Comunicado[] = await res.json();

      if (!isFirstLoad.current && comunicados.length > 0) {
        const newComunicados = comunicados.filter(c => !lastKnownIds.current.has(c.id));
        for (const newC of newComunicados) {
          showNotification(newC);
        }
      }

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

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  return (
    <ComunicadosContext.Provider value={{ data, loading, refreshing, error, newAlert, alertAnim, onRefresh, fetchData }}>
      {children}
    </ComunicadosContext.Provider>
  );
}

export const useComunicados = () => useContext(ComunicadosContext);
