import { Tono } from '@/tema/colores';

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

export type TipoDocumento = 'principal' | 'anexo' | 'dictamen' | 'resolucion' | 'otro';

export type Documento = {
    id: number;
    nombre: string;
    tipo: TipoDocumento;
    url: string;
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

    export const ETIQUETA_TIPO_DOCUMENTO: Record<TipoDocumento, string> = {
    principal: 'Documento principal',
    anexo: 'Anexo',
    dictamen: 'Dictamen',
    resolucion: 'Resolución',
    otro: 'Otro',
};