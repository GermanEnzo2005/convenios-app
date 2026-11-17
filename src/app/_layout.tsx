import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProveedorNotificaciones } from '@/contexto/ContextoNotificaciones';
import { ProveedorPerfil } from '@/contexto/ContextoPerfil';
import { ProveedorSesion } from '@/contexto/ContextoSesion';
import { ProveedorTema } from '@/tema/ProveedorTema';

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <ProveedorTema>
        <ProveedorSesion>
          <ProveedorPerfil>
            <ProveedorNotificaciones>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false }} />
            </ProveedorNotificaciones>
          </ProveedorPerfil>
        </ProveedorSesion>
      </ProveedorTema>
    </SafeAreaProvider>
  );
}