import { Pressable } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';
import { Texto } from './Texto';

type Props = { titulo: string; onPress: () => void; accessibilityLabel?: string };

export function TextoBoton({ titulo, onPress, accessibilityLabel }: Props) {
    const { colores } = useTema();
    return (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? titulo} hitSlop={10}>
        <Texto variante="etiqueta" color={colores.link}>
            {titulo}
        </Texto>
        </Pressable>
    );
}