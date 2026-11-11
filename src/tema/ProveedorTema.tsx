import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Paleta, paletas } from './colores';

type Modo = 'claro' | 'oscuro' | 'sistema';

type ContextoTema = {
    colores: Paleta;
    esOscuro: boolean;
    modo: Modo;
    cambiarModo: (m: Modo) => void;
};

const TemaContexto = createContext<ContextoTema | null>(null);

export function ProveedorTema({ children }: { children: ReactNode }) {
    const esquemaSistema = useColorScheme(); // 'light' | 'dark' | null (valores de React Native)
    const [modo, cambiarModo] = useState<Modo>('sistema');

    const valor = useMemo<ContextoTema>(() => {
        const esOscuro = modo === 'sistema' ? esquemaSistema === 'dark' : modo === 'oscuro';
        return { colores: esOscuro ? paletas.oscuro : paletas.claro, esOscuro, modo, cambiarModo };
    }, [modo, esquemaSistema]);

    return <TemaContexto.Provider value={valor}>{children}</TemaContexto.Provider>;
}

export function useTema() {
    const ctx = useContext(TemaContexto);
    if (!ctx) throw new Error('useTema debe usarse dentro de ProveedorTema');
    return ctx;
}