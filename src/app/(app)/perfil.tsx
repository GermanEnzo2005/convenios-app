import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { useSesion } from '@/contexto/ContextoSesion';
import { useTema } from '@/tema/ProveedorTema';

const OPCIONES = [
    ['claro', 'Claro'],
    ['oscuro', 'Oscuro'],
    ['sistema', 'Automático'],
] as const;

export default function Perfil() {
    const { colores, modo, cambiarModo } = useTema();
    const { cerrarSesion } = useSesion();
    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
        <EncabezadoPantalla titulo="Perfil y ajustes" onVolver={() => router.back()} />
        <View style={{ padding: 20, gap: 16 }}>
            <Texto variante="etiqueta" style={{ fontSize: 16 }}>
            Apariencia
            </Texto>
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
            <Boton titulo="Cerrar sesión" variante="contorno" onPress={cerrarSesion} />
        </View>
        </View>
    );
}