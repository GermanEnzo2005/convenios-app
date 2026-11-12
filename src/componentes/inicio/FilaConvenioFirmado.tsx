import { Pressable, View } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';
import { Convenio } from '@/types/convenio';
import { Texto } from '../atomos/Texto';
import { Insignia } from '../compartidos/Insignia';

type Props = { convenio: Convenio; onAbrir: () => void };

export function FilaConvenioFirmado({ convenio, onAbrir }: Props) {
    const { colores } = useTema();

    return (
        <Pressable
        onPress={onAbrir}
        accessibilityRole="button"
        accessibilityLabel={`Ver ${convenio.codigo}, convenio firmado`}
        style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: colores.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colores.border,
            padding: 12,
            opacity: pressed ? 0.85 : 1,
        })}
        >
        <View style={{ flex: 1, gap: 2 }}>
            <Texto variante="nota">{convenio.codigo}</Texto>
            <Texto variante="etiqueta" numberOfLines={2}>
            {convenio.titulo}
            </Texto>
        </View>
        <Insignia texto="Firmado" tono="exito" />
        </Pressable>
    );
}