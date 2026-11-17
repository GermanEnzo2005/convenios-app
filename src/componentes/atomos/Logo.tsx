import { Image } from 'react-native';

type Props = { tamano?: number };

// Logo de la app: un apretón de manos (acuerdo) con los colores institucionales.
export function Logo({ tamano = 80 }: Props) {
    return (
        <Image
            source={require('../../../assets/images/logo.png')}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Logo del Sistema de Gestión de Convenios"
            style={{
                width: tamano,
                height: tamano,
                borderRadius: tamano * 0.22,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.15)', // separa el fondo del logo del encabezado
            }}
        />
    );
}