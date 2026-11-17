import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CANAL = 'avisos';

// Horas antes de avisar. Se configuran en .env.local y admiten decimales (0.02 ≈ 1 minuto) para probar.
const HORAS_RECORDATORIO_FIRMA = Number(process.env.EXPO_PUBLIC_HORAS_RECORDATORIO_FIRMA ?? 24);
const HORAS_SIN_INGRESAR = Number(process.env.EXPO_PUBLIC_HORAS_SIN_INGRESAR ?? 48);

const ID_RECORDATORIO = 'recordatorio-firma';
const ID_NOVEDADES = 'hay-novedades';

const aSegundos = (horas: number) => Math.max(Math.round(horas * 3600), 5);

// Define cómo se muestran los avisos, crea el canal de Android y pide el permiso.
export async function configurarNotificaciones(): Promise<boolean> {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true, // en Android, sin sonido no aparece el aviso emergente
        shouldSetBadge: false,
        }),
    });

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CANAL, {
        name: 'Avisos de convenios',
        importance: Notifications.AndroidImportance.HIGH,
        });
    }

    const actual = await Notifications.getPermissionsAsync();
    if (actual.granted) return true;
    const pedido = await Notifications.requestPermissionsAsync();
    return pedido.granted;
}

// Muestra un aviso del sistema ahora mismo.
export async function avisarAhora(titulo: string, mensaje: string, datos?: Record<string, unknown>): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        content: { title: titulo, body: mensaje, data: datos },
        trigger: { channelId: CANAL },
    });
}

export async function cancelarAvisos(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

// Se llama al salir de la app: deja programados los dos avisos.
export async function programarAvisos(pendientes: number): Promise<void> {
    await cancelarAvisos();

    if (pendientes > 0 && HORAS_RECORDATORIO_FIRMA > 0) {
        await Notifications.scheduleNotificationAsync({
        identifier: ID_RECORDATORIO,
        content: {
            title: 'Convenios por firmar',
            body: pendientes === 1 ? 'Aún tienes un convenio por firmar.' : `Aún tienes ${pendientes} convenios por firmar.`,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: aSegundos(HORAS_RECORDATORIO_FIRMA),
            channelId: CANAL,
        },
        });
    }

    if (HORAS_SIN_INGRESAR > 0) {
        await Notifications.scheduleNotificationAsync({
        identifier: ID_NOVEDADES,
        content: { title: 'Sistema de Convenios', body: 'Hay novedades.' },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: aSegundos(HORAS_SIN_INGRESAR),
            channelId: CANAL,
        },
        });
    }
}