import { CambioEstado, Convenio, Documento, Parte } from '@/types/convenio';
import { llamarApi } from './api';

type FirmaApi = string | boolean | number | null | undefined;

type DocumentoApi = {
    id: number;
    archivo: string;
    convenio_id: number;
    created_at?: string | null;
};

type ConvenioApi = {
    id: number;
    fecha_creacion: string | null;
    firma_gestor: FirmaApi;
    firma_decano: FirmaApi;
    titulo: string;
    estado: string;
    codigo: string;
    convenio_padre_id: number | null;
    tipo_instrumento_id: number | null;
    updated_at?: string | null;
    tipo_instrumento?: { nombre?: string | null; categoria?: string | null } | null;
    documentos?: DocumentoApi[] | null;
    adendas?: ConvenioApi[] | null;
};

type ParteApi = {
    id: number;
    representante?: {
        nombre?: string | null;
        email?: string | null;
        telefono?: string | null;
        unidad_responsable?: { nombre?: string | null; tipo?: string | null } | null;
    } | null;
};

type CambioApi = {
    id: number;
    fundamento?: string | null;
    fecha_cambio?: string | null;
    estado_anterior?: string | null;
    estado_nuevo: string;
    usuario?: { name?: string | null } | null;
};

type Pagina<T> = { data: T[]; next_page_url: string | null; total?: number };

// Coincide con la tabla tipo_instrumento. Solo se usa si la API no manda el tipo incluido.
const TIPO_POR_ID: Record<number, string> = {
    1: 'Convenio marco · Colaboración',
    2: 'Convenio específico · Colaboración',
    3: 'Convenio marco · Pasantía',
    4: 'Convenio específico · Pasantía',
    5: 'Adenda',
};

// La API ahora guarda las firmas como booleano (true/false).
// Si volviera a ser texto, poner esto en true.
const FIRMA_DECANO_COMO_TEXTO = false;

function textoDeFirma(v: FirmaApi): string | null {
    return typeof v === 'string' && v.trim() !== '' && v !== '0' ? v : null;
}

function hayFirma(v: FirmaApi): boolean {
    return v === true || v === 1 || (typeof v === 'string' && v.trim() !== '' && v !== '0');
}

function nombreDeTipo(tipo: ConvenioApi['tipo_instrumento'], id: number | null): string {
    if (tipo?.nombre) {
        return tipo.categoria && tipo.categoria !== tipo.nombre ? `${tipo.nombre} · ${tipo.categoria}` : tipo.nombre;
    }
    return (id != null ? TIPO_POR_ID[id] : undefined) ?? 'Tipo no especificado';
}

function aDocumento(d: DocumentoApi): Documento {
    return {
        id: d.id,
        archivo: d.archivo,
        convenioId: d.convenio_id,
        creadoEn: d.created_at ? d.created_at.slice(0, 10) : null,
    };
}

function aConvenio(r: ConvenioApi): Convenio {
    return {
        id: r.id,
        codigo: r.codigo,
        titulo: r.titulo,
        estado: r.estado,
        tipoId: r.tipo_instrumento_id ?? null,
        tipoNombre: nombreDeTipo(r.tipo_instrumento, r.tipo_instrumento_id ?? null),
        fechaCreacion: r.fecha_creacion ? r.fecha_creacion.slice(0, 10) : null,
        firmadoPorGestor: hayFirma(r.firma_gestor),
        firmaGestor: textoDeFirma(r.firma_gestor),
        firmadoPorDecano: hayFirma(r.firma_decano),
        firmaDecano: textoDeFirma(r.firma_decano),
        convenioPadreId: r.convenio_padre_id ?? null,
        actualizadoEn: r.updated_at ?? null,
        documentos: (r.documentos ?? []).map(aDocumento),
        adendas: (r.adendas ?? []).map(aConvenio),
    };
}

function aParte(p: ParteApi): Parte {
    const r = p.representante;
    return {
        id: p.id,
        unidad: r?.unidad_responsable?.nombre ?? 'Sin unidad',
        tipoUnidad: r?.unidad_responsable?.tipo ?? '',
        representante: r?.nombre ?? 'Sin representante',
        email: r?.email ?? '',
        telefono: r?.telefono ?? null,
    };
}

function aCambio(c: CambioApi): CambioEstado {
    return {
        id: c.id,
        fecha: (c.fecha_cambio ?? '').slice(0, 10),
        estadoAnterior: c.estado_anterior ?? null,
        estadoNuevo: c.estado_nuevo,
        fundamento: c.fundamento ?? '',
        usuario: c.usuario?.name ?? 'Sistema',
    };
}

// Pide todas las páginas de una lista (la API pagina). Si la respuesta no está paginada, la devuelve tal cual.
async function pedirLista<T>(token: string | null, ruta: string, maxPaginas = 20): Promise<T[]> {
    const todos: T[] = [];
    for (let pagina = 1; pagina <= maxPaginas; pagina++) {
        const separador = ruta.includes('?') ? '&' : '?';
        const respuesta = await llamarApi<Pagina<T> | T[]>(`${ruta}${separador}page=${pagina}`, { token });
        if (Array.isArray(respuesta)) return respuesta;
        todos.push(...respuesta.data);
        if (!respuesta.next_page_url) break;
    }
    return todos;
}

export async function obtenerConvenios(token: string | null): Promise<Convenio[]> {
    return (await pedirLista<ConvenioApi>(token, '/convenios?por_pagina=50')).map(aConvenio);
}

// El detalle trae el convenio con sus documentos incluidos.
export async function obtenerConvenio(token: string | null, id: number): Promise<Convenio> {
    const respuesta = await llamarApi<ConvenioApi | { data: ConvenioApi }>(`/convenios/${id}`, { token });
    const crudo = 'data' in respuesta ? respuesta.data : respuesta;
    return aConvenio(crudo);
}

export async function obtenerPartes(token: string | null, id: number): Promise<Parte[]> {
    return (await pedirLista<ParteApi>(token, `/convenios/${id}/partes`)).map(aParte);
}

export async function obtenerHistorial(token: string | null, id: number): Promise<CambioEstado[]> {
    return (await pedirLista<CambioApi>(token, `/convenios/${id}/historial`, 5)).map(aCambio);
}

// Firmar = actualizar el convenio con estado "firmado" y la firma del decano.
// La API exige el fundamento al cambiar de estado y valida que la transición sea válida.
export async function firmarConvenio(token: string | null, id: number, nombreDecano: string): Promise<void> {
    await llamarApi(`/convenios/${id}`, {
        metodo: 'PATCH',
        token,
        cuerpo: {
        estado: 'firmado',
        firma_decano: FIRMA_DECANO_COMO_TEXTO ? nombreDecano : true,
        fundamento: 'Firma del decano',
        },
    });
}

// Los más antiguos primero: son los que llevan más tiempo esperando la firma.
export function pendientesDeFirma(convenios: Convenio[]): Convenio[] {
    return convenios
        .filter((c) => c.estado === 'aprobado')
        .sort((a, b) => (a.fechaCreacion ?? '').localeCompare(b.fechaCreacion ?? ''));
}

export function ultimosFirmados(convenios: Convenio[], cantidad = 3): Convenio[] {
    return convenios
        .filter((c) => c.estado === 'firmado')
        .sort((a, b) => (b.actualizadoEn ?? '').localeCompare(a.actualizadoEn ?? ''))
        .slice(0, cantidad);
}

// Regla PROVISORIA: por ahora solo se firman los aprobados. La definitiva la valida el servidor.
export function evaluarFirma(c: Convenio): { puede: boolean; motivo?: string } {
    if (c.estado === 'firmado') return { puede: false, motivo: 'Este convenio ya fue firmado.' };
    if (c.estado !== 'aprobado') return { puede: false, motivo: 'Solo se pueden firmar convenios aprobados.' };
    return { puede: true };
}

// ---------- Búsqueda ----------

export type FiltrosBusqueda = {
    q: string;
    estado: string | null;
    tipoId: number | null;
    anio: number | null; // se aplica sobre la fecha de creación
    orden: 'fecha_creacion' | 'titulo' | 'estado' | 'codigo';
    direccion: 'asc' | 'desc';
};

export const FILTROS_INICIALES: FiltrosBusqueda = {
    q: '',
    estado: null,
    tipoId: null,
    anio: null,
    orden: 'fecha_creacion',
    direccion: 'desc',
};

export const ESTADOS_FILTRO = ['borrador', 'revision', 'aprobado', 'firmado', 'rescindido', 'archivado'];

export const TIPOS_INSTRUMENTO = Object.entries(TIPO_POR_ID).map(([id, nombre]) => ({ id: Number(id), nombre }));

export type ResultadoBusqueda = { convenios: Convenio[]; total: number; hayMas: boolean };

// Una página de resultados (la API pagina). Los filtros van siempre en la URL.
export async function buscarConvenios(
    token: string | null,
    filtros: FiltrosBusqueda,
    pagina = 1,
    porPagina = 10,
    ): Promise<ResultadoBusqueda> {
    const partes: string[] = [];
    if (filtros.q.trim()) partes.push(`q=${encodeURIComponent(filtros.q.trim())}`);
    if (filtros.estado) partes.push(`estado=${encodeURIComponent(filtros.estado)}`);
    if (filtros.tipoId) partes.push(`tipo_instrumento_id=${filtros.tipoId}`);
    if (filtros.anio) {
        partes.push(`fecha_desde=${filtros.anio}-01-01`);
        partes.push(`fecha_hasta=${filtros.anio}-12-31`);
    }
    partes.push(`orden=${filtros.orden}`, `direccion=${filtros.direccion}`, `por_pagina=${porPagina}`, `page=${pagina}`);

    const respuesta = await llamarApi<Pagina<ConvenioApi> | ConvenioApi[]>(`/convenios?${partes.join('&')}`, { token });
    if (Array.isArray(respuesta)) {
        return { convenios: respuesta.map(aConvenio), total: respuesta.length, hayMas: false };
    }
    return {
        convenios: respuesta.data.map(aConvenio),
        total: respuesta.total ?? respuesta.data.length,
        hayMas: !!respuesta.next_page_url,
    };
}