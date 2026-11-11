import { View } from 'react-native';
import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { useSesion } from '@/contexto/ContextoSesion';
import { useTema } from '@/tema/ProveedorTema';

export default function Inicio() {
    const { colores, esOscuro, cambiarModo } = useTema();
    const { cerrarSesion } = useSesion();

    return (
        <View style={{ flex: 1, backgroundColor: colores.background, padding: 24, gap: 16, justifyContent: 'center' }}>
        <Texto variante="titulo">Bienvenido, decano</Texto>
        <Boton
            titulo={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            onPress={() => cambiarModo(esOscuro ? 'claro' : 'oscuro')}
        />
        <Boton titulo="Cerrar sesión" onPress={cerrarSesion} />
        </View>
    );
}