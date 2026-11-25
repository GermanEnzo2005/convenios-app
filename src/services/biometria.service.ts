import * as LocalAuthentication from 'expo-local-authentication';

export type ResultadoBiometria = { ok: true } | { ok: false; motivo: string };

export async function autenticarConHuella(mensaje: string): Promise<ResultadoBiometria> {
  const hayHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hayHardware) return { ok: false, motivo: 'Este dispositivo no tiene sensor biométrico.' };

  const hayHuellaRegistrada = await LocalAuthentication.isEnrolledAsync();
  if (!hayHuellaRegistrada) {
    return { ok: false, motivo: 'No hay huellas registradas en el dispositivo. Configurala en Ajustes.' };
  }

  const r = await LocalAuthentication.authenticateAsync({
    promptMessage: mensaje,
    cancelLabel: 'Cancelar',
    disableDeviceFallback: true, // evita que acepte PIN/patrón: solo biometría
  });

  if (r.success) return { ok: true };
  return { ok: false, motivo: r.error === 'user_cancel' ? 'Cancelaste la autenticación.' : 'No se pudo verificar tu huella.' };
}