import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { EncabezadoLogin } from '@/componentes/organismos/EncabezadoLogin';
import { FormularioLogin } from '@/componentes/organismos/FormularioLogin';
import { useSesion } from '@/contexto/ContextoSesion';
import { iniciarVerificacion } from '@/services/verificacion.service';
import { useTema } from '@/tema/ProveedorTema';

export default function PantallaLogin() {
    const { colores } = useTema();
    const { token } = useSesion();
    const router = useRouter();

    if (token) return <Redirect href="/" />;

    // Paso 1: correo y contraseña. Si son correctos, el servicio envía un código por correo.
    const iniciar = async (correo: string, contrasena: string) => {
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
            <FormularioLogin onSubmit={iniciar} />
        </ScrollView>
        </KeyboardAvoidingView>
    );
}