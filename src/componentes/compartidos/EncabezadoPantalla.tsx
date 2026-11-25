import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema } from '@/tema/ProveedorTema';
import { Texto } from '../atomos/Texto';
import { ModalAyuda } from '@/componentes/ayuda/ModalAyuda';
import { SeccionAyuda } from '@/utils/contenidoAyuda';

type Accion = {
    icono?: keyof typeof Ionicons.glyphMap;
    contenido?: ReactNode; // si se pasa, se muestra en lugar del ícono (por ejemplo, la miniatura)
    etiqueta: string;
    onPress: () => void;
};

type Props = {
    titulo: string;
    subtitulo?: string;
    onVolver?: () => void;
    accion?: Accion;
    ayuda?: SeccionAyuda; // si se pasa, aparece el "?" con la ayuda de esa sección
    children?: ReactNode; // contenido debajo del título (por ejemplo, el buscador)
};

export function EncabezadoPantalla({ titulo, subtitulo, onVolver, accion, ayuda, children }: Props) {
    const { colores } = useTema();
    const insets = useSafeAreaInsets();
    const [ayudaVisible, setAyudaVisible] = useState(false);

    return (
        <View
        style={{
            backgroundColor: colores.header,
            paddingTop: insets.top + 12,
            paddingBottom: 16,
            paddingHorizontal: 16,
            borderBottomWidth: 4,
            borderBottomColor: colores.accentLine,
            gap: 12,
        }}
        >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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

            {ayuda ? (
                <Pressable
                    onPress={() => setAyudaVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Ayuda de esta pantalla"
                    hitSlop={8}
                    style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Ionicons name="help-circle-outline" size={28} color={colores.headerText} />
                </Pressable>
            ) : null}

            {accion ? (
            <Pressable
                onPress={accion.onPress}
                accessibilityRole="button"
                accessibilityLabel={accion.etiqueta}
                hitSlop={8}
                style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
                {accion.contenido ??
                (accion.icono ? <Ionicons name={accion.icono} size={28} color={colores.headerText} /> : null)}
            </Pressable>
            ) : null}
        </View>

        {children}

        {ayuda ? (
            <ModalAyuda seccion={ayuda} visible={ayudaVisible} onCerrar={() => setAyudaVisible(false)} />
        ) : null}
        </View>
    );
}