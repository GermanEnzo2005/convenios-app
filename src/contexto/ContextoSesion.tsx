import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { cerrarSesionApi, login } from '@/services/auth.service';
import { Usuario } from '@/types/usuario';

const CLAVE_TOKEN = 'sesion_token';
const CLAVE_USUARIO = 'sesion_usuario';

type Sesion = {
    token: string | null;
    usuario: Usuario | null;
    cargando: boolean;
    iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
    cerrarSesion: () => Promise<void>;
};

const ContextoSesion = createContext<Sesion | null>(null);

async function borrarSesionGuardada() {
    await SecureStore.deleteItemAsync(CLAVE_TOKEN).catch(() => {});
    await SecureStore.deleteItemAsync(CLAVE_USUARIO).catch(() => {});
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

    const iniciarSesion = async (correo: string, contrasena: string) => {
        const respuesta = await login(correo, contrasena);
        await SecureStore.setItemAsync(CLAVE_TOKEN, respuesta.token);
        await SecureStore.setItemAsync(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
        setToken(respuesta.token);
        setUsuario(respuesta.usuario);
    };

    const cerrarSesion = async () => {
        if (token) await cerrarSesionApi(token);
        await borrarSesionGuardada();
        setToken(null);
        setUsuario(null);
    };

    return (
        <ContextoSesion.Provider value={{ token, usuario, cargando, iniciarSesion, cerrarSesion }}>
        {children}
        </ContextoSesion.Provider>
    );
}

export function useSesion() {
    const ctx = useContext(ContextoSesion);
    if (!ctx) throw new Error('useSesion debe usarse dentro de ProveedorSesion');
    return ctx;
}