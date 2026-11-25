import { Modal, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { useTema } from '@/tema/ProveedorTema';
import { IconoVoz } from '@/componentes/ayuda/IconoVoz';
import { AYUDAS_SECCION, SeccionAyuda, textoSeccion } from '@/utils/contenidoAyuda';

type Props = { seccion: SeccionAyuda; visible: boolean; onCerrar: () => void };

export function ModalAyuda({ seccion, visible, onCerrar }: Props) {
    const { colores } = useTema();
    const router = useRouter();
    const ayuda = AYUDAS_SECCION[seccion];

    const verManual = () => {
        onCerrar();
        router.push('/ayuda');
    };

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onCerrar}>
            <Pressable
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}
                onPress={onCerrar}
            >
                {/* Evita que tocar la tarjeta cierre el modal */}
                <Pressable
                    onPress={() => {}}
                    style={{
                        backgroundColor: colores.surface,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: colores.border,
                        padding: 16,
                        gap: 12,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <Texto variante="etiqueta" style={{ fontSize: 17, flexShrink: 1 }} accessibilityRole="header">
                            {ayuda.titulo}
                        </Texto>
                        <IconoVoz texto={textoSeccion(ayuda)} />
                    </View>
                    {ayuda.consejos.map((c) => (
                        <Texto key={c}>• {c}</Texto>
                    ))}
                    <Boton titulo="Entendido" tamano="chico" onPress={onCerrar} />
                </Pressable>
            </Pressable>
        </Modal>
    );
}