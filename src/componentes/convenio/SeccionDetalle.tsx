import { ReactNode } from 'react';
import { View } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';
import { Texto } from '../atomos/Texto';

export function SeccionDetalle({ titulo, children }: { titulo: string; children: ReactNode }) {
    const { colores } = useTema();

    return (
        <View style={{ gap: 8 }}>
        <Texto variante="etiqueta" style={{ fontSize: 17 }} accessibilityRole="header">
            {titulo}
        </Texto>
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