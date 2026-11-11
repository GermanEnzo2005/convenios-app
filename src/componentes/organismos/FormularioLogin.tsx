import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Boton } from '../atomos/Boton';
import { CampoTexto } from '../atomos/CampoTexto';
import { Texto } from '../atomos/Texto';
import { CampoContrasena } from '../moleculas/CampoContrasena';
import { CampoFormulario } from '../moleculas/CampoFormulario';

type Props = { onSubmit: (usuario: string, contrasena: string) => Promise<void> };

export function FormularioLogin({ onSubmit }: Props) {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [errores, setErrores] = useState<{ usuario?: string; contrasena?: string }>({});
    const [cargando, setCargando] = useState(false);

    const enviar = async () => {
        const nuevos: typeof errores = {};
        if (!usuario.trim()) nuevos.usuario = 'Ingresá tu usuario o correo.';
        if (!contrasena) nuevos.contrasena = 'Ingresá tu contraseña.';
        setErrores(nuevos);
        if (Object.keys(nuevos).length) return;

        setCargando(true);
        try {
        await onSubmit(usuario.trim(), contrasena);
        } catch (err) {
        Alert.alert('No se pudo iniciar sesión', err instanceof Error ? err.message : 'Error desconocido');
        } finally {
        setCargando(false);
        }
    };

    return (
        <View style={{ padding: 24, gap: 18 }}>
        <View style={{ gap: 4 }}>
            <Texto variante="titulo">Iniciar sesión</Texto>
            <Texto variante="subtitulo">Ingresá con tu cuenta institucional.</Texto>
        </View>

        <CampoFormulario etiqueta="Usuario o correo" error={errores.usuario}>
            <View style={{ flexDirection: 'row' }}>
            <CampoTexto
                value={usuario}
                onChangeText={setUsuario}
                placeholder="nombre@unlpam.edu.ar"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                tieneError={!!errores.usuario}
                accessibilityLabel="Usuario o correo"
            />
            </View>
        </CampoFormulario>

        <CampoContrasena etiqueta="Contraseña" valor={contrasena} onChangeText={setContrasena} error={errores.contrasena} />

        <Boton titulo="Ingresar" onPress={enviar} cargando={cargando} />

        <Texto variante="nota" style={{ textAlign: 'center' }}>
            ¿Olvidaste tu contraseña? Contactá al administrador.
        </Texto>
        </View>
    );
}