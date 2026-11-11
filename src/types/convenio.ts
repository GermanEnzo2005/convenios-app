import { Tono } from '@/tema/colores';

export type EstadoConvenio = 'borrador' | 'revision' | 'aprobado' | 'firmado' | 'rescindido' | 'archivado';

export type TipoInstrumento =
    | 'marco_colaboracion'
    | 'especifico_colaboracion'
    | 'marco_pasantia'
    | 'especifico_pasantia'
    | 'adenda';

export type TipoDocumento = 'principal' | 'anexo' | 'dictamen' | 'resolucion' | 'otro';

// Parte = Representante + su Unidad_Responsable (según el DER)
export type Parte = {
    unidad: string;
    tipoUnidad: string;
    representante: string;
    email: string;
};

export type Documento = {
    id: number;
    nombre: string;
    tipo: TipoDocumento;
    url: string;
};

export type CambioEstado = {
    fecha: string; // 'YYYY-MM-DD'
    estadoAnterior: EstadoConvenio | null;
    estadoNuevo: EstadoConvenio;
    fundamento: string;
    usuario: string;
};

export type Convenio = {
    id: number;
    codigo: string;
    titulo: string;
    tipo: TipoInstrumento;
    estado: EstadoConvenio;
    unidad: string;
    objeto: string;
    alcance: string;
    fechaCreacion: string;
    fechaFirma: string | null;
    fechaVencimiento: string | null; // null = sin vencimiento registrado
    firmaGestor: string | null;
    firmaDecano: string | null;
    antecedente: { codigo: string; titulo: string } | null;
    partes: Parte[];
    documentos: Documento[];
    historial: CambioEstado[];
};

export const ETIQUETA_ESTADO: Record<EstadoConvenio, string> = {
    borrador: 'Borrador',
    revision: 'En revisión',
    aprobado: 'Aprobado',
    firmado: 'Firmado',
    rescindido: 'Rescindido',
    archivado: 'Archivado',
};

export const TONO_ESTADO: Record<EstadoConvenio, Tono> = {
    borrador: 'neutro',
    revision: 'advertencia',
    aprobado: 'info',
    firmado: 'exito',
    rescindido: 'peligro',
    archivado: 'neutro',
};

export const ETIQUETA_TIPO: Record<TipoInstrumento, string> = {
    marco_colaboracion: 'Marco de colaboración',
    especifico_colaboracion: 'Específico de colaboración',
    marco_pasantia: 'Marco de pasantía',
    especifico_pasantia: 'Específico de pasantía',
    adenda: 'Adenda',
};

export const ETIQUETA_TIPO_DOCUMENTO: Record<TipoDocumento, string> = {
    principal: 'Documento principal',
    anexo: 'Anexo',
    dictamen: 'Dictamen',
    resolucion: 'Resolución',
    otro: 'Otro',
};