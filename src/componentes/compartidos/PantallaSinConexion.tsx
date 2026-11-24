import { AvisoSinConexion } from '@/componentes/compartidos/AvisoSinConexion';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { useTema } from '@/tema/ProveedorTema';
import { View } from 'react-native';

type Props = { titulo: string; subtitulo: string; mensaje: string; onVolver: () => void };

export function PantallaSinConexion({ titulo, subtitulo, mensaje, onVolver }: Props) {
    const { colores } = useTema();
    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
            <EncabezadoPantalla titulo={titulo} subtitulo={subtitulo} onVolver={onVolver} />
            <View style={{ padding: 16 }}>
                <AvisoSinConexion mensaje={mensaje} />
            </View>
        </View>
    );
}