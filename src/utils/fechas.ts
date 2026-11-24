import { Tono } from '@/tema/colores';

export const UMBRAL_PREAVISO_DIAS = 60;

// Fecha de hoy (n = 0) o de hoy + n días, en formato 'YYYY-MM-DD'
export function fechaEnDias(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() + n);
    const p = (x: number) => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function diasHasta(iso: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const f = new Date(iso + 'T00:00:00');
    return Math.round((f.getTime() - hoy.getTime()) / 86400000);
}

export function formatearFecha(iso: string): string {
    const [anio, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${anio}`;
}
// Para timestamps de la API (ISO en UTC): se muestran en la hora del celular
export function formatearFechaHora(iso: string): string {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
export function estadoVencimiento(iso: string | null): { texto: string; tono: Tono } {
    if (!iso) return { texto: 'Sin vencimiento registrado', tono: 'neutro' };
    const d = diasHasta(iso);
    if (d < 0) return { texto: `Vencido hace ${-d} ${d === -1 ? 'día' : 'días'}`, tono: 'peligro' };
    if (d === 0) return { texto: 'Vence hoy', tono: 'peligro' };
    if (d <= UMBRAL_PREAVISO_DIAS) return { texto: `Vence en ${d} ${d === 1 ? 'día' : 'días'}`, tono: 'advertencia' };
    return { texto: `Vence el ${formatearFecha(iso)}`, tono: 'neutro' };
}