import { llamarApi } from './api';

// Dirección del servicio de verificación (carpeta verificacion-app). Se configura en .env.local.
const URL_VERIFICACION = process.env.EXPO_PUBLIC_VERIFICACION_URL ?? 'http://10.0.2.2:3001';

export type Desafio = {
  requiereCodigo: boolean;
  desafioId: string;
  correo: string; // correo enmascarado, por ejemplo de***@test.com
  venceEnSegundos: number;
};

// Paso 1: el servicio valida correo y contraseña contra la API y envía el código por correo.
export function iniciarVerificacion(email: string, password: string): Promise<Desafio> {
  return llamarApi<Desafio>('/auth/login', { metodo: 'POST', cuerpo: { email, password }, base: URL_VERIFICACION });
}

// Paso 2: si el código es correcto, el servicio entrega el token y los datos del usuario.
export function verificarCodigo(desafioId: string, codigo: string): Promise<{ token: string; usuario?: unknown }> {
  return llamarApi<{ token: string; usuario?: unknown }>('/auth/verificar', {
    metodo: 'POST',
    cuerpo: { desafioId, codigo },
    base: URL_VERIFICACION,
  });
}

export function reenviarCodigo(desafioId: string): Promise<{ ok: boolean; venceEnSegundos: number }> {
  return llamarApi<{ ok: boolean; venceEnSegundos: number }>('/auth/reenviar', {
    metodo: 'POST',
    cuerpo: { desafioId },
    base: URL_VERIFICACION,
  });
}