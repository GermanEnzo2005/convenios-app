import { View } from 'react-native';
import { Texto } from '../atomos/Texto';

export function FilaDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
    return (
        <View style={{ gap: 2 }}>
        <Texto variante="nota">{etiqueta}</Texto>
        <Texto>{valor}</Texto>
        </View>
    );
}