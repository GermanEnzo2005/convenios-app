import { Notificacion } from '@/types/notificacion';
import { llamarApi } from './api';

type NotificacionApi = {
    id: number;
    tipo: string;
    titulo: string;
    mensaje: string;
    convenio_id: number | null;
    leida_en: string | null;
    created_at: string;
};

type RespuestaApi = { data: NotificacionApi[]; no_leidas?: number };

function aNotificacion(n: NotificacionApi): Notificacion {
    return {
        id: n.id,
        tipo: n.tipo,
        titulo: n.titulo,
        mensaje: n.mensaje,
        convenioId: n.convenio_id ?? null,
        leida: n.leida_en !== null,
        creadaEn: n.created_at,
    };
}

export async function obtenerNotificaciones(token: string | null): Promise<{ notificaciones: Notificacion[]; noLeidas: number }> {
    const respuesta = await llamarApi<RespuestaApi>('/notificaciones?por_pagina=30', { token });
    const notificaciones = respuesta.data.map(aNotificacion);
    return {
        notificaciones,
        noLeidas: respuesta.no_leidas ?? notificaciones.filter((n) => !n.leida).length,
    };
}

export async function marcarLeida(token: string | null, id: number): Promise<void> {
    await llamarApi(`/notificaciones/${id}/leida`, { metodo: 'POST', token });
}

export async function marcarTodasLeidas(token: string | null): Promise<void> {
    await llamarApi('/notificaciones/leidas', { metodo: 'POST', token });
}