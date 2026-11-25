import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { Avatar } from '@/componentes/compartidos/Avatar';
import { AvisoSinConexion } from '@/componentes/compartidos/AvisoSinConexion';
import { CampanaNotificaciones } from '@/componentes/compartidos/CampanaNotificaciones';
import { CampoBusqueda } from '@/componentes/compartidos/CampoBusqueda';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { Insignia } from '@/componentes/compartidos/Insignia';
import { FilaConvenioFirmado } from '@/componentes/inicio/FilaConvenioFirmado';
import { TarjetaConvenio } from '@/componentes/inicio/TarjetaConvenio';
import { usePerfil } from '@/contexto/ContextoPerfil';
import { useSesion } from '@/contexto/ContextoSesion';
import { useConexion } from '@/utils/useConexion';
import { esErrorApi } from '@/services/api';
import { ultimosFirmados } from '@/services/convenios.service';
import { cargarConvenios } from '@/services/pendientes.service';
import { revisarNotificacionesAhora } from '@/services/segundoPlano.service';
import { useTema } from '@/tema/ProveedorTema';
import { Convenio } from '@/types/convenio';
import { formatearFechaHora } from '@/utils/fechas';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Button, RefreshControl, ScrollView, View } from 'react-native';

export default function Inicio() {
    const { colores } = useTema();
    const router = useRouter();
    const { token, usuario, cerrarSesion } = useSesion();
    const enLinea = useConexion();

    const { fotoUri } = usePerfil();
    const [consulta, setConsulta] = useState('');

    const [primeraCarga, setPrimeraCarga] = useState(true);
    const [refrescando, setRefrescando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [porFirmar, setPorFirmar] = useState<Convenio[]>([]);
    const [firmados, setFirmados] = useState<Convenio[]>([]);
    const [sinConexion, setSinConexion] = useState(false);
    const [guardadoEn, setGuardadoEn] = useState<string | null>(null);

    // Sin red del celular, o sin respuesta del servidor
    const sinInternet = sinConexion || !enLinea;

    const cargar = useCallback(async () => {
        try {
            const r = await cargarConvenios(token, usuario?.id ?? 0);
            setPorFirmar(r.pendientes);
            setFirmados(r.todos ? ultimosFirmados(r.todos, 3) : []);
            setSinConexion(r.sinConexion);
            setGuardadoEn(r.guardadoEn);
            setError(null);
        } catch (e) {
            if (esErrorApi(e) && e.estado === 401) {
                await cerrarSesion(); // sesión vencida: vuelve al login
                return;
            }
            setError(e instanceof Error ? e.message : 'No se pudo cargar la información.');
        } finally {
            setPrimeraCarga(false);
            setRefrescando(false);
        }
    }, [token, usuario?.id]);

    // Recarga cada vez que la pantalla vuelve a estar en foco o cambia la conexión.
    useFocusEffect(
        useCallback(() => {
            cargar();
        }, [cargar, enLinea]),
    );

    const abrir = (c: Convenio) => router.push({ pathname: '/convenio/[id]', params: { id: String(c.id) } });

    const tarjetaVacia = (mensaje: string) => (
        <View style={{ backgroundColor: colores.surface, borderRadius: 14, borderWidth: 1, borderColor: colores.border, padding: 16 }}>
            <Texto variante="subtitulo">{mensaje}</Texto>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
        <View style={{ position: 'absolute', bottom: 24, right: 16, zIndex: 10 }}>
            <Button title="PROBAR AVISO" onPress={() => revisarNotificacionesAhora()} />    
        </View>
            <EncabezadoPantalla
                titulo={`Hola, ${usuario?.nombre ?? 'decano'}`}
                subtitulo="Decanato · Facultad de Ingeniería"
                accion={{
                    contenido: <Avatar uri={fotoUri} nombre={usuario?.nombre ?? ''} tamano={36} />,
                    etiqueta: 'Perfil y ajustes',
                    onPress: () => router.push('/perfil'),
                }}
                ayuda="inicio"
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                        <CampoBusqueda
                            valor={consulta}
                            onCambio={setConsulta}
                            onEnviar={() => router.push({ pathname: '/buscar', params: { q: consulta.trim() } })}
                        />
                    </View>
                    <CampanaNotificaciones onPress={() => router.push('/notificaciones')} />
                </View>
            </EncabezadoPantalla>

            {primeraCarga ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colores.primary} accessibilityLabel="Cargando" />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refrescando}
                            onRefresh={() => {
                                setRefrescando(true);
                                cargar();
                            }}
                            tintColor={colores.primary}
                            colors={[colores.primary]}
                        />
                    }
                >
                    {error ? (
                        <View style={{ backgroundColor: colores.surface, borderRadius: 14, borderWidth: 1, borderColor: colores.border, padding: 16, gap: 12 }}>
                            <Texto variante="error" accessibilityLiveRegion="polite">{error}</Texto>
                            <Boton
                                titulo="Reintentar"
                                variante="contorno"
                                tamano="chico"
                                onPress={() => {
                                    setPrimeraCarga(true);
                                    cargar();
                                }}
                            />
                        </View>
                    ) : (
                        <>
                            {sinInternet ? (
                                <AvisoSinConexion
                                    mensaje={
                                        guardadoEn
                                            ? `Solo ves los convenios pendientes de firma, guardados el ${formatearFechaHora(guardadoEn)}.`
                                            : 'Solo se muestran los convenios pendientes de firma guardados en este celular.'
                                    }
                                />
                            ) : null}

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Texto variante="etiqueta" style={{ fontSize: 18 }} accessibilityRole="header">Para firmar</Texto>
                                <Insignia texto={String(porFirmar.length)} tono="info" />
                            </View>
                            <Texto variante="subtitulo">Convenios aprobados que esperan tu firma.</Texto>

                            {porFirmar.length === 0
                                ? tarjetaVacia(
                                      sinInternet
                                          ? 'No hay convenios pendientes guardados. Conectate a internet para actualizarlos.'
                                          : 'No hay convenios pendientes de firma.',
                                  )
                                : porFirmar.map((c) => <TarjetaConvenio key={c.id} convenio={c} onAbrir={() => abrir(c)} />)}

                            {!sinInternet ? (
                                <>
                                    <Texto variante="etiqueta" style={{ fontSize: 18, marginTop: 8 }} accessibilityRole="header">
                                        Últimos firmados
                                    </Texto>

                                    {firmados.length === 0
                                        ? tarjetaVacia('Todavía no hay convenios firmados.')
                                        : firmados.map((c) => <FilaConvenioFirmado key={c.id} convenio={c} onAbrir={() => abrir(c)} />)}
                                </>
                            ) : null}
                        </>
                    )}
                </ScrollView>
            )}
        </View>
    );
}