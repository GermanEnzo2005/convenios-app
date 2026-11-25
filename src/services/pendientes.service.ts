import { Convenio } from '@/types/convenio';
import { esErrorApi } from './api';
import { guardarPendientes, leerPendientes } from './cacheOffline.service';
import { obtenerConvenios, pendientesDeFirma } from './convenios.service';

export type ResultadoInicio = {
    todos: Convenio[] | null; // null cuando no hay conexión
    pendientes: Convenio[];
    sinConexion: boolean;
    guardadoEn: string | null; // cuándo se guardó la copia que se está mostrando
};

export async function cargarConvenios(token: string | null, usuarioId: number): Promise<ResultadoInicio> {
    try {
        const todos = await obtenerConvenios(token);
        const pendientes = pendientesDeFirma(todos);
        await guardarPendientes(usuarioId, pendientes);
        return { todos, pendientes, sinConexion: false, guardadoEn: null };
    } catch (e) {
        // estado 0 = no hubo respuesta (sin red, servidor caído o timeout)
        if (!esErrorApi(e) || e.estado !== 0) throw e;
        const copia = await leerPendientes(usuarioId);
        return { todos: null, pendientes: copia?.convenios ?? [], sinConexion: true, guardadoEn: copia?.guardadoEn ?? null };
    }
}

export async function pendienteGuardado(usuarioId: number, convenioId: number): Promise<Convenio | null> {
    const copia = await leerPendientes(usuarioId);
    return copia?.convenios.find((c) => c.id === convenioId) ?? null;
}