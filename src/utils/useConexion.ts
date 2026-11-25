import { useNetInfo } from '@react-native-community/netinfo';

// true = hay red. Mientras el sistema todavía no sabe (null) se asume que sí.
export function useConexion(): boolean {
    const { isConnected } = useNetInfo();
    return isConnected !== false;
}