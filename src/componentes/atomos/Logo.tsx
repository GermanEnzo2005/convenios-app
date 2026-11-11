import { View } from 'react-native';
import { Texto } from './Texto';

export function Logo() {
    return (
        <View
        accessibilityRole="image"
        accessibilityLabel="Logo"
        style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}
        >
        <Texto variante="etiqueta" color="#0F5A9C" style={{ fontWeight: '800' }}>
            LOGO
        </Texto>
        </View>
    );
}