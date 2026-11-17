import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';
import { useTema } from '@/tema/ProveedorTema';

type Props = {
    valor: string;
    onCambio: (texto: string) => void;
    onEnviar?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
};

export function CampoBusqueda({ valor, onCambio, onEnviar, placeholder = 'Buscar por título o código', autoFocus }: Props) {
    const { colores, escala } = useTema();

    return (
        <View
        style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            minHeight: 46,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: colores.inputBg,
            borderWidth: 1,
            borderColor: colores.border,
        }}
        >
        <Ionicons name="search" size={20} color={colores.textMuted} />
        <TextInput
            value={valor}
            onChangeText={onCambio}
            onSubmitEditing={onEnviar}
            placeholder={placeholder}
            placeholderTextColor={colores.textMuted}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={autoFocus}
            accessibilityLabel="Buscar convenios"
            style={{ flex: 1, fontSize: 16 * escala, color: colores.text, paddingVertical: 8 }}
        />
        {valor ? (
            <Pressable onPress={() => onCambio('')} accessibilityRole="button" accessibilityLabel="Borrar búsqueda" hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={colores.textMuted} />
            </Pressable>
        ) : null}
        </View>
    );
}