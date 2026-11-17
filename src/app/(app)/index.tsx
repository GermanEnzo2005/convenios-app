import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { Insignia } from '@/componentes/compartidos/Insignia';
import { FilaConvenioFirmado } from '@/componentes/inicio/FilaConvenioFirmado';
import { TarjetaConvenio } from '@/componentes/inicio/TarjetaConvenio';
import { useSesion } from '@/contexto/ContextoSesion';
import { esErrorApi } from '@/services/api';
import { obtenerConvenios, pendientesDeFirma, ultimosFirmados } from '@/services/convenios.service';
import { useTema } from '@/tema/ProveedorTema';
import { Convenio } from '@/types/convenio';
import { CampoBusqueda } from '@/componentes/compartidos/CampoBusqueda';
import { Avatar } from '@/componentes/compartidos/Avatar';
import { usePerfil } from '@/contexto/ContextoPerfil';
import { CampanaNotificaciones } from '@/componentes/compartidos/CampanaNotificaciones';

export default function Inicio() {
    const { colores } = useTema();
    const router = useRouter();
    const { token, usuario, cerrarSesion } = useSesion();
    const { fotoUri } = usePerfil();
    const [consulta, setConsulta] = useState('');
    
    const [primeraCarga, setPrimeraCarga] = useState(true);
    const [refrescando, setRefrescando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [porFirmar, setPorFirmar] = useState<Convenio[]>([]);
    const [firmados, setFirmados] = useState<Convenio[]>([]);

    const cargar = useCallback(async () => {
        try {
        const todos = await obtenerConvenios(token);
        setPorFirmar(pendientesDeFirma(todos));
        setFirmados(ultimosFirmados(todos, 3));
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
    }, [token]);

    // Recarga cada vez que la pantalla vuelve a estar en foco.
    useFocusEffect(
        useCallback(() => {
        cargar();
        }, [cargar]),
    );

    const abrir = (c: Convenio) => router.push({ pathname: '/convenio/[id]', params: { id: String(c.id) } });

    const tarjetaVacia = (mensaje: string) => (
        <View style={{ backgroundColor: colores.surface, borderRadius: 14, borderWidth: 1, borderColor: colores.border, padding: 16 }}>
        <Texto variante="subtitulo">{mensaje}</Texto>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
        <EncabezadoPantalla
            titulo={`Hola, ${usuario?.nombre ?? 'decano'}`}
            subtitulo="Decanato · Facultad de Ingeniería"
            accion={{
            contenido: <Avatar uri={fotoUri} nombre={usuario?.nombre ?? ''} tamano={36} />,
            etiqueta: 'Perfil y ajustes',
            onPress: () => router.push('/perfil'),
            }}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Texto variante="etiqueta" style={{ fontSize: 18 }} accessibilityRole="header">Para firmar</Texto>
                    <Insignia texto={String(porFirmar.length)} tono="info" />
                </View>
                <Texto variante="subtitulo">Convenios aprobados que esperan tu firma.</Texto>

                {porFirmar.length === 0
                    ? tarjetaVacia('No hay convenios pendientes de firma.')
                    : porFirmar.map((c) => <TarjetaConvenio key={c.id} convenio={c} onAbrir={() => abrir(c)} />)}

                <Texto variante="etiqueta" style={{ fontSize: 18, marginTop: 8 }} accessibilityRole="header">
                    Últimos firmados
                </Texto>

                {firmados.length === 0
                    ? tarjetaVacia('Todavía no hay convenios firmados.')
                    : firmados.map((c) => <FilaConvenioFirmado key={c.id} convenio={c} onAbrir={() => abrir(c)} />)}
                </>
            )}
            </ScrollView>
        )}
        </View>
    );
}