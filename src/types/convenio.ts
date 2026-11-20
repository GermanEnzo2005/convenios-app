import { Tono } from '@/tema/colores';

export type Documento = {
    id: number;
    archivo: string; 
    convenioId: number;
    creadoEn: string | null; // 'YYYY-MM-DD'
};

export type Convenio = {
    id: number;
    codigo: string;
    titulo: string;
    estado: string; // borrador, revision, aprobado, firmado, rescindido, archivado
    tipoId: number | null;
    tipoNombre: string;
    unidadNombre: string | null; // unidad responsable
    revisorNombre: string | null; // revisor asignado
    fechaCreacion: string | null; // 'YYYY-MM-DD'
    fechaVencimiento: string | null; // null = sin vencimiento registrado
    firmadoPorDecano: boolean; // la API solo registra si se firmó
    convenioPadreId: number | null;
    actualizadoEn: string | null;
    documentos: Documento[]; 
    adendas: Convenio[]; // convenios hijos; vienen en el detalle
};

export type Parte = {
    id: number;
    unidad: string;
    tipoUnidad: string;
    representante: string;
    cargo: string;
    email: string;
    telefono: string | null;
};

export type CambioEstado = {
    id: number;
    fecha: string; // 'YYYY-MM-DD'
    estadoAnterior: string | null;
    estadoNuevo: string;
    fundamento: string;
    usuario: string;
};

const ETIQUETA_ESTADO: Record<string, string> = {
    borrador: 'Borrador',
    revision: 'En revisión',
    aprobado: 'Aprobado',
    firmado: 'Firmado',
    rescindido: 'Rescindido',
    archivado: 'Archivado',
};

const TONO_ESTADO: Record<string, Tono> = {
    borrador: 'neutro',
    revision: 'advertencia',
    aprobado: 'info',
    firmado: 'exito',
    rescindido: 'peligro',
    archivado: 'neutro',
};

export function etiquetaEstado(estado: string): string {
    return ETIQUETA_ESTADO[estado] ?? estado;
}

export function tonoEstado(estado: string): Tono {
    return TONO_ESTADO[estado] ?? 'neutro';
}