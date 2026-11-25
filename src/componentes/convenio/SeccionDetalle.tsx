import { ReactNode } from 'react';
import { View } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';
import { Texto } from '../atomos/Texto';

type Props = { titulo: string; accion?: ReactNode; children: ReactNode };

export function SeccionDetalle({ titulo, accion, children }: Props) {
    const { colores } = useTema();

    return (
        <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Texto variante="etiqueta" style={{ fontSize: 17, flexShrink: 1 }} accessibilityRole="header">
            {titulo}
            </Texto>
            {accion}
        </View>
        <View
            style={{
            backgroundColor: colores.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colores.border,
            padding: 14,
            gap: 12,
            }}
        >
            {children}
        </View>
        </View>
    );
}