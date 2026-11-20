import { Usuario } from '@/types/usuario';
import { esErrorApi, llamarApi } from './api';

type UsuarioApi = {
    id?: number;
    name?: string | null;
    nombre?: string | null;
    email?: string | null;
    correo?: string | null;
    telefono?: string | null;
    rol?: string | null;
};

// Convierte los datos del usuario que manda la API al formato de la app.
export function usuarioDesdeApi(crudo: unknown, correoRespaldo: string): Usuario | null {
    if (!crudo || typeof crudo !== 'object') return null;
    const u = crudo as UsuarioApi;
    const correo = u.email ?? u.correo ?? correoRespaldo;
    return {
        id: typeof u.id === 'number' ? u.id : 0,
        nombre: u.name ?? u.nombre ?? correo,
        correo,
        telefono: u.telefono ?? null,
        rol: u.rol ?? 'sin dato',
    };
}

export async function obtenerUsuario(token: string, correo: string): Promise<Usuario> {
    const respaldo: Usuario = { id: 0, nombre: correo, correo, telefono: null, rol: 'sin dato' };
    try {
        const crudo = await llamarApi<UsuarioApi>('/me', { token });        return usuarioDesdeApi(crudo, correo) ?? respaldo;
    } catch (e) {
        if (esErrorApi(e) && (e.estado === 404 || e.estado === 405)) return respaldo;
        throw e;
    }
}

export async function cerrarSesionApi(token: string): Promise<void> {
    try {
        await llamarApi('/logout', { metodo: 'POST', token });
    } catch {
        // Si falla (por ejemplo, sin conexión), igual se cierra la sesión en el celular.
    }
}