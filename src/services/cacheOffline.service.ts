import { Convenio } from '@/types/convenio';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIJO = 'cache:';
const clavePendientes = (usuarioId: number) => `${PREFIJO}pendientes:${usuarioId}`;

export type CachePendientes = { guardadoEn: string; convenios: Convenio[] };

export async function guardarPendientes(usuarioId: number, convenios: Convenio[]): Promise<void> {
    try {
        const dato: CachePendientes = { guardadoEn: new Date().toISOString(), convenios };
        await AsyncStorage.setItem(clavePendientes(usuarioId), JSON.stringify(dato));
    } catch {
        // el caché es opcional: si falla, la app sigue funcionando
    }
}

export async function leerPendientes(usuarioId: number): Promise<CachePendientes | null> {
    try {
        const crudo = await AsyncStorage.getItem(clavePendientes(usuarioId));
        return crudo ? (JSON.parse(crudo) as CachePendientes) : null;
    } catch {
        return null;
    }
}

//Se llama al cerrar sesión para no dejar datos en el celular.
export async function limpiarCacheOffline(): Promise<void> {
    try {
        const claves = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(claves.filter((k) => k.startsWith(PREFIJO)));
    } catch {
        // nada que hacer
    }
}