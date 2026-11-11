import { ReactNode } from 'react';
import { View } from 'react-native';
import { Texto } from '../atomos/Texto';

type Props = { etiqueta: string; error?: string; children: ReactNode };

export function CampoFormulario({ etiqueta, error, children }: Props) {
    return (
        <View style={{ gap: 6 }}>
        <Texto variante="etiqueta">{etiqueta}</Texto>
        {children}
        {error ? (
            <Texto variante="error" accessibilityLiveRegion="polite">
            {error}
            </Texto>
        ) : null}
        </View>
    );
}