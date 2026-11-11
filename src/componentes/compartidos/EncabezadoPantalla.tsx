import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema } from '@/tema/ProveedorTema';
import { Texto } from '../atomos/Texto';

type Accion = { icono: keyof typeof Ionicons.glyphMap; etiqueta: string; onPress: () => void };

type Props = { titulo: string; subtitulo?: string; onVolver?: () => void; accion?: Accion };

export function EncabezadoPantalla({ titulo, subtitulo, onVolver, accion }: Props) {
    const { colores } = useTema();
    const insets = useSafeAreaInsets();

    return (
        <View
        style={{
            backgroundColor: colores.header,
            paddingTop: insets.top + 12,
            paddingBottom: 16,
            paddingHorizontal: 16,
            borderBottomWidth: 4,
            borderBottomColor: colores.accentLine,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        }}
        >
        {onVolver ? (
            <Pressable
            onPress={onVolver}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
            <Ionicons name="arrow-back" size={24} color={colores.headerText} />
            </Pressable>
        ) : null}

        <View style={{ flex: 1, gap: 2 }}>
            {subtitulo ? (
            <Texto variante="nota" color={colores.headerSubtext}>
                {subtitulo}
            </Texto>
            ) : null}
            <Texto variante="titulo" color={colores.headerText} accessibilityRole="header" numberOfLines={2}>
            {titulo}
            </Texto>
        </View>

        {accion ? (
            <Pressable
            onPress={accion.onPress}
            accessibilityRole="button"
            accessibilityLabel={accion.etiqueta}
            hitSlop={8}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
            <Ionicons name={accion.icono} size={28} color={colores.headerText} />
            </Pressable>
        ) : null}
        </View>
    );
}