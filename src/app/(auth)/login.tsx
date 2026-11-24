import { AvisoSinConexion } from '@/componentes/compartidos/AvisoSinConexion';
import { EncabezadoLogin } from '@/componentes/organismos/EncabezadoLogin';
import { FormularioLogin } from '@/componentes/organismos/FormularioLogin';
import { useSesion } from '@/contexto/ContextoSesion';
import { useConexion } from '@/hooks/useConexion';
import { iniciarVerificacion } from '@/services/verificacion.service';
import { useTema } from '@/tema/ProveedorTema';
import { Redirect, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function PantallaLogin() {
    const { colores } = useTema();
    const { token } = useSesion();
    const router = useRouter();
    const enLinea = useConexion();


    if (token) return <Redirect href="/" />;

    // Paso 1: correo y contraseña. Si son correctos, el servicio envía un código por correo.
    const iniciar = async (correo: string, contrasena: string) => {
        if (!enLinea) throw new Error('Estás sin conexión. Necesitás internet para iniciar sesión.');
        const desafio = await iniciarVerificacion(correo, contrasena);
        router.push({
        pathname: '/verificar',
        params: {
            desafioId: desafio.desafioId,
            correo: desafio.correo,
            email: correo,
            venceEn: String(Date.now() + desafio.venceEnSegundos * 1000),
        },
        });
    };

    return (
        <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colores.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
            <EncabezadoLogin />
            {!enLinea ? (
                <View style={{ margin: 16 }}>
                    <AvisoSinConexion mensaje="Necesitás internet para iniciar sesión. Si ya habías ingresado antes, tu sesión sigue activa." />
                </View>
            ) : null}
            <FormularioLogin onSubmit={iniciar} />
        </ScrollView>
        </KeyboardAvoidingView>
    );
}