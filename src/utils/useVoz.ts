/*------------------------
Hook de voz
----------------------- */

import { useCallback, useEffect, useState } from 'react';
import * as Speech from 'expo-speech';

export function useVoz() {
    const [hablando, setHablando] = useState(false);

    const detener = useCallback(() => {
        Speech.stop();
        setHablando(false);
    }, []);

    const leer = useCallback((texto: string) => {
        Speech.stop(); // corta cualquier lectura anterior
        setHablando(true);
        Speech.speak(texto, {
            language: 'es-AR',
            rate: 0.95,
            onDone: () => setHablando(false),
            onStopped: () => setHablando(false),
            onError: () => setHablando(false),
        });
    }, []);

    // Si la pantalla se cierra, deja de hablar.
    useEffect(() => () => { Speech.stop(); }, []);

    return { hablando, leer, detener };
}