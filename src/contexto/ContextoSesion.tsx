import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login } from '@/services/auth.service';

const CLAVE_TOKEN = 'auth_token';

type Sesion = {
    token: string | null;
    cargando: boolean;
    iniciarSesion: (usuario: string, contrasena: string) => Promise<void>;
    cerrarSesion: () => Promise<void>;
};

const ContextoSesion = createContext<Sesion | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        SecureStore.getItemAsync(CLAVE_TOKEN)
        .then(setToken)
        .finally(() => setCargando(false));
    }, []);

    const iniciarSesion = async (usuario: string, contrasena: string) => {
        const respuesta = await login(usuario, contrasena);
        await SecureStore.setItemAsync(CLAVE_TOKEN, respuesta.token);
        setToken(respuesta.token);
    };

    const cerrarSesion = async () => {
        await SecureStore.deleteItemAsync(CLAVE_TOKEN);
        setToken(null);
    };

    return <ContextoSesion.Provider value={{ token, cargando, iniciarSesion, cerrarSesion }}>{children}</ContextoSesion.Provider>;
}

export function useSesion() {
    const ctx = useContext(ContextoSesion);
    if (!ctx) throw new Error('useSesion debe usarse dentro de ProveedorSesion');
    return ctx;
}