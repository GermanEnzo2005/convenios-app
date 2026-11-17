import { Tono } from '@/tema/colores';

export type Documento = {
    id: number;
    archivo: string; // nombre interno que genera el servidor: no es legible para el usuario
    convenioId: number;
    creadoEn: string | null; // 'YYYY-MM-DD'
    
};



export type Convenio = {
    id: number;
    codigo: string;
    titulo: string;
    estado: string; // borrador, revision, aprobado, firmado...
    tipoId: number | null;
    tipoNombre: string;
    fechaCreacion: string | null; // 'YYYY-MM-DD'
    firmadoPorGestor: boolean;
    firmaGestor: string | null; // nombre, si la API lo manda como texto
    firmadoPorDecano: boolean;
    firmaDecano: string | null; // nombre, si la API lo manda como texto
    convenioPadreId: number | null;
    actualizadoEn: string | null;
    documentos: Documento[]; // viene en el detalle; en el listado queda vacío
    adendas: Convenio[]; // convenios hijos (adendas); vienen en el detalle
};

export type Parte = {
    id: number;
    unidad: string;
    tipoUnidad: string;
    representante: string;
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