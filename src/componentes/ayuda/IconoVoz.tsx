import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';
import { useVoz } from '@/utils/useVoz';

export function IconoVoz({ texto }: { texto: string }) {
    const { colores } = useTema();
    const { hablando, leer, detener } = useVoz();

    return (
        <Pressable
            onPress={() => (hablando ? detener() : leer(texto))}
            accessibilityRole="button"
            accessibilityLabel={hablando ? 'Detener la lectura en voz alta' : 'Escuchar esta ayuda en voz alta'}
            hitSlop={8}
            style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: hablando ? colores.primary : 'transparent',
            }}
        >
            <Ionicons
                name={hablando ? 'stop' : 'volume-high-outline'}
                size={22}
                color={hablando ? '#FFFFFF' : colores.primary}
            />
        </Pressable>
    );
}