import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import { jwtDecode } from 'jwt-decode';
import { KEYCLOAK_URL, CLIENT_ID } from '../../config';
import { darDeBajaDispositivo } from '../services/push';

const discovery = {
  authorizationEndpoint: `${KEYCLOAK_URL}/protocol/openid-connect/auth`,
  tokenEndpoint: `${KEYCLOAK_URL}/protocol/openid-connect/token`,
  revocationEndpoint: `${KEYCLOAK_URL}/protocol/openid-connect/revoke`,
};

interface UserData {
  id: string;
  name: string;
  email: string;
  cedula?: string;
}

interface AuthContextData {
  user: UserData | null;
  accessToken: string | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hook de expo-auth-session para manejar el PKCE Auth
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'chaskialerta',
    path: 'expo-auth-session'
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['openid', 'profile'],
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    loadStoredSession();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      exchangeCodeForToken(code);
    }
  }, [response]);

  const loadStoredSession = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        setAccessToken(token);
        extractUserFromToken(token);
      }
    } catch (error) {
      console.error("Error cargando sesión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exchangeCodeForToken = async (code: string) => {
    try {
      setIsLoading(true);
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: CLIENT_ID,
          code,
          redirectUri,
          extraParams: {
            code_verifier: request?.codeVerifier || '',
          },
        },
        discovery
      );

      const { accessToken, refreshToken } = tokenResult;
      if (accessToken) {
        await SecureStore.setItemAsync('accessToken', accessToken);
        if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);
        setAccessToken(accessToken);
        extractUserFromToken(accessToken);
      }
    } catch (error: any) {
      console.error("Error al intercambiar token:", error);
      import('react-native').then(({ Alert }) => {
        Alert.alert("Error de Autenticación", "Fallo al intercambiar el código por token: " + error.message);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractUserFromToken = (token: string) => {
    try {
      const decoded = jwtDecode<any>(token);
      setUser({
        id: decoded.sub,
        name: decoded.name || decoded.preferred_username,
        email: decoded.email,
        cedula: decoded.cedula
      });
    } catch (error) {
      console.error("Token inválido", error);
      logout();
    }
  };

  const login = async () => {
    await promptAsync();
  };

  const logout = async () => {
    try {
      // Deja de notificar este telefono antes de perder el token de sesion
      const tokenActual = await SecureStore.getItemAsync('accessToken');
      if (tokenActual) await darDeBajaDispositivo(tokenActual);
    } catch {
      // No debe impedir el cierre de sesion
    }

    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        await fetch(`${KEYCLOAK_URL}/protocol/openid-connect/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `client_id=${CLIENT_ID}&refresh_token=${refreshToken}`,
        });
      }
    } catch (error) {
      console.error("Error en backchannel logout:", error);
    } finally {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      setUser(null);
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
