import { Usuario } from '@/types/usuario';
import { esErrorApi, llamarApi } from './api';

export type LoginResult = { token: string; usuario: Usuario };

type UsuarioApi = { id: number; name: string; email: string; telefono?: string | null; rol?: string | null };

async function obtenerUsuario(token: string, correo: string): Promise<Usuario> {
    try {
        const u = await llamarApi<UsuarioApi>('/user', { token });
        return { id: u.id, nombre: u.name, correo: u.email, telefono: u.telefono ?? null, rol: u.rol ?? 'sin rol' };
    } catch (e) {
        // Si la API todavía no tiene la ruta /user, se sigue con datos mínimos.
        if (esErrorApi(e) && (e.estado === 404 || e.estado === 405)) {
        return { id: 0, nombre: correo, correo, telefono: null, rol: 'sin dato' };
        }
        throw e;
    }
}

export async function login(correo: string, password: string): Promise<LoginResult> {
    let token = '';
    try {
        const respuesta = await llamarApi<{ token: string }>('/login', {
        metodo: 'POST',
        cuerpo: { email: correo, password },
        });
        token = respuesta.token;
    } catch (e) {
        if (esErrorApi(e) && (e.estado === 401 || e.estado === 422)) {
        throw new Error('Correo o contraseña incorrectos.');
        }
        throw e;
    }
    if (!token) throw new Error('La API no devolvió un token.');
    return { token, usuario: await obtenerUsuario(token, correo) };
}

export async function cerrarSesionApi(token: string): Promise<void> {
    try {
        await llamarApi('/logout', { metodo: 'POST', token });
    } catch {
        // Si falla (por ejemplo, sin conexión), igual se cierra la sesión en el celular.
    }
}