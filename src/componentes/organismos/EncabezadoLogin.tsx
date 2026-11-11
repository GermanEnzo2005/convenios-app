import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema } from '@/tema/ProveedorTema';
import { Logo } from '../atomos/Logo';
import { Texto } from '../atomos/Texto';

export function EncabezadoLogin() {
    const { colores } = useTema();
    const insets = useSafeAreaInsets();

    return (
        <View
        style={{
            backgroundColor: colores.header,
            paddingTop: insets.top + 24,
            paddingHorizontal: 24,
            paddingBottom: 24,
            gap: 16,
            borderBottomWidth: 4,
            borderBottomColor: colores.accentLine,
        }}
        >
        <Logo />
        <Texto variante="titulo" color={colores.headerText} style={{ fontSize: 28 }} accessibilityRole="header">
            Sistema de Gestión de Convenios
        </Texto>
        <Texto variante="subtitulo" color={colores.headerSubtext}>
            Universidad Nacional de La Pampa · Facultad de Ingeniería
        </Texto>
        </View>
    );
}