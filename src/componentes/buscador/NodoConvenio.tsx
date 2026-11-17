import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSesion } from '@/contexto/ContextoSesion';
import { esErrorApi } from '@/services/api';
import { obtenerConvenio } from '@/services/convenios.service';
import { useTema } from '@/tema/ProveedorTema';
import { Convenio, Documento, etiquetaEstado, tonoEstado } from '@/types/convenio';
import { Texto } from '../atomos/Texto';
import { TextoBoton } from '../atomos/TextoBoton';
import { Insignia } from '../compartidos/Insignia';

type Props = {
    convenio: Convenio;
    nivel?: number;
    onAbrirConvenio: (c: Convenio) => void;
    onAbrirDocumento: (d: Documento, indice: number, c: Convenio) => void;
};

function Rama({ icono, titulo, children }: { icono: keyof typeof Ionicons.glyphMap; titulo: string; children: ReactNode }) {
    const { colores } = useTema();
    return (
        <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={icono} size={18} color={colores.textMuted} />
            <Texto variante="etiqueta">{titulo}</Texto>
        </View>
        <View style={{ gap: 8, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: colores.border }}>{children}</View>
        </View>
    );
}

export function NodoConvenio({ convenio, nivel = 0, onAbrirConvenio, onAbrirDocumento }: Props) {
    const { colores } = useTema();
    const { token, cerrarSesion } = useSesion();

    const [abierto, setAbierto] = useState(false);
    const [detalle, setDetalle] = useState<Convenio | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Al abrir por primera vez se pide el detalle: ahí vienen los convenios hijos y los documentos.
    const alternar = async () => {
        const abrir = !abierto;
        setAbierto(abrir);
        if (!abrir || detalle || cargando) return;

        setCargando(true);
        setError(null);
        try {
        setDetalle(await obtenerConvenio(token, convenio.id));
        } catch (e) {
        if (esErrorApi(e) && e.estado === 401) {
            await cerrarSesion();
            return;
        }
        setError(e instanceof Error ? e.message : 'No se pudo cargar el detalle.');
        } finally {
        setCargando(false);
        }
    };

    return (
        <View
        style={{
            backgroundColor: colores.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colores.border,
            padding: 12,
            gap: 10,
        }}
        >
        <Pressable
            onPress={alternar}
            accessibilityRole="button"
            accessibilityLabel={`${abierto ? 'Contraer' : 'Expandir'} ${convenio.codigo}`}
            accessibilityState={{ expanded: abierto }}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}
        >
            <Ionicons name={abierto ? 'chevron-down' : 'chevron-forward'} size={22} color={colores.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, gap: 4 }}>
            <Texto variante="nota">{convenio.codigo}</Texto>
            <Texto variante="etiqueta" style={{ fontSize: 15 }}>
                {convenio.titulo}
            </Texto>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <Insignia texto={etiquetaEstado(convenio.estado)} tono={tonoEstado(convenio.estado)} />
                <Insignia texto={convenio.tipoNombre} />
            </View>
            {convenio.convenioPadreId ? (
                <Texto variante="nota">Convenio hijo del N.º {convenio.convenioPadreId}</Texto>
            ) : null}
            </View>
        </Pressable>

        <View style={{ alignItems: 'flex-start', paddingLeft: 30 }}>
            <TextoBoton titulo="Ver ficha completa" onPress={() => onAbrirConvenio(convenio)} accessibilityLabel={`Ver ficha de ${convenio.codigo}`} />
        </View>

        {abierto ? (
            <View style={{ gap: 12, paddingLeft: 14 }}>
            {cargando ? <ActivityIndicator color={colores.primary} accessibilityLabel="Cargando" /> : null}
            {error ? (
                <Texto variante="error" accessibilityLiveRegion="polite">
                {error}
                </Texto>
            ) : null}

            {detalle ? (
                <>
                <Rama icono="git-branch-outline" titulo={`Convenios hijos (${detalle.adendas.length})`}>
                    {detalle.adendas.length === 0 ? (
                    <Texto variante="nota">No tiene convenios hijos.</Texto>
                    ) : (
                    detalle.adendas.map((hijo) => (
                        <NodoConvenio
                        key={hijo.id}
                        convenio={hijo}
                        nivel={nivel + 1}
                        onAbrirConvenio={onAbrirConvenio}
                        onAbrirDocumento={onAbrirDocumento}
                        />
                    ))
                    )}
                </Rama>

                <Rama icono="document-text-outline" titulo={`Documentos (${detalle.documentos.length})`}>
                    {detalle.documentos.length === 0 ? (
                    <Texto variante="nota">No tiene documentos.</Texto>
                    ) : (
                    detalle.documentos.map((d, i) => (
                        <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <Texto variante="subtitulo">Documento {i + 1} · PDF</Texto>
                        <TextoBoton
                            titulo="Ver PDF"
                            onPress={() => onAbrirDocumento(d, i, detalle)}
                            accessibilityLabel={`Ver PDF del documento ${i + 1} de ${convenio.codigo}`}
                        />
                        </View>
                    ))
                    )}
                </Rama>
                </>
            ) : null}
            </View>
        ) : null}
        </View>
    );
}