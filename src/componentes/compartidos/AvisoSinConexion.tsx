import { Texto } from '@/componentes/atomos/Texto';
import { useTema } from '@/tema/ProveedorTema';
import { View } from 'react-native';

export function AvisoSinConexion({ mensaje }: { mensaje: string }) {
    const { colores } = useTema();
    return (
        <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={{ backgroundColor: colores.surface, borderRadius: 14, borderWidth: 1, borderColor: colores.border, padding: 14, gap: 4 }}
        >
            <Texto variante="etiqueta">Estás sin conexión</Texto>
            <Texto variante="subtitulo">{mensaje}</Texto>
        </View>
    );
}