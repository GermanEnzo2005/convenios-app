import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { SeccionDetalle } from '@/componentes/convenio/SeccionDetalle';
import { PasoManual } from '@/componentes/ayuda/PasoManual';
import { IconoVoz } from '@/componentes/ayuda/IconoVoz';
import { GUIAS, textoGuia } from '@/utils/contenidoAyuda';
import { useTema } from '@/tema/ProveedorTema';

export default function Ayuda() {
    const { colores } = useTema();
    const router = useRouter();
    const { guia } = useLocalSearchParams<{ guia?: string }>();
    const [abierta, setAbierta] = useState<string | null>(guia ?? null);

    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
            <EncabezadoPantalla titulo="Manual de usuario" onVolver={() => router.back()} />

            <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}>
                <Texto variante="subtitulo">
                    Guías paso a paso.
                </Texto>

                {GUIAS.map((g) => {
                    const estaAbierta = abierta === g.id;
                    return (
                        <SeccionDetalle key={g.id} titulo={g.titulo} accion={<IconoVoz texto={textoGuia(g)} />}>
                            <Texto variante="nota">{g.descripcion}</Texto>
                            {estaAbierta
                                ? g.pasos.map((p, i) => (
                                        <PasoManual key={p.titulo} numero={i + 1} titulo={p.titulo} detalle={p.detalle} />
                                    ))
                                : null}
                            <Boton
                                titulo={estaAbierta ? 'Ocultar pasos' : 'Ver pasos'}
                                tamano="chico"
                                variante="contorno"
                                onPress={() => setAbierta(estaAbierta ? null : g.id)}
                            />
                        </SeccionDetalle>
                    );
                })}
            </ScrollView>
        </View>
    );
}