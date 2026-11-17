import { Pressable } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';
import { Texto } from '../atomos/Texto';

type Props = { texto: string; activo: boolean; onPress: () => void };

export function ChipFiltro({ texto, activo, onPress }: Props) {
    const { colores } = useTema();

    return (
        <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={texto}
        accessibilityState={{ selected: activo }}
        style={{
            minHeight: 40,
            paddingHorizontal: 14,
            justifyContent: 'center',
            borderRadius: 999,
            borderWidth: 1.5,
            borderColor: activo ? colores.primary : colores.border,
            backgroundColor: activo ? colores.infoBg : colores.surface,
        }}
        >
        <Texto variante="etiqueta" color={activo ? colores.info : colores.text}>
            {texto}
        </Texto>
        </Pressable>
    );
}