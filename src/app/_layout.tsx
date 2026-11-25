import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/services/segundoPlano.service'; // define la tarea de segundo plano (debe cargarse al inicio)
import { ManejadorAvisos } from '@/componentes/compartidos/ManejadorAvisos';
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
              <ManejadorAvisos />
              <Stack screenOptions={{ headerShown: false }} />
            </ProveedorNotificaciones>
          </ProveedorPerfil>
        </ProveedorSesion>
      </ProveedorTema>
    </SafeAreaProvider>
  );
}