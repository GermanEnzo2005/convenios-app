import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Redirect } from 'expo-router';
import { EncabezadoLogin } from '@/componentes/organismos/EncabezadoLogin';
import { FormularioLogin } from '@/componentes/organismos/FormularioLogin';
import { useSesion } from '@/contexto/ContextoSesion';
import { useTema } from '@/tema/ProveedorTema';

export default function PantallaLogin() {
    const { colores } = useTema();
    const { token, iniciarSesion } = useSesion();

    if (token) return <Redirect href="/" />;

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colores.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
            <EncabezadoLogin />
            <FormularioLogin onSubmit={iniciarSesion} />
        </ScrollView>
        </KeyboardAvoidingView>
    );
}