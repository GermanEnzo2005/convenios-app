import { useState } from 'react';
import { View } from 'react-native';
import { CampoTexto } from '../atomos/CampoTexto';
import { TextoBoton } from '../atomos/TextoBoton';
import { CampoFormulario } from './CampoFormulario';

type Props = { etiqueta: string; valor: string; onChangeText: (t: string) => void; error?: string };

export function CampoContrasena({ etiqueta, valor, onChangeText, error }: Props) {
    const [visible, setVisible] = useState(false);

    return (
        <CampoFormulario etiqueta={etiqueta} error={error}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <CampoTexto
            value={valor}
            onChangeText={onChangeText}
            placeholder="Tu contraseña"
            secureTextEntry={!visible}
            autoCapitalize="none"
            autoCorrect={false}
            tieneError={!!error}
            accessibilityLabel={etiqueta}
            />
            <TextoBoton
            titulo={visible ? 'Ocultar' : 'Mostrar'}
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setVisible((v) => !v)}
            />
        </View>
        </CampoFormulario>
    );
}