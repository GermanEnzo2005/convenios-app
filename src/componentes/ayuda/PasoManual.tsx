import { View } from 'react-native';
import { Texto } from '@/componentes/atomos/Texto';

type Props = { numero: number; titulo: string; detalle: string };

export function PasoManual({ numero, titulo, detalle }: Props) {
    return (
        <View style={{ flexDirection: 'row', gap: 10 }}>
            <Texto variante="etiqueta">{numero}.</Texto>
            <View style={{ flex: 1, gap: 2 }}>
                <Texto variante="etiqueta">{titulo}</Texto>
                <Texto variante="nota">{detalle}</Texto>
            </View>
        </View>
    );
}