import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { TextoBoton } from '@/componentes/atomos/TextoBoton';
import { NodoConvenio } from '@/componentes/buscador/NodoConvenio';
import { PanelFiltros } from '@/componentes/buscador/PanelFiltros';
import { AvisoSinConexion } from '@/componentes/compartidos/AvisoSinConexion';
import { CampoBusqueda } from '@/componentes/compartidos/CampoBusqueda';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { useSesion } from '@/contexto/ContextoSesion';
import { useConexion } from '@/utils/useConexion';
import { esErrorApi } from '@/services/api';
import { buscarConvenios, FILTROS_INICIALES, FiltrosBusqueda } from '@/services/convenios.service';
import { useTema } from '@/tema/ProveedorTema';
import { Convenio, Documento } from '@/types/convenio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, View } from 'react-native';

export default function Buscar() {
    const { colores } = useTema();
    const router = useRouter();
    const { token, cerrarSesion } = useSesion();
    const enLinea = useConexion();
    const { q } = useLocalSearchParams<{ q?: string }>();

    const [texto, setTexto] = useState(q ?? '');
    const [filtros, setFiltros] = useState<FiltrosBusqueda>({ ...FILTROS_INICIALES, q: q ?? '' });
    const [panelAbierto, setPanelAbierto] = useState(false);

    const [resultados, setResultados] = useState<Convenio[]>([]);
    const [total, setTotal] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [hayMas, setHayMas] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [cargandoMas, setCargandoMas] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const solicitud = useRef(0); // para ignorar respuestas viejas si se busca de nuevo

    // Espera un momento después de escribir para no pedir en cada letra.
    useEffect(() => {
        const espera = setTimeout(() => setFiltros((f) => (f.q === texto ? f : { ...f, q: texto })), 450);
        return () => clearTimeout(espera);
    }, [texto]);

    const buscar = useCallback(async () => {
        const numero = ++solicitud.current;
        setCargando(true);
        setError(null);
        try {
            const r = await buscarConvenios(token, filtros, 1);
            if (numero !== solicitud.current) return;
            setResultados(r.convenios);
            setTotal(r.total);
            setHayMas(r.hayMas);
            setPagina(1);
        } catch (e) {
            if (numero !== solicitud.current) return;
            if (esErrorApi(e) && e.estado === 401) {
                await cerrarSesion();
                return;
            }
            setError(e instanceof Error ? e.message : 'No se pudo buscar.');
        } finally {
            if (numero === solicitud.current) setCargando(false);
        }
    }, [filtros, token]);

    // Solo busca con conexión; cuando vuelve la red, repite la búsqueda sola.
    useEffect(() => {
        if (enLinea) buscar();
    }, [buscar, enLinea]);

    const cargarMas = async () => {
        setCargandoMas(true);
        try {
            const r = await buscarConvenios(token, filtros, pagina + 1);
            setResultados((previos) => [...previos, ...r.convenios.filter((c) => !previos.some((p) => p.id === c.id))]);
            setPagina(pagina + 1);
            setHayMas(r.hayMas);
            setTotal(r.total);
        } catch (e) {
            if (esErrorApi(e) && e.estado === 401) {
                await cerrarSesion();
                return;
            }
            Alert.alert('No se pudo cargar más', e instanceof Error ? e.message : 'Intentá de nuevo.');
        } finally {
            setCargandoMas(false);
        }
    };

    const activos = [filtros.estado, filtros.tipoId, filtros.anio].filter((v) => v !== null).length;

    // Los convenios hijos cuyo padre también está en los resultados se muestran dentro de su padre.
    const ids = new Set(resultados.map((c) => c.id));
    const raices = resultados.filter((c) => !(c.convenioPadreId && ids.has(c.convenioPadreId)));

    const abrirConvenio = (c: Convenio) => router.push({ pathname: '/convenio/[id]', params: { id: String(c.id) } });

    const abrirDocumento = (d: Documento, indice: number, c: Convenio) =>
        router.push({
            pathname: '/documento/[id]',
            params: { id: String(d.id), titulo: `Documento ${indice + 1}`, codigo: c.codigo },
        });

    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
            <EncabezadoPantalla titulo="Buscar convenios" onVolver={() => router.back()} ayuda="buscar">
                <CampoBusqueda valor={texto} onCambio={setTexto} autoFocus={!q} />
            </EncabezadoPantalla>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
                {!enLinea ? (
                    <AvisoSinConexion mensaje="El buscador necesita internet. Cuando vuelvas a tener conexión vas a poder buscar de nuevo." />
                ) : (
                    <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            <View style={{ flexShrink: 1 }}>
                                <Boton
                                    titulo={activos > 0 ? `Filtros (${activos})` : 'Filtros'}
                                    variante={panelAbierto ? 'primario' : 'contorno'}
                                    tamano="chico"
                                    onPress={() => setPanelAbierto((a) => !a)}
                                />
                            </View>
                            {activos > 0 ? (
                                <TextoBoton titulo="Limpiar filtros" onPress={() => setFiltros({ ...FILTROS_INICIALES, q: filtros.q })} />
                            ) : null}
                        </View>

                        {panelAbierto ? <PanelFiltros filtros={filtros} onCambio={setFiltros} /> : null}

                        {cargando ? (
                            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={colores.primary} accessibilityLabel="Buscando" />
                            </View>
                        ) : error ? (
                            <View style={{ backgroundColor: colores.surface, borderRadius: 14, borderWidth: 1, borderColor: colores.border, padding: 16, gap: 12 }}>
                                <Texto variante="error" accessibilityLiveRegion="polite">
                                    {error}
                                </Texto>
                                <Boton titulo="Reintentar" variante="contorno" tamano="chico" onPress={buscar} />
                            </View>
                        ) : resultados.length === 0 ? (
                            <View style={{ backgroundColor: colores.surface, borderRadius: 14, borderWidth: 1, borderColor: colores.border, padding: 16, gap: 8 }}>
                                <Texto variante="etiqueta">No se encontraron convenios</Texto>
                                <Texto variante="subtitulo">Probá con otro texto o quitá algún filtro.</Texto>
                            </View>
                        ) : (
                            <>
                                <Texto variante="subtitulo">
                                    {total} {total === 1 ? 'convenio encontrado' : 'convenios encontrados'}. Tocá la flecha para ver sus convenios
                                    hijos y documentos.
                                </Texto>

                                {raices.map((c) => (
                                    <NodoConvenio key={c.id} convenio={c} onAbrirConvenio={abrirConvenio} onAbrirDocumento={abrirDocumento} />
                                ))}

                                {hayMas ? <Boton titulo="Cargar más" variante="contorno" onPress={cargarMas} cargando={cargandoMas} /> : null}
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}