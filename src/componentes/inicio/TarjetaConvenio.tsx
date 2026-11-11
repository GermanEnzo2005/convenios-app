import { View } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';
import { Convenio, ETIQUETA_ESTADO, ETIQUETA_TIPO, TONO_ESTADO } from '@/types/convenio';
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
        <Texto variante="subtitulo">
            {ETIQUETA_TIPO[convenio.tipo]} · {convenio.unidad}
        </Texto>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Insignia texto={ETIQUETA_ESTADO[convenio.estado]} tono={TONO_ESTADO[convenio.estado]} />
            <Insignia texto={`Creado el ${formatearFecha(convenio.fechaCreacion)}`} />
        </View>

        <Boton titulo="Ver convenio" tamano="chico" onPress={onAbrir} accessibilityLabel={`Ver convenio ${convenio.codigo}`} />
        </View>
    );
}