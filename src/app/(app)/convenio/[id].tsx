import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { Insignia } from '@/componentes/compartidos/Insignia';
import { FilaDato } from '@/componentes/convenio/FilaDato';
import { SeccionDetalle } from '@/componentes/convenio/SeccionDetalle';
import { evaluarFirma, firmarConvenio, obtenerConvenio } from '@/services/convenios.service';
import { useTema } from '@/tema/ProveedorTema';
import {
    Convenio,
    Documento,
    ETIQUETA_ESTADO,
    ETIQUETA_TIPO,
    ETIQUETA_TIPO_DOCUMENTO,
    TONO_ESTADO,
} from '@/types/convenio';
import { estadoVencimiento, formatearFecha } from '@/utils/fechas';

export default function DetalleConvenio() {
    const { colores } = useTema();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [convenio, setConvenio] = useState<Convenio | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [firmando, setFirmando] = useState(false);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
        setConvenio(await obtenerConvenio(Number(id)));
        } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cargar el convenio.');
        } finally {
        setCargando(false);
        }
    }, [id]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const abrirPdf = async (documento: Documento) => {
        try {
        await Linking.openURL(documento.url);
        } catch {
        Alert.alert('No se pudo abrir el PDF', 'Verificá tu conexión o que el dispositivo tenga un visor de PDF.');
        }
    };

    const firmar = async () => {
        if (!convenio) return;
        setFirmando(true);
        try {
        const actualizado = await firmarConvenio(convenio.id);
        setConvenio(actualizado);
        Alert.alert('Convenio firmado', `${actualizado.codigo} quedó firmado.`, [
            { text: 'Aceptar', onPress: () => router.back() },
        ]);
        } catch (e) {
        Alert.alert('No se pudo firmar', e instanceof Error ? e.message : 'Error desconocido');
        } finally {
        setFirmando(false);
        }
    };

    const confirmarFirma = () => {
        if (!convenio) return;
        Alert.alert(
        'Firmar convenio',
        `Se registrará tu firma en ${convenio.codigo} y su estado pasará de Aprobado a Firmado. ¿Confirmás?`,
        [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Firmar', onPress: firmar },
        ],
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
        <EncabezadoPantalla titulo={convenio?.codigo ?? 'Convenio'} subtitulo="Detalle del convenio" onVolver={() => router.back()} />

        {cargando ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colores.primary} accessibilityLabel="Cargando" />
            </View>
        ) : error || !convenio ? (
            <View style={{ padding: 16 }}>
            <View style={{ backgroundColor: colores.surface, borderRadius: 14, borderWidth: 1, borderColor: colores.border, padding: 16, gap: 12 }}>
                <Texto variante="error" accessibilityLiveRegion="polite">
                {error ?? 'No se encontró el convenio.'}
                </Texto>
                <Boton titulo="Reintentar" variante="contorno" tamano="chico" onPress={cargar} />
            </View>
            </View>
        ) : (
            <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}>
            <View style={{ gap: 10 }}>
                <Texto variante="titulo" style={{ fontSize: 22 }}>
                {convenio.titulo}
                </Texto>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Insignia texto={ETIQUETA_ESTADO[convenio.estado]} tono={TONO_ESTADO[convenio.estado]} />
                <Insignia texto={ETIQUETA_TIPO[convenio.tipo]} tono="info" />
                <Insignia texto={estadoVencimiento(convenio.fechaVencimiento).texto} tono={estadoVencimiento(convenio.fechaVencimiento).tono} />
                </View>
            </View>

            <SeccionDetalle titulo="Datos generales">
                <FilaDato etiqueta="Unidad responsable" valor={convenio.unidad} />
                <FilaDato etiqueta="Fecha de creación" valor={formatearFecha(convenio.fechaCreacion)} />
                <FilaDato
                etiqueta="Vencimiento"
                valor={convenio.fechaVencimiento ? formatearFecha(convenio.fechaVencimiento) : 'Sin vencimiento registrado'}
                />
                <FilaDato etiqueta="Objeto" valor={convenio.objeto} />
                <FilaDato etiqueta="Alcance" valor={convenio.alcance} />
                {convenio.antecedente ? (
                <FilaDato etiqueta="Antecedente" valor={`${convenio.antecedente.codigo} · ${convenio.antecedente.titulo}`} />
                ) : null}
            </SeccionDetalle>

            <SeccionDetalle titulo="Partes y representantes">
                {convenio.partes.map((p, i) => (
                <View key={`${p.unidad}-${i}`} style={{ gap: 2 }}>
                    <Texto variante="etiqueta">{p.unidad}</Texto>
                    <Texto variante="subtitulo">{p.tipoUnidad}</Texto>
                    <Texto variante="subtitulo">
                    {p.representante} · {p.email}
                    </Texto>
                </View>
                ))}
            </SeccionDetalle>

            <SeccionDetalle titulo="Documentos">
                {convenio.documentos.length === 0 ? (
                <Texto variante="subtitulo">Este convenio no tiene documentos adjuntos.</Texto>
                ) : (
                convenio.documentos.map((d) => (
                    <View key={d.id} style={{ gap: 8 }}>
                    <View style={{ gap: 2 }}>
                        <Texto variante="etiqueta">{d.nombre}</Texto>
                        <Texto variante="nota">{ETIQUETA_TIPO_DOCUMENTO[d.tipo]} · PDF</Texto>
                    </View>
                    <Boton
                        titulo="Ver PDF"
                        variante="contorno"
                        tamano="chico"
                        onPress={() => abrirPdf(d)}
                        accessibilityLabel={`Ver PDF: ${d.nombre}`}
                    />
                    </View>
                ))
                )}
            </SeccionDetalle>

            <SeccionDetalle titulo="Firmas">
                <FilaDato etiqueta="Gestor" valor={convenio.firmaGestor ?? 'Pendiente'} />
                <FilaDato
                etiqueta="Decano"
                valor={
                    convenio.firmaDecano
                    ? `${convenio.firmaDecano}${convenio.fechaFirma ? ` · ${formatearFecha(convenio.fechaFirma)}` : ''}`
                    : 'Pendiente'
                }
                />
            </SeccionDetalle>

            <SeccionDetalle titulo="Historial de estados">
                {[...convenio.historial].reverse().map((h, i) => (
                <View key={`${h.fecha}-${i}`} style={{ gap: 2 }}>
                    <Texto variante="etiqueta">
                    {h.estadoAnterior ? `${ETIQUETA_ESTADO[h.estadoAnterior]} → ` : ''}
                    {ETIQUETA_ESTADO[h.estadoNuevo]}
                    </Texto>
                    <Texto variante="nota">
                    {formatearFecha(h.fecha)} · {h.usuario}
                    </Texto>
                    <Texto variante="subtitulo">{h.fundamento}</Texto>
                </View>
                ))}
            </SeccionDetalle>

            {evaluarFirma(convenio).puede ? (
                <Boton titulo="Firmar convenio" onPress={confirmarFirma} cargando={firmando} />
            ) : (
                <View style={{ backgroundColor: colores.surface, borderRadius: 14, borderWidth: 1, borderColor: colores.border, padding: 14 }}>
                <Texto variante="subtitulo">{evaluarFirma(convenio).motivo}</Texto>
                </View>
            )}
            </ScrollView>
        )}
        </View>
    );
}