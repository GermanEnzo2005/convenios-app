import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useSesion } from './ContextoSesion';

type Origen = 'galeria' | 'camara';

type ValorPerfil = {
    fotoUri: string | null;
    elegirFoto: (origen: Origen) => Promise<void>;
    quitarFoto: () => Promise<void>;
};

const ContextoPerfil = createContext<ValorPerfil | null>(null);

// Cada usuario tiene su propia foto: se guarda el nombre del archivo, no la ruta completa.
const claveFoto = (usuarioId: number) => `foto_perfil_${usuarioId}`;

function borrarArchivo(nombre: string | null) {
    if (!nombre) return;
    try {
        const archivo = new File(Paths.document, nombre);
        if (archivo.exists) archivo.delete();
    } catch {
        // si no se puede borrar, no pasa nada
    }
}

export function ProveedorPerfil({ children }: { children: ReactNode }) {
    const { usuario } = useSesion();
    const usuarioId = usuario?.id ?? null;
    const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);

    // Al cambiar de usuario se carga su foto guardada (si tiene y el archivo todavía existe).
    useEffect(() => {
        let vigente = true;
        setNombreArchivo(null);
        if (usuarioId !== null) {
        AsyncStorage.getItem(claveFoto(usuarioId))
            .then((guardado) => {
            if (!vigente || !guardado) return;
            if (new File(Paths.document, guardado).exists) setNombreArchivo(guardado);
            })
            .catch(() => {});
        }
        return () => {
        vigente = false;
        };
    }, [usuarioId]);

    const fotoUri = nombreArchivo ? new File(Paths.document, nombreArchivo).uri : null;

    const elegirFoto = useCallback(
        async (origen: Origen) => {
        if (usuarioId === null) return;

        const opciones: ImagePicker.ImagePickerOptions = {
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        };

        let resultado: ImagePicker.ImagePickerResult;
        if (origen === 'camara') {
            const permiso = await ImagePicker.requestCameraPermissionsAsync();
            if (!permiso.granted) {
            throw new Error('Necesitamos permiso para usar la cámara. Podés habilitarlo en los ajustes del celular.');
            }
            resultado = await ImagePicker.launchCameraAsync(opciones);
        } else {
            resultado = await ImagePicker.launchImageLibraryAsync(opciones);
        }

        if (resultado.canceled || !resultado.assets[0]) return;

        // Se copia la imagen a la carpeta de la app (la elegida queda en una caché temporal).
        const nuevoNombre = `foto-perfil-${usuarioId}-${Date.now()}.jpg`;
        new File(resultado.assets[0].uri).copy(new File(Paths.document, nuevoNombre));

        // Queda una sola foto por usuario: se borra la anterior.
        borrarArchivo(nombreArchivo);

        await AsyncStorage.setItem(claveFoto(usuarioId), nuevoNombre);
        setNombreArchivo(nuevoNombre);
        },
        [usuarioId, nombreArchivo],
    );

    const quitarFoto = useCallback(async () => {
        if (usuarioId === null) return;
        borrarArchivo(nombreArchivo);
        await AsyncStorage.removeItem(claveFoto(usuarioId));
        setNombreArchivo(null);
    }, [usuarioId, nombreArchivo]);

    return <ContextoPerfil.Provider value={{ fotoUri, elegirFoto, quitarFoto }}>{children}</ContextoPerfil.Provider>;
}

export function usePerfil() {
    const ctx = useContext(ContextoPerfil);
    if (!ctx) throw new Error('usePerfil debe usarse dentro de ProveedorPerfil');
    return ctx;
}