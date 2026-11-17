import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { useNotificaciones } from '@/contexto/ContextoNotificaciones';
import { useTema } from '@/tema/ProveedorTema';
import { Texto } from '../atomos/Texto';

export function CampanaNotificaciones({ onPress }: { onPress: () => void }) {
    const { colores } = useTema();
    const { noLeidas } = useNotificaciones();

    return (
        <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={noLeidas > 0 ? `Notificaciones, ${noLeidas} sin leer` : 'Notificaciones'}
        hitSlop={8}
        style={{
            width: 46,
            height: 46,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            backgroundColor: colores.inputBg,
            borderWidth: 1,
            borderColor: colores.border,
        }}
        >
        <Ionicons name="notifications-outline" size={24} color={colores.text} />
        {noLeidas > 0 ? (
            <View
            style={{
                position: 'absolute',
                top: -6,
                right: -6,
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                paddingHorizontal: 4,
                backgroundColor: '#D93025',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            >
            <Texto variante="nota" color="#FFFFFF" style={{ fontSize: 11, fontWeight: '700' }}>
                {noLeidas > 9 ? '9+' : noLeidas}
            </Texto>
            </View>
        ) : null}
        </Pressable>
    );
}