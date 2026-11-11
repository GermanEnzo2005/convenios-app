import { useState } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';

export function CampoTexto({ tieneError, style, ...resto }: TextInputProps & { tieneError?: boolean }) {
    const { colores } = useTema();
    const [enfocado, setEnfocado] = useState(false);

    return (
        <TextInput
        {...resto}
        onFocus={(e) => {
            setEnfocado(true);
            resto.onFocus?.(e);
        }}
        onBlur={(e) => {
            setEnfocado(false);
            resto.onBlur?.(e);
        }}
        placeholderTextColor={colores.textMuted}
        style={[
            {
            flex: 1,
            minHeight: 48,
            paddingHorizontal: 14,
            fontSize: 16,
            color: colores.text,
            backgroundColor: colores.inputBg,
            borderRadius: 12,
            borderWidth: enfocado ? 2 : 1,
            borderColor: tieneError ? colores.error : enfocado ? colores.primary : colores.border,
            },
            style,
        ]}
        />
    );
}