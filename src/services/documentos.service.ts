import { File, Paths } from 'expo-file-system';
import { fetch } from 'expo/fetch';
import { ErrorApi, esErrorApi, URL_BASE } from './api';

function errorDescarga(mensaje: string, estado: number): ErrorApi {
    const error = new Error(mensaje) as ErrorApi;
    error.estado = estado;
    return error;
}

// Los archivos están protegidos: se piden a la API con el token y se guardan en la caché de la app.
export async function descargarDocumento(token: string | null, documentoId: number): Promise<File> {
    try {
        const respuesta = await fetch(`${URL_BASE}/documentos/${documentoId}/download`, {
        headers: {
            Accept: 'application/pdf',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        });

        if (!respuesta.ok) {
        const mensaje =
            respuesta.status === 401
            ? 'Tu sesión venció. Ingresá de nuevo.'
            : respuesta.status === 403
                ? 'No tenés permiso para ver este documento.'
                : respuesta.status === 404
                ? 'El documento no existe o fue eliminado.'
                : `No se pudo descargar el documento (código ${respuesta.status}).`;
        throw errorDescarga(mensaje, respuesta.status);
        }

        const archivo = new File(Paths.cache, `documento-${documentoId}.pdf`);
        await archivo.write(await respuesta.bytes());
        return archivo;
    } catch (e) {
        if (esErrorApi(e)) throw e;
        throw errorDescarga('No se pudo descargar el documento. Verificá tu conexión.', 0);
    }
}

export async function descargarFirma(token: string | null, firmaId: number): Promise<string> {
    try {
        const respuesta = await fetch(`${URL_BASE}/firmas/${firmaId}/imagen`, {
            headers: {
                Accept: 'image/png',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!respuesta.ok) {
            throw errorDescarga(`No se pudo descargar la firma (código ${respuesta.status}).`, respuesta.status);
        }

        const archivo = new File(Paths.cache, `firma-${firmaId}.png`);
        if (archivo.exists) archivo.delete();
        archivo.create();
        archivo.write(await respuesta.bytes());
        return archivo.uri;
    } catch (e) {
        if (esErrorApi(e)) throw e;
        throw errorDescarga('No se pudo descargar la firma. Verificá tu conexión.', 0);
    }
}