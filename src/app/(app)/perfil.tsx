import { Alert, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { Avatar } from '@/componentes/compartidos/Avatar';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { FilaDato } from '@/componentes/convenio/FilaDato';
import { SeccionDetalle } from '@/componentes/convenio/SeccionDetalle';
import { usePerfil } from '@/contexto/ContextoPerfil';
import { useSesion } from '@/contexto/ContextoSesion';
import { useTema } from '@/tema/ProveedorTema';

const MODOS = [
    ['claro', 'Claro'],
    ['oscuro', 'Oscuro'],
    ['sistema', 'Del celular'],
] as const;

const TAMANOS = [
    ['chica', 'Chica'],
    ['mediana', 'Mediana'],
    ['grande', 'Grande'],
] as const;

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

export default function Perfil() {
    const { colores, modo, cambiarModo, tamanoFuente, cambiarTamanoFuente } = useTema();
    const { usuario, cerrarSesion } = useSesion();
    const { fotoUri, elegirFoto, quitarFoto } = usePerfil();
    const router = useRouter();

    const cambiarFoto = async (origen: 'galeria' | 'camara') => {
        try {
        await elegirFoto(origen);
        } catch (e) {
        Alert.alert('No se pudo cambiar la foto', e instanceof Error ? e.message : 'Intentá de nuevo.');
        }
    };

    const confirmarQuitar = () => {
        Alert.alert('Quitar foto', '¿Querés quitar tu foto de perfil?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Quitar', style: 'destructive', onPress: () => void quitarFoto() },
        ]);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
        <EncabezadoPantalla titulo="Perfil y ajustes" onVolver={() => router.back()} ayuda="perfil" />

        <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}>
            <View style={{ alignItems: 'center', gap: 8 }}>
            <Avatar uri={fotoUri} nombre={usuario?.nombre ?? ''} tamano={96} />
            <Texto variante="etiqueta" style={{ fontSize: 18 }}>
                {usuario?.nombre ?? 'Usuario'}
            </Texto>
            <Texto variante="subtitulo">{usuario ? capitalizar(usuario.rol) : ''}</Texto>
            </View>

            <SeccionDetalle titulo="Foto de perfil">
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                <Boton titulo="Galería" tamano="chico" variante="contorno" onPress={() => cambiarFoto('galeria')} />
                </View>
                <View style={{ flex: 1 }}>
                <Boton titulo="Cámara" tamano="chico" variante="contorno" onPress={() => cambiarFoto('camara')} />
                </View>
            </View>
            {fotoUri ? <Boton titulo="Quitar foto" tamano="chico" variante="contorno" onPress={confirmarQuitar} /> : null}
            <Texto variante="nota">La foto se guarda en este celular. Al elegir una nueva, se reemplaza la anterior.</Texto>
            </SeccionDetalle>

            <SeccionDetalle titulo="Datos de la cuenta">
            <FilaDato etiqueta="Nombre" valor={usuario?.nombre ?? '—'} />
            <FilaDato etiqueta="Correo" valor={usuario?.correo ?? '—'} />
            <FilaDato etiqueta="Teléfono" valor={usuario?.telefono ?? 'Sin dato'} />
            <FilaDato etiqueta="Rol" valor={usuario ? capitalizar(usuario.rol) : '—'} />
            </SeccionDetalle>

            <SeccionDetalle titulo="Modo de pantalla">
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {MODOS.map(([valor, etiqueta]) => (
                <View key={valor} style={{ flex: 1 }}>
                    <Boton
                    titulo={etiqueta}
                    tamano="chico"
                    variante={modo === valor ? 'primario' : 'contorno'}
                    onPress={() => cambiarModo(valor)}
                    />
                </View>
                ))}
            </View>
            <Texto variante="nota">
                «Del celular» sigue el modo claro u oscuro de tu teléfono y cambia solo cuando vos lo cambiás en los ajustes del celular.
            </Texto>
            </SeccionDetalle>

            <SeccionDetalle titulo="Tamaño de letra">
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {TAMANOS.map(([valor, etiqueta]) => (
                <View key={valor} style={{ flex: 1 }}>
                    <Boton
                    titulo={etiqueta}
                    tamano="chico"
                    variante={tamanoFuente === valor ? 'primario' : 'contorno'}
                    onPress={() => cambiarTamanoFuente(valor)}
                    />
                </View>
                ))}
            </View>
            <Texto>Así se ve el texto de la app con este tamaño.</Texto>
            </SeccionDetalle>

            <SeccionDetalle titulo="Ayuda">
                <Boton titulo="Manual de usuario" variante="contorno" onPress={() => router.push('/ayuda')} />
                <Texto variante="nota">
                    Guías paso a paso para registrar tu identidad y firmar un convenio.
                </Texto>
            </SeccionDetalle>

            <Boton titulo="Cerrar sesión" variante="contorno" onPress={cerrarSesion} />
        </ScrollView>
        </View>
    );
}