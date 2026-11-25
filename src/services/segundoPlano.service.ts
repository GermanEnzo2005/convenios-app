import * as BackgroundTask from 'expo-background-task';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';
import { avisarNotificacionesNuevas } from './avisos.service';
import { obtenerNotificaciones } from './notificaciones.service';

// Tarea que el sistema ejecuta aunque la app esté cerrada: consulta las notificaciones de la API
// y muestra un aviso en el celular por cada una nueva. Reusa la misma lógica que la app abierta,
// así que no se repiten avisos (ambas comparan contra el último id visto, guardado en AsyncStorage).
const TAREA_NOTIFICACIONES = 'revisar-notificaciones';

// Mínimo que permite Android (15 min). El sistema decide el momento exacto, en iOS suele ser menos frecuente.
const MINUTOS_ENTRE_CONSULTAS = 15;

// Mismas claves que usa ContextoSesion.
const CLAVE_TOKEN = 'sesion_token';
const CLAVE_USUARIO = 'sesion_usuario';

// Lógica de la tarea: se usa tanto desde el sistema (segundo plano) como a mano, para probar.
export async function revisarNotificacionesAhora(): Promise<void> {
    const [token, usuarioCrudo] = await Promise.all([
        SecureStore.getItemAsync(CLAVE_TOKEN),
        SecureStore.getItemAsync(CLAVE_USUARIO),
    ]);
    if (!token || !usuarioCrudo) return; // no hay sesión iniciada

    const usuario = JSON.parse(usuarioCrudo) as { id?: number };
    if (typeof usuario.id !== 'number') return;

    const { notificaciones } = await obtenerNotificaciones(token);
    await avisarNotificacionesNuevas(usuario.id, notificaciones);
}

// IMPORTANTE: defineTask debe ejecutarse al cargar el módulo (no dentro de un componente);
// por eso este archivo se importa al inicio de src/app/_layout.tsx.
TaskManager.defineTask(TAREA_NOTIFICACIONES, async () => {
    try {
        await revisarNotificacionesAhora();
        return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
        // Sin red, sesión vencida o servidor caído: se reintenta en la próxima ejecución.
        return BackgroundTask.BackgroundTaskResult.Failed;
    }
});

export async function registrarSegundoPlano(): Promise<void> {
    const estado = await BackgroundTask.getStatusAsync();
    if (estado !== BackgroundTask.BackgroundTaskStatus.Available) return;
    if (await TaskManager.isTaskRegisteredAsync(TAREA_NOTIFICACIONES)) return;
    await BackgroundTask.registerTaskAsync(TAREA_NOTIFICACIONES, { minimumInterval: MINUTOS_ENTRE_CONSULTAS });
}

export async function cancelarSegundoPlano(): Promise<void> {
    if (await TaskManager.isTaskRegisteredAsync(TAREA_NOTIFICACIONES)) {
        await BackgroundTask.unregisterTaskAsync(TAREA_NOTIFICACIONES);
    }
}
