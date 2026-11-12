import { View } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';
import { Convenio, etiquetaEstado, tonoEstado } from '@/types/convenio';
import { formatearFecha } from '@/utils/fechas';
import { Boton } from '../atomos/Boton';
import { Texto } from '../atomos/Texto';
import { Insignia } from '../compartidos/Insignia';

type Props = { convenio: Convenio; onAbrir: () => void };

export function TarjetaConvenio({ convenio, onAbrir }: Props) {
    const { colores } = useTema();

    return (
        <View
        style={{
            backgroundColor: colores.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colores.border,
            padding: 14,
            gap: 10,
        }}
        >
        <Texto variante="nota">{convenio.codigo}</Texto>
        <Texto variante="etiqueta" style={{ fontSize: 16 }}>
            {convenio.titulo}
        </Texto>
        <Texto variante="subtitulo">{convenio.tipoNombre}</Texto>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Insignia texto={etiquetaEstado(convenio.estado)} tono={tonoEstado(convenio.estado)} />
            <Insignia texto={convenio.fechaCreacion ? `Creado el ${formatearFecha(convenio.fechaCreacion)}` : 'Sin fecha de creación'} />
        </View>

        <Boton titulo="Ver convenio" tamano="chico" onPress={onAbrir} accessibilityLabel={`Ver convenio ${convenio.codigo}`} />
        </View>
    );
}