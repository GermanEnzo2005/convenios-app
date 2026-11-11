import { ActivityIndicator, Pressable } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';
import { Texto } from './Texto';

type Props = {
    titulo: string;
    onPress: () => void;
    cargando?: boolean;
    deshabilitado?: boolean;
    variante?: 'primario' | 'contorno';
    tamano?: 'normal' | 'chico';
    accessibilityLabel?: string;
};

export function Boton({ titulo, onPress, cargando, deshabilitado, variante = 'primario', tamano = 'normal', accessibilityLabel }: Props) {
    const { colores } = useTema();
    const inactivo = deshabilitado || cargando;
    const contorno = variante === 'contorno';
    const colorTexto = contorno ? colores.primary : colores.primaryText;

    return (
        <Pressable
        onPress={onPress}
        disabled={inactivo}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? titulo}
        accessibilityState={{ disabled: inactivo, busy: cargando }}
        style={({ pressed }) => ({
            minHeight: tamano === 'chico' ? 44 : 52,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 12,
            backgroundColor: contorno ? 'transparent' : colores.primary,
            borderWidth: contorno ? 1.5 : 0,
            borderColor: colores.primary,
            opacity: inactivo ? 0.5 : pressed ? 0.85 : 1,
        })}
        >
        {cargando ? (
            <ActivityIndicator color={colorTexto} />
        ) : (
            <Texto variante="etiqueta" color={colorTexto} style={{ fontSize: tamano === 'chico' ? 15 : 16 }}>
            {titulo}
            </Texto>
        )}
        </Pressable>
    );
}