import { cerrarSesionApi, obtenerUsuario, usuarioDesdeApi } from '@/services/auth.service';
import { limpiarCacheOffline } from '@/services/cacheOffline.service';
import { Usuario } from '@/types/usuario';
import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const CLAVE_TOKEN = 'sesion_token';
const CLAVE_USUARIO = 'sesion_usuario';

type Sesion = {
    token: string | null;
    usuario: Usuario | null;
    cargando: boolean;
    completarSesion: (token: string, correo: string, datosUsuario?: unknown) => Promise<void>;
    cerrarSesion: () => Promise<void>;
};

const ContextoSesion = createContext<Sesion | null>(null);

async function borrarSesionGuardada() {
    await SecureStore.deleteItemAsync(CLAVE_TOKEN).catch(() => {});
    await SecureStore.deleteItemAsync(CLAVE_USUARIO).catch(() => {});
    await limpiarCacheOffline();
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        (async () => {
        try {
            const [t, u] = await Promise.all([
            SecureStore.getItemAsync(CLAVE_TOKEN),
            SecureStore.getItemAsync(CLAVE_USUARIO),
            ]);
            if (t && u) {
            setToken(t);
            setUsuario(JSON.parse(u) as Usuario);
            } else if (t || u) {
            await borrarSesionGuardada();
            }
        } catch {
            await borrarSesionGuardada();
        } finally {
            setCargando(false);
        }
        })();
    }, []);

    // Se usa después de verificar el código: recién ahí se guarda el token y se entra a la app.
    const completarSesion = async (nuevoToken: string, correo: string, datosUsuario?: unknown) => {
        // Se usan los datos que mandó el login; si no vinieron, se piden a la API.
        const datos = usuarioDesdeApi(datosUsuario, correo) ?? (await obtenerUsuario(nuevoToken, correo));
        await SecureStore.setItemAsync(CLAVE_TOKEN, nuevoToken);
        await SecureStore.setItemAsync(CLAVE_USUARIO, JSON.stringify(datos));
        setToken(nuevoToken);
        setUsuario(datos);
    };

    const cerrarSesion = async () => {
        if (token) await cerrarSesionApi(token);
        await borrarSesionGuardada();
        setToken(null);
        setUsuario(null);
    };

    return (
        <ContextoSesion.Provider value={{ token, usuario, cargando, completarSesion, cerrarSesion }}>
        {children}
        </ContextoSesion.Provider>
    );
}

export function useSesion() {
    const ctx = useContext(ContextoSesion);
    if (!ctx) throw new Error('useSesion debe usarse dentro de ProveedorSesion');
    return ctx;
}