import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Paleta, paletas } from './colores';

export type Modo = 'claro' | 'oscuro' | 'sistema';
export type TamanoFuente = 'chica' | 'mediana' | 'grande';

const ESCALAS: Record<TamanoFuente, number> = { chica: 0.9, mediana: 1, grande: 1.2 };

const CLAVE_MODO = 'pref_modo';
const CLAVE_TAMANO = 'pref_tamano_fuente';

type ContextoTema = {
    colores: Paleta;
    esOscuro: boolean;
    modo: Modo;
    cambiarModo: (m: Modo) => void;
    tamanoFuente: TamanoFuente;
    escala: number;
    cambiarTamanoFuente: (t: TamanoFuente) => void;
};

const TemaContexto = createContext<ContextoTema | null>(null);

export function ProveedorTema({ children }: { children: ReactNode }) {
    const esquemaSistema = useColorScheme(); // 'light' | 'dark' | null (valores de React Native)
    const [modo, setModo] = useState<Modo>('sistema');
    const [tamanoFuente, setTamanoFuente] = useState<TamanoFuente>('mediana');
    const [listo, setListo] = useState(false);

    // Se leen las preferencias guardadas antes de mostrar la app, para que no parpadee.
    useEffect(() => {
        (async () => {
        try {
            const [m, t] = await Promise.all([AsyncStorage.getItem(CLAVE_MODO), AsyncStorage.getItem(CLAVE_TAMANO)]);
            if (m === 'claro' || m === 'oscuro' || m === 'sistema') setModo(m);
            if (t === 'chica' || t === 'mediana' || t === 'grande') setTamanoFuente(t);
        } catch {
            // si no se pueden leer, se usan los valores por defecto
        } finally {
            setListo(true);
        }
        })();
    }, []);

    const cambiarModo = useCallback((m: Modo) => {
        setModo(m);
        AsyncStorage.setItem(CLAVE_MODO, m).catch(() => {});
    }, []);

    const cambiarTamanoFuente = useCallback((t: TamanoFuente) => {
        setTamanoFuente(t);
        AsyncStorage.setItem(CLAVE_TAMANO, t).catch(() => {});
    }, []);

    const valor = useMemo<ContextoTema>(() => {
        const esOscuro = modo === 'sistema' ? esquemaSistema === 'dark' : modo === 'oscuro';
        return {
        colores: esOscuro ? paletas.oscuro : paletas.claro,
        esOscuro,
        modo,
        cambiarModo,
        tamanoFuente,
        escala: ESCALAS[tamanoFuente],
        cambiarTamanoFuente,
        };
    }, [modo, esquemaSistema, tamanoFuente, cambiarModo, cambiarTamanoFuente]);

    if (!listo) return null;

    return <TemaContexto.Provider value={valor}>{children}</TemaContexto.Provider>;
}

export function useTema() {
    const ctx = useContext(TemaContexto);
    if (!ctx) throw new Error('useTema debe usarse dentro de ProveedorTema');
    return ctx;
}