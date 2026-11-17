import { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Boton } from '@/componentes/atomos/Boton';
import { CampoTexto } from '@/componentes/atomos/CampoTexto';
import { Texto } from '@/componentes/atomos/Texto';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { useSesion } from '@/contexto/ContextoSesion';
import { esErrorApi } from '@/services/api';
import { reenviarCodigo, verificarCodigo } from '@/services/verificacion.service';
import { useTema } from '@/tema/ProveedorTema';

const ESPERA_REENVIO_MS = 45 * 1000; // igual que en el servicio de verificación

const formatear = (segundos: number) =>
    `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;

export default function PantallaVerificar() {
    const { colores } = useTema();
    const router = useRouter();
    const { completarSesion } = useSesion();
    const { desafioId, correo, email, venceEn: venceEnParam } = useLocalSearchParams<{
        desafioId: string;
        correo: string;
        email: string;
        venceEn: string;
    }>();

    const [codigo, setCodigo] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [verificando, setVerificando] = useState(false);
    const [reenviando, setReenviando] = useState(false);
    const [venceEn, setVenceEn] = useState(Number(venceEnParam));
    const [proximoReenvio, setProximoReenvio] = useState(Date.now() + ESPERA_REENVIO_MS);
    const [ahora, setAhora] = useState(Date.now());

    useEffect(() => {
        const intervalo = setInterval(() => setAhora(Date.now()), 1000);
        return () => clearInterval(intervalo);
    }, []);

    const segundosRestantes = Math.max(Math.ceil((venceEn - ahora) / 1000), 0);
    const esperaReenvio = Math.max(Math.ceil((proximoReenvio - ahora) / 1000), 0);
    const vencido = segundosRestantes === 0;

const verificar = async () => {
    Keyboard.dismiss(); // cierra el teclado antes de navegar, para que el inicio se dibuje completo
    setError(null);
    setVerificando(true);
    try {
        const { token, usuario } = await verificarCodigo(desafioId ?? '', codigo);
        await completarSesion(token, email ?? '', usuario);
        await new Promise((r) => setTimeout(r, 300)); // da tiempo a que el teclado termine de cerrarse
        router.replace('/');
    } catch (e) {
        if (esErrorApi(e) && e.estado === 404) {
        Alert.alert('Verificación vencida', e.message, [{ text: 'Aceptar', onPress: () => router.replace('/login') }]);
        return;
        }
        setError(e instanceof Error ? e.message : 'No se pudo verificar el código.');
    } finally {
        setVerificando(false);
    }
};

    const reenviar = async () => {
        setError(null);
        setReenviando(true);
        try {
        const respuesta = await reenviarCodigo(desafioId ?? '');
        setVenceEn(Date.now() + respuesta.venceEnSegundos * 1000);
        setProximoReenvio(Date.now() + ESPERA_REENVIO_MS);
        setCodigo('');
        Alert.alert('Código reenviado', 'Te enviamos un código nuevo. El anterior ya no sirve.');
        } catch (e) {
        if (esErrorApi(e) && e.estado === 404) {
            Alert.alert('Verificación vencida', e.message, [{ text: 'Aceptar', onPress: () => router.replace('/login') }]);
            return;
        }
        setError(e instanceof Error ? e.message : 'No se pudo reenviar el código.');
        } finally {
        setReenviando(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
        <EncabezadoPantalla titulo="Verificá tu identidad" subtitulo="Segundo paso" onVolver={() => router.back()} />

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, gap: 18 }}>
            <Texto>
                Te enviamos un código de 6 dígitos a <Texto variante="etiqueta">{correo}</Texto>. Ingresalo para continuar.
            </Texto>

            <View style={{ gap: 6 }}>
                <Texto variante="etiqueta">Código de verificación</Texto>
                <View style={{ flexDirection: 'row' }}>
                <CampoTexto
                    value={codigo}
                    onChangeText={(t) => setCodigo(t.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    keyboardType="number-pad"
                    maxLength={6}
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                    tieneError={!!error}
                    accessibilityLabel="Código de verificación de 6 dígitos"
                    style={{ fontSize: 28, letterSpacing: 8, textAlign: 'center' }}
                />
                </View>
                {error ? (
                <Texto variante="error" accessibilityLiveRegion="polite">
                    {error}
                </Texto>
                ) : null}
            </View>

            <Texto variante="subtitulo">
                {vencido ? 'El código venció. Pedí uno nuevo.' : `El código vence en ${formatear(segundosRestantes)}.`}
            </Texto>

            <Boton titulo="Verificar" onPress={verificar} cargando={verificando} deshabilitado={codigo.length !== 6 || vencido} />

            <Boton
                titulo={esperaReenvio > 0 ? `Reenviar código (${esperaReenvio} s)` : 'Reenviar código'}
                variante="contorno"
                onPress={reenviar}
                cargando={reenviando}
                deshabilitado={esperaReenvio > 0}
            />
            </ScrollView>
        </KeyboardAvoidingView>
        </View>
    );
}