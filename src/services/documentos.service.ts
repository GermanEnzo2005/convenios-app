import { File, Paths } from 'expo-file-system';
import { Documento } from '@/types/convenio';

// Descarga el PDF a la caché de la app y devuelve el archivo local.
// Cuando haya API: los archivos van a estar protegidos, así que hay que sumar
// las opciones { headers: { Authorization: `Bearer ${token}` } } en la descarga.
export async function descargarDocumento(documento: Documento): Promise<File> {
    const destino = new File(Paths.cache, `documento-${documento.id}.pdf`);
    return File.downloadFileAsync(documento.url, destino, { idempotent: true });
}