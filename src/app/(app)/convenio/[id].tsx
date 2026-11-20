import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { Insignia } from '@/componentes/compartidos/Insignia';
import { FilaDato } from '@/componentes/convenio/FilaDato';
import { SeccionDetalle } from '@/componentes/convenio/SeccionDetalle';
import { useSesion } from '@/contexto/ContextoSesion';
import { esErrorApi } from '@/services/api';
import {
    evaluarFirma,
    firmarConvenio,
    obtenerConvenio,
    obtenerHistorial,
    obtenerPartes,
} from '@/services/convenios.service';
import { useTema } from '@/tema/ProveedorTema';
import { CambioEstado, Convenio, etiquetaEstado, Parte, tonoEstado } from '@/types/convenio';
import { estadoVencimiento, formatearFecha } from '@/utils/fechas';

export default function DetalleConvenio() {
    const { colores } = useTema();
    const router = useRouter();
    const { token, cerrarSesion } = useSesion();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [convenio, setConvenio] = useState<Convenio | null>(null);
    const [partes, setPartes] = useState<Parte[] | null>(null); // null = no se pudieron cargar
    const [historial, setHistorial] = useState<CambioEstado[] | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [firmando, setFirmando] = useState(false);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
        const numero = Number(id);
        const [rConvenio, rPartes, rHistorial] = await Promise.allSettled([
            obtenerConvenio(token, numero),
            obtenerPartes(token, numero),
            obtenerHistorial(token, numero),
        ]);

        const sesionVencida = [rConvenio, rPartes, rHistorial].some(
            (r) => r.status === 'rejected' && esErrorApi(r.reason) && r.reason.estado === 401,
        );
        if (sesionVencida) {
            await cerrarSesion();
            return;
        }

        if (rConvenio.status === 'rejected') throw rConvenio.reason;
        setConvenio(rConvenio.value);
        setPartes(rPartes.status === 'fulfilled' ? rPartes.value : null);
        setHistorial(rHistorial.status === 'fulfilled' ? rHistorial.value : null);
        } catch (e) {
        setError(
            esErrorApi(e) && e.estado === 404
            ? 'No se encontró el convenio.'
            : e instanceof Error
                ? e.message
                : 'No se pudo cargar el convenio.',
        );
        } finally {
        setCargando(false);
        }
    }, [id, token]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const firmar = async () => {
        if (!convenio) return;
        setFirmando(true);
        try {
        await firmarConvenio(token, convenio.id);
        setConvenio({ ...convenio, estado: 'firmado', firmadoPorDecano: true });
        Alert.alert(
            'Convenio firmado',
            `${convenio.codigo} quedó firmado.`,
            [{ text: 'Aceptar', onPress: () => router.back() }],
            { cancelable: false },
        );
        } catch (e) {
        if (esErrorApi(e) && e.estado === 401) {
            await cerrarSesion();
            return;
        }
        Alert.alert('No se pudo firmar', e instanceof Error ? e.message : 'Error desconocido');
        } finally {
        setFirmando(false);
        }
    };

    const confirmarFirma = () => {
        if (!convenio) return;
        Alert.alert(
        'Firmar convenio',
        `Se registrará tu firma en ${convenio.codigo} y su estado pasará a Firmado. ¿Confirmás?`,
        [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Firmar', onPress: firmar },
        ],
        );
    };

    const firma = convenio ? evaluarFirma(convenio) : null;
    const vencimiento = convenio?.fechaVencimiento ? estadoVencimiento(convenio.fechaVencimiento) : null;

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
                <Insignia texto={etiquetaEstado(convenio.estado)} tono={tonoEstado(convenio.estado)} />
                <Insignia texto={convenio.tipoNombre} tono="info" />
                {vencimiento ? <Insignia texto={vencimiento.texto} tono={vencimiento.tono} /> : null}
                </View>
            </View>

            <SeccionDetalle titulo="Datos generales">
                <FilaDato etiqueta="Código" valor={convenio.codigo} />
                <FilaDato etiqueta="Tipo de instrumento" valor={convenio.tipoNombre} />
                {convenio.unidadNombre ? <FilaDato etiqueta="Unidad responsable" valor={convenio.unidadNombre} /> : null}
                <FilaDato
                etiqueta="Fecha de creación"
                valor={convenio.fechaCreacion ? formatearFecha(convenio.fechaCreacion) : 'Sin fecha'}
                />
                <FilaDato
                etiqueta="Vencimiento"
                valor={convenio.fechaVencimiento ? formatearFecha(convenio.fechaVencimiento) : 'Sin vencimiento registrado'}
                />
                {convenio.revisorNombre ? <FilaDato etiqueta="Revisor" valor={convenio.revisorNombre} /> : null}
                {convenio.convenioPadreId ? (
                <FilaDato etiqueta="Convenio de origen" valor={`Convenio N.º ${convenio.convenioPadreId}`} />
                ) : null}
            </SeccionDetalle>

            <SeccionDetalle titulo="Partes y representantes">
                {partes === null ? (
                <Texto variante="subtitulo">No se pudieron cargar las partes.</Texto>
                ) : partes.length === 0 ? (
                <Texto variante="subtitulo">Este convenio todavía no tiene partes registradas.</Texto>
                ) : (
                partes.map((p) => (
                    <View key={p.id} style={{ gap: 2 }}>
                    <Texto variante="etiqueta">{p.unidad}</Texto>
                    {p.tipoUnidad ? <Texto variante="nota">{p.tipoUnidad}</Texto> : null}
                    <Texto variante="subtitulo">
                        {p.representante}
                        {p.cargo ? ` (${p.cargo})` : ''}
                    </Texto>
                    {p.email ? <Texto variante="subtitulo">{p.email}</Texto> : null}
                    {p.telefono ? <Texto variante="subtitulo">{p.telefono}</Texto> : null}
                    </View>
                ))
                )}
            </SeccionDetalle>

            <SeccionDetalle titulo="Documentos">
                {convenio.documentos.length === 0 ? (
                <Texto variante="subtitulo">Este convenio todavía no tiene documentos.</Texto>
                ) : (
                convenio.documentos.map((d, i) => (
                    <View key={d.id} style={{ gap: 8 }}>
                    <View style={{ gap: 2 }}>
                        <Texto variante="etiqueta">Documento {i + 1}</Texto>
                        <Texto variante="nota">
                        PDF{d.creadoEn ? ` · subido el ${formatearFecha(d.creadoEn)}` : ''}
                        </Texto>
                    </View>
                    <Boton
                        titulo="Ver PDF"
                        variante="contorno"
                        tamano="chico"
                        onPress={() =>
                        router.push({
                            pathname: '/documento/[id]',
                            params: { id: String(d.id), titulo: `Documento ${i + 1}`, codigo: convenio.codigo },
                        })
                        }
                        accessibilityLabel={`Ver PDF del documento ${i + 1}`}
                    />
                    </View>
                ))
                )}
            </SeccionDetalle>

            <SeccionDetalle titulo="Firma del decano">
                <FilaDato etiqueta="Estado de la firma" valor={convenio.firmadoPorDecano ? 'Registrada' : 'Pendiente'} />
            </SeccionDetalle>

            <SeccionDetalle titulo="Historial de estados">
                {historial === null ? (
                <Texto variante="subtitulo">No se pudo cargar el historial.</Texto>
                ) : historial.length === 0 ? (
                <Texto variante="subtitulo">Todavía no hay cambios de estado registrados.</Texto>
                ) : (
                historial.map((h) => (
                    <View key={h.id} style={{ gap: 2 }}>
                    <Texto variante="etiqueta">
                        {h.estadoAnterior ? `${etiquetaEstado(h.estadoAnterior)} → ` : ''}
                        {etiquetaEstado(h.estadoNuevo)}
                    </Texto>
                    <Texto variante="nota">
                        {h.fecha ? formatearFecha(h.fecha) : 'Sin fecha'} · {h.usuario}
                    </Texto>
                    {h.fundamento ? <Texto variante="subtitulo">{h.fundamento}</Texto> : null}
                    </View>
                ))
                )}
            </SeccionDetalle>

            {firma?.puede ? (
                <Boton titulo="Firmar convenio" onPress={confirmarFirma} cargando={firmando} />
            ) : (
                <View style={{ backgroundColor: colores.surface, borderRadius: 14, borderWidth: 1, borderColor: colores.border, padding: 14 }}>
                <Texto variante="subtitulo">{firma?.motivo}</Texto>
                </View>
            )}
            </ScrollView>
        )}
        </View>
    );
}