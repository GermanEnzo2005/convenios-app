import { Redirect, Stack } from 'expo-router';
import { useSesion } from '@/contexto/ContextoSesion';

export default function LayoutPrincipal() {
    const { token, cargando } = useSesion();

    if (cargando) return null;
    if (!token) return <Redirect href="/login" />;
    return <Stack screenOptions={{ headerShown: false }} />;
}