import { Text, TextProps } from 'react-native';
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
    const { colores } = useTema();
    const colorPorDefecto =
        variante === 'error'
        ? colores.error
        : variante === 'titulo'
            ? colores.title
            : variante === 'subtitulo' || variante === 'nota'
            ? colores.textMuted
            : colores.text;

    return <Text {...resto} style={[estilos[variante], { color: color ?? colorPorDefecto }, style]} />;
}