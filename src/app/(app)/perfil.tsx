import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { FilaDato } from '@/componentes/convenio/FilaDato';
import { SeccionDetalle } from '@/componentes/convenio/SeccionDetalle';
import { useSesion } from '@/contexto/ContextoSesion';
import { useTema } from '@/tema/ProveedorTema';

const OPCIONES = [
    ['claro', 'Claro'],
    ['oscuro', 'Oscuro'],
    ['sistema', 'Del celular'],
] as const;

const iniciales = (nombre: string) =>
    nombre
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join('');

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

export default function Perfil() {
    const { colores, modo, cambiarModo } = useTema();
    const { usuario, cerrarSesion } = useSesion();
    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
        <EncabezadoPantalla titulo="Perfil y ajustes" onVolver={() => router.back()} />

        <ScrollView contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}>
            <View style={{ alignItems: 'center', gap: 8 }}>
            <View
                accessibilityRole="image"
                accessibilityLabel="Avatar con las iniciales del usuario"
                style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colores.primary, alignItems: 'center', justifyContent: 'center' }}
            >
                <Texto variante="titulo" color={colores.primaryText}>
                {usuario ? iniciales(usuario.nombre) : '?'}
                </Texto>
            </View>
            <Texto variante="etiqueta" style={{ fontSize: 18 }}>
                {usuario?.nombre ?? 'Usuario'}
            </Texto>
            <Texto variante="subtitulo">{usuario ? capitalizar(usuario.rol) : ''}</Texto>
            </View>

            <SeccionDetalle titulo="Datos de la cuenta">
            <FilaDato etiqueta="Nombre" valor={usuario?.nombre ?? '—'} />
            <FilaDato etiqueta="Correo" valor={usuario?.correo ?? '—'} />
            <FilaDato etiqueta="Teléfono" valor={usuario?.telefono ?? 'Sin dato'} />
            <FilaDato etiqueta="Rol" valor={usuario ? capitalizar(usuario.rol) : '—'} />
            </SeccionDetalle>

            <SeccionDetalle titulo="Apariencia">
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {OPCIONES.map(([valor, etiqueta]) => (
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

            <Boton titulo="Cerrar sesión" variante="contorno" onPress={cerrarSesion} />
        </ScrollView>
        </View>
    );
}