import { CambioEstado, Convenio, Documento, Parte } from '@/types/convenio';
import { esErrorApi, llamarApi } from './api';

type FirmaApi = string | boolean | number | null | undefined;

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

type Pagina<T> = { data: T[]; next_page_url: string | null };

// Coincide con la tabla tipo_instrumento. Solo se usa si la API no manda el tipo incluido.
const TIPO_POR_ID: Record<number, string> = {
    1: 'Convenio marco · Colaboración',
    2: 'Convenio específico · Colaboración',
    3: 'Convenio marco · Pasantía',
    4: 'Convenio específico · Pasantía',
    5: 'Adenda',
};

// Hoy la API guarda firma_decano como texto. Cuando pase a booleano, poner esto en false.
const FIRMA_DECANO_COMO_TEXTO = true;

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
    return (await pedirLista<ConvenioApi>(token, '/convenios')).map(aConvenio);
}

export async function obtenerConvenio(token: string | null, id: number): Promise<Convenio> {
    try {
        const respuesta = await llamarApi<ConvenioApi | { data: ConvenioApi }>(`/convenios/${id}`, { token });
        const crudo = 'data' in respuesta ? respuesta.data : respuesta;
        return aConvenio(crudo);
    } catch (e) {
        // PROVISORIO: si GET /convenios/{id} falla en el servidor (500), se toma el convenio de la lista.
        // Quitar este bloque cuando la API lo tenga arreglado.
        if (esErrorApi(e) && e.estado >= 500) {
        const todos = await obtenerConvenios(token);
        const encontrado = todos.find((c) => c.id === id);
        if (encontrado) return encontrado;
        }
        throw e;
    }
}

export async function obtenerPartes(token: string | null, id: number): Promise<Parte[]> {
    return (await pedirLista<ParteApi>(token, `/convenios/${id}/partes`)).map(aParte);
}

export async function obtenerHistorial(token: string | null, id: number): Promise<CambioEstado[]> {
    return (await pedirLista<CambioApi>(token, `/convenios/${id}/historial`, 5)).map(aCambio);
}

// Firmar = actualizar el convenio con estado "firmado" y la firma del decano.
// Ideal a futuro: que el servidor decida quién firma según el token y registre el cambio en el historial.
export async function firmarConvenio(token: string | null, id: number, nombreDecano: string): Promise<void> {
    await llamarApi(`/convenios/${id}`, {
        metodo: 'PATCH',
        token,
        cuerpo: {
        estado: 'firmado',
        firma_decano: FIRMA_DECANO_COMO_TEXTO ? nombreDecano : true,
        fundamento: 'Firma del decano', // la API lo exige al cambiar el estado
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

// Pendiente: se conecta con /documentos y /documentos/{id}/download en el próximo paso.
export async function obtenerDocumento(_id: number): Promise<Documento & { codigoConvenio: string }> {
    throw new Error('Los documentos se conectarán con la API en el próximo paso.');
}