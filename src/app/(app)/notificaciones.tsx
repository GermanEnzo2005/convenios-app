import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Texto } from '@/componentes/atomos/Texto';
import { TextoBoton } from '@/componentes/atomos/TextoBoton';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { useNotificaciones } from '@/contexto/ContextoNotificaciones';
import { useTema } from '@/tema/ProveedorTema';
import { Notificacion } from '@/types/notificacion';

const ICONOS: Record<string, keyof typeof Ionicons.glyphMap> = {
    nuevo_convenio: 'add-circle-outline',
    cambio_datos: 'create-outline',
    cancelado: 'close-circle-outline',
    comentario: 'chatbubble-outline',
};

function formatearFechaHora(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function Notificaciones() {
    const { colores } = useTema();
    const router = useRouter();
    const { notificaciones, noLeidas, error, refrescar, marcarLeida, marcarTodas } = useNotificaciones();
    const [refrescando, setRefrescando] = useState(false);

    const abrir = async (n: Notificacion) => {
        await marcarLeida(n.id);
        if (n.convenioId) {
        router.push({ pathname: '/convenio/[id]', params: { id: String(n.convenioId) } });
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
        <EncabezadoPantalla
            titulo="Notificaciones"
            subtitulo={noLeidas > 0 ? `${noLeidas} sin leer` : 'Estás al día'}
            onVolver={() => router.back()}
        />

        <ScrollView
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
            refreshControl={
            <RefreshControl
                refreshing={refrescando}
                onRefresh={async () => {
                setRefrescando(true);
                await refrescar();
                setRefrescando(false);
                }}
                tintColor={colores.primary}
                colors={[colores.primary]}
            />
            }
        >
            {noLeidas > 0 ? (
            <View style={{ alignItems: 'flex-start' }}>
                <TextoBoton titulo="Marcar todas como leídas" onPress={marcarTodas} />
            </View>
            ) : null}

            {error ? (
            <Texto variante="error" accessibilityLiveRegion="polite">
                {error}
            </Texto>
            ) : null}

            {notificaciones.length === 0 ? (
            <View style={{ backgroundColor: colores.surface, borderRadius: 14, borderWidth: 1, borderColor: colores.border, padding: 16 }}>
                <Texto variante="subtitulo">Todavía no tenés notificaciones.</Texto>
            </View>
            ) : (
            notificaciones.map((n) => (
                <Pressable
                key={n.id}
                onPress={() => abrir(n)}
                accessibilityRole="button"
                accessibilityLabel={`${n.leida ? '' : 'Sin leer. '}${n.titulo}. ${n.mensaje}`}
                style={({ pressed }) => ({
                    flexDirection: 'row',
                    gap: 12,
                    padding: 14,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: n.leida ? colores.border : colores.primary,
                    backgroundColor: n.leida ? colores.surface : colores.infoBg,
                    opacity: pressed ? 0.85 : 1,
                })}
                >
                <Ionicons name={ICONOS[n.tipo] ?? 'notifications-outline'} size={26} color={colores.primary} />
                <View style={{ flex: 1, gap: 2 }}>
                    <Texto variante="etiqueta" style={{ fontSize: n.leida ? 14 : 15 }}>
                    {n.titulo}
                    </Texto>
                    <Texto variante="subtitulo">{n.mensaje}</Texto>
                    <Texto variante="nota">{formatearFechaHora(n.creadaEn)}</Texto>
                </View>
                </Pressable>
            ))
            )}
        </ScrollView>
        </View>
    );
}