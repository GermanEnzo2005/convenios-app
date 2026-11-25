import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { PantallaSinConexion } from '@/componentes/compartidos/PantallaSinConexion';
import { useSesion } from '@/contexto/ContextoSesion';
import { useConexion } from '@/utils/useConexion';
import { esErrorApi } from '@/services/api';
import { Comentario, crearComentario, obtenerComentarios } from '@/services/comentarios.service';
import { useTema } from '@/tema/ProveedorTema';
import { formatearFechaHora } from '@/utils/fechas';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';

export default function Comentarios() {
    const { colores } = useTema();
    const router = useRouter();
    const { token, cerrarSesion } = useSesion();
    const { id, codigo } = useLocalSearchParams<{ id: string; codigo: string }>();

    const listaRef = useRef<FlatList<Comentario>>(null);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [texto, setTexto] = useState('');
    const [enviando, setEnviando] = useState(false);
    const enLinea = useConexion();

    const cargar = useCallback(async () => {
        setError(null);
        try {
            setComentarios(await obtenerComentarios(token, Number(id)));
        } catch (e) {
            if (esErrorApi(e) && e.estado === 401) {
                await cerrarSesion();
                return;
            }
            setError(
                esErrorApi(e) && e.estado === 0
                    ? 'Sin conexión: los comentarios no están disponibles sin internet.'
                    : e instanceof Error ? e.message : 'No se pudieron cargar los comentarios.',
            );
        } finally {
            setCargando(false);
        }
    }, [id, token]);

    useFocusEffect(useCallback(() => { if (enLinea) cargar(); }, [cargar, enLinea]));

    const enviar = async () => {
        const limpio = texto.trim();
        if (!limpio || enviando) return;
        setEnviando(true);
        try {
            const nuevo = await crearComentario(token, Number(id), limpio);
            setComentarios((prev) => [...prev, nuevo]);
            setTexto('');
            setTimeout(() => listaRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (e) {
            if (esErrorApi(e) && e.estado === 401) {
                await cerrarSesion();
                return;
            }
            Alert.alert(
                'No se pudo comentar',
                esErrorApi(e) && e.estado === 0
                    ? 'Sin conexión: no se puede comentar sin internet.'
                    : e instanceof Error ? e.message : 'Error desconocido',
            );
        } finally {
            setEnviando(false);
        }
    };

    if (!enLinea) {
        return (
            <PantallaSinConexion titulo="Comentarios" subtitulo={codigo}
                mensaje="Sin internet no podés ver ni escribir comentarios." onVolver={() => router.back()} />
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colores.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <EncabezadoPantalla titulo="Comentarios" subtitulo={codigo} onVolver={() => router.back()} ayuda="comentarios" />

            {cargando ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colores.primary} accessibilityLabel="Cargando" />
                </View>
            ) : error ? (
                <View style={{ padding: 16, gap: 12 }}>
                    <Texto variante="error" accessibilityLiveRegion="polite">{error}</Texto>
                    <Boton titulo="Reintentar" variante="contorno" tamano="chico" onPress={cargar} />
                </View>
            ) : (
                <FlatList
                    ref={listaRef}
                    data={comentarios}
                    keyExtractor={(c) => String(c.id)}
                    contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
                    ListEmptyComponent={
                        <Texto variante="subtitulo">Todavía no hay comentarios en este convenio.</Texto>
                    }
                    onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: false })}
                    renderItem={({ item }) => (
                        <View
                            style={{
                                alignSelf: 'flex-start',
                                maxWidth: '85%',
                                backgroundColor: colores.surface,
                                borderRadius: 14,
                                borderWidth: 1,
                                borderColor: item.esMio ? colores.primary : colores.border,
                                padding: 10,
                                gap: 2,
                            }}
                        >
                            <Texto variante="etiqueta">
                                {item.esMio ? 'Vos' : item.autor}
                                {item.rol ? ` · ${item.rol}` : ''}
                            </Texto>
                            <Texto
                                variante="subtitulo"
                                style={item.ofensivo ? { fontStyle: 'italic', opacity: 0.7 } : undefined}
                            >
                                {item.ofensivo ? 'Comentario ofensivo' : item.texto}
                            </Texto>
                            <Texto variante="nota">{formatearFechaHora(item.fecha)}</Texto>
                        </View>
                    )}
                />
            )}

            {!cargando && !error ? (
                <View style={{ flexDirection: 'row', gap: 8, padding: 12, alignItems: 'flex-end' }}>
                    <TextInput
                        value={texto}
                        onChangeText={setTexto}
                        placeholder="Escribí un comentario…"
                        placeholderTextColor={colores.border}
                        multiline
                        maxLength={500}
                        style={{
                            flex: 1,
                            maxHeight: 100,
                            borderWidth: 1,
                            borderColor: colores.border,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            color: colores.text,
                            backgroundColor: colores.surface,
                        }}
                        accessibilityLabel="Escribir comentario"
                    />
                    <Boton titulo="Enviar" tamano="chico" onPress={enviar} cargando={enviando} />
                </View>
            ) : null}
        </KeyboardAvoidingView>
    );
}