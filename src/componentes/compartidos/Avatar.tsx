import { Image, View } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';
import { Texto } from '../atomos/Texto';

const iniciales = (nombre: string) =>
    nombre
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join('');

type Props = { uri: string | null; nombre: string; tamano?: number };

export function Avatar({ uri, nombre, tamano = 40 }: Props) {
    const { colores } = useTema();
    const forma = { width: tamano, height: tamano, borderRadius: tamano / 2 };

    if (uri) {
        return <Image source={{ uri }} accessibilityLabel="Foto de perfil" style={[forma, { backgroundColor: colores.border }]} />;
    }

    return (
        <View
        accessibilityRole="image"
        accessibilityLabel="Avatar con las iniciales del usuario"
        style={[forma, { backgroundColor: colores.primary, alignItems: 'center', justifyContent: 'center' }]}
        >
        <Texto variante="etiqueta" color={colores.primaryText} style={{ fontSize: tamano * 0.4 }}>
            {iniciales(nombre) || '?'}
        </Texto>
        </View>
    );
}