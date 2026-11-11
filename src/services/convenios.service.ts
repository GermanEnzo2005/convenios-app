import { Convenio, EstadoConvenio } from '@/types/convenio';
import { fechaEnDias } from '@/utils/fechas';
import { CONVENIOS_PRUEBA } from './mock/convenios';

// Cuando esté la API: poner USAR_DATOS_PRUEBA en false e implementar las llamadas reales.
const USAR_DATOS_PRUEBA = true;

// Copia en memoria: así firmar cambia los datos mientras la app está abierta.
const convenios: Convenio[] = JSON.parse(JSON.stringify(CONVENIOS_PRUEBA));

const esperar = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function sinApi(): never {
    throw new Error('La API todavía no está conectada.');
}

const copiar = (c: Convenio): Convenio => ({ ...c, historial: [...c.historial] });

function buscar(id: number): Convenio {
    const c = convenios.find((x) => x.id === id);
    if (!c) throw new Error('No se encontró el convenio.');
    return c;
}

export async function obtenerConvenios(filtro: { estado?: EstadoConvenio } = {}): Promise<Convenio[]> {
    if (!USAR_DATOS_PRUEBA) return sinApi();
    await esperar();
    return convenios.filter((c) => !filtro.estado || c.estado === filtro.estado).map(copiar);
}

export async function obtenerUltimosFirmados(cantidad = 3): Promise<Convenio[]> {
    if (!USAR_DATOS_PRUEBA) return sinApi();
    await esperar();
    return convenios
        .filter((c) => c.estado === 'firmado' && c.fechaFirma)
        .sort((a, b) => (b.fechaFirma as string).localeCompare(a.fechaFirma as string))
        .slice(0, cantidad)
        .map(copiar);
}

export async function obtenerConvenio(id: number): Promise<Convenio> {
    if (!USAR_DATOS_PRUEBA) return sinApi();
    await esperar(400);
    return copiar(buscar(id));
}

// Regla PROVISORIA: por ahora solo se firman los aprobados.
// Pendiente: reglas según tipo de instrumento (marco/específico). La definitiva la valida el servidor.
export function evaluarFirma(c: Convenio): { puede: boolean; motivo?: string } {
    if (c.estado === 'firmado') return { puede: false, motivo: 'Este convenio ya fue firmado.' };
    if (c.estado !== 'aprobado') return { puede: false, motivo: 'Solo se pueden firmar convenios aprobados.' };
    return { puede: true };
}

export async function firmarConvenio(id: number): Promise<Convenio> {
    if (!USAR_DATOS_PRUEBA) return sinApi();
    await esperar(900);
    const c = buscar(id);
    const regla = evaluarFirma(c);
    if (!regla.puede) throw new Error(regla.motivo ?? 'No se puede firmar este convenio.');

    const hoy = fechaEnDias(0);
    c.estado = 'firmado';
    c.fechaFirma = hoy;
    c.firmaDecano = 'Decano de Prueba';
    c.historial.push({
        fecha: hoy,
        estadoAnterior: 'aprobado',
        estadoNuevo: 'firmado',
        fundamento: 'Firma del decano',
        usuario: 'Decano de Prueba',
    });
    return copiar(c);
}