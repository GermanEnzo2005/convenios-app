import { AvisoSinConexion } from '@/componentes/compartidos/AvisoSinConexion';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { useTema } from '@/tema/ProveedorTema';
import { SeccionAyuda } from '@/utils/contenidoAyuda';
import { View } from 'react-native';

type Props = { 
    titulo: string; 
    subtitulo: string; 
    mensaje: string; onVolver: () => void;
    ayuda?: SeccionAyuda; // si se pasa, aparece el "?" con la ayuda de esa sección
};

export function PantallaSinConexion({ titulo, subtitulo, mensaje, onVolver, ayuda }: Props) {
    const { colores } = useTema();
    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
            <EncabezadoPantalla titulo={titulo} subtitulo={subtitulo} onVolver={onVolver} ayuda={ayuda} />
            <View style={{ padding: 16 }}>
                <AvisoSinConexion mensaje={mensaje} />
            </View>
        </View>
    );
}