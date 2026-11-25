import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useSesion } from '@/contexto/ContextoSesion';

// Al tocar un aviso del celular se abre el convenio correspondiente (también si la app estaba cerrada).
export function ManejadorAvisos() {
    const router = useRouter();
    const { token, cargando } = useSesion();
    const respuesta = Notifications.useLastNotificationResponse();
    const yaAtendida = useRef<string | null>(null);

    useEffect(() => {
        if (cargando || !token || !respuesta) return;
        if (respuesta.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

        const idAviso = respuesta.notification.request.identifier;
        if (yaAtendida.current === idAviso) return;
        yaAtendida.current = idAviso;

        const convenioId = respuesta.notification.request.content.data?.convenioId;
        if (typeof convenioId === 'number') {
            router.push({ pathname: '/convenio/[id]', params: { id: String(convenioId) } });
        } else {
            router.push('/notificaciones');
        }
    }, [respuesta, token, cargando, router]);

    return null;
}
