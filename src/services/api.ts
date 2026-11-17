// Dirección de la API de Laravel: se configura en .env.local (ver .env.example).
// Emulador de Android: http://10.0.2.2:8000/api — Celular real: http://IP-DE-TU-PC:8000/api
export const URL_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8000/api';

export type ErrorApi = Error & { estado: number };

function crearError(mensaje: string, estado: number): ErrorApi {
    const error = new Error(mensaje) as ErrorApi;
    error.estado = estado;
    return error;
}

export function esErrorApi(e: unknown): e is ErrorApi {
    return e instanceof Error && typeof (e as ErrorApi).estado === 'number';
}

type Opciones = {
    metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    cuerpo?: unknown;
    token?: string | null;
    base?: string; // por defecto, la API de Laravel
};

function mensajeDeError(estado: number, datos: unknown): string {
    const d = datos as { message?: string; mensaje?: string; errors?: Record<string, string[]> } | null;
    if (d?.mensaje) return d.mensaje; // mensajes ya en español del servicio de verificación
    const primerError = d?.errors ? Object.values(d.errors)[0]?.[0] : undefined;
    if (estado === 401) return 'Tu sesión venció o no es válida. Ingresá de nuevo.';
    if (estado === 403) return 'No tenés permiso para realizar esta acción.';
    if (estado === 422) return primerError ?? d?.message ?? 'Hay datos que no son válidos.';
    if (estado >= 500) return 'El servidor tuvo un problema. Intentá de nuevo en un momento.';
    return d?.message ?? `Error del servidor (código ${estado}).`;
}

export async function llamarApi<T>(
    ruta: string,
    { metodo = 'GET', cuerpo, token, base = URL_BASE }: Opciones = {},
    ): Promise<T> {
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), 15000);

    try {
        const respuesta = await fetch(`${base}${ruta}`, {
        method: metodo,
        headers: {
            Accept: 'application/json',
            ...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
        signal: controlador.signal,
        });

        const texto = await respuesta.text();
        let datos: unknown = null;
        try {
        datos = texto ? JSON.parse(texto) : null;
        } catch {
        datos = null;
        }

        if (!respuesta.ok) throw crearError(mensajeDeError(respuesta.status, datos), respuesta.status);
        return datos as T;
    } catch (e) {
        if (esErrorApi(e)) throw e;
        if (e instanceof Error && e.name === 'AbortError') {
        throw crearError('El servidor tardó demasiado en responder.', 0);
        }
        throw crearError('No se pudo conectar con el servidor. Verificá que esté encendido y que la dirección esté bien configurada.', 0);
    } finally {
        clearTimeout(temporizador);
    }
}