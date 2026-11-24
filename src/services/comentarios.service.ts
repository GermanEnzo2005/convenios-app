import { llamarApi } from './api';

export type Comentario = {
    id: number;
    texto: string;
    ofensivo: boolean;
    autor: string;
    rol: string;
    fecha: string; // ISO, UTC
    esMio: boolean;
};

type ComentarioApi = {
    id: number;
    texto: string;
    ofensivo: boolean | number;
    created_at: string;
    es_mio: boolean;
    usuario?: { name?: string | null; rol?: string | null } | null;
};

function aComentario(c: ComentarioApi): Comentario {
    return {
        id: c.id,
        texto: c.texto,
        ofensivo: c.ofensivo === true || c.ofensivo === 1,
        autor: c.usuario?.name ?? 'Usuario',
        rol: c.usuario?.rol ?? '',
        fecha: c.created_at,
        esMio: c.es_mio,
    };
}

export async function obtenerComentarios(token: string | null, convenioId: number): Promise<Comentario[]> {
    const r = await llamarApi<ComentarioApi[]>(`/convenios/${convenioId}/comentarios`, { token });
    return r.map(aComentario);
}

export async function crearComentario(token: string | null, convenioId: number, texto: string): Promise<Comentario> {
    const r = await llamarApi<ComentarioApi>(`/convenios/${convenioId}/comentarios`, {
        metodo: 'POST',
        token,
        cuerpo: { texto },
    });
    return aComentario(r);
}