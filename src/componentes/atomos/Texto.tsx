import { StyleSheet, Text, TextProps } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';

type Variante = 'titulo' | 'subtitulo' | 'etiqueta' | 'cuerpo' | 'nota' | 'error';

const estilos = {
    titulo: { fontSize: 24, fontWeight: '700' },
    subtitulo: { fontSize: 14 },
    etiqueta: { fontSize: 14, fontWeight: '600' },
    cuerpo: { fontSize: 16 },
    nota: { fontSize: 12 },
    error: { fontSize: 13 },
} as const;

type Props = TextProps & { variante?: Variante; color?: string };

export function Texto({ variante = 'cuerpo', color, style, ...resto }: Props) {
    const { colores, escala } = useTema();
    const base = estilos[variante];
    const colorPorDefecto =
        variante === 'error'
        ? colores.error
        : variante === 'titulo'
            ? colores.title
            : variante === 'subtitulo' || variante === 'nota'
            ? colores.textMuted
            : colores.text;

    // El tamaño final es el de la variante (o el que venga en style) multiplicado por la escala elegida.
    const tamano = (StyleSheet.flatten(style)?.fontSize ?? base.fontSize) * escala;

    return <Text {...resto} style={[base, { color: color ?? colorPorDefecto }, style, { fontSize: tamano }]} />;
}