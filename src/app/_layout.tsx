import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProveedorSesion } from '@/contexto/ContextoSesion';
import { ProveedorTema } from '@/tema/ProveedorTema';

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <ProveedorTema>
        <ProveedorSesion>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </ProveedorSesion>
      </ProveedorTema>
    </SafeAreaProvider>
  );
}