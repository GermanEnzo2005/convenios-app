import { View } from 'react-native';
import { colorDeTono, fondoDeTono, Tono } from '@/tema/colores';
import { useTema } from '@/tema/ProveedorTema';
import { Texto } from '../atomos/Texto';

export function Insignia({ texto, tono = 'neutro' }: { texto: string; tono?: Tono }) {
    const { colores } = useTema();
    return (
        <View
        style={{
            alignSelf: 'flex-start',
            backgroundColor: fondoDeTono(colores, tono),
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
        }}
        >
        <Texto variante="nota" color={colorDeTono(colores, tono)} style={{ fontWeight: '600' }}>
            {texto}
        </Texto>
        </View>
    );
}