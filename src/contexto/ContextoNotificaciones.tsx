import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { esErrorApi } from '@/services/api';
import { avisarNotificacionesNuevas, cancelarAvisos, configurarNotificaciones, programarAvisos } from '@/services/avisos.service';
import { buscarConvenios, FILTROS_INICIALES } from '@/services/convenios.service';
import {
    marcarLeida as marcarLeidaApi,
    marcarTodasLeidas as marcarTodasApi,
    obtenerNotificaciones,
} from '@/services/notificaciones.service';
import { cancelarSegundoPlano, registrarSegundoPlano } from '@/services/segundoPlano.service';
import { Notificacion } from '@/types/notificacion';
import { useSesion } from './ContextoSesion';

const INTERVALO_MS = 60 * 1000; // consulta cada minuto mientras la app está abierta

type ValorNotificaciones = {
    notificaciones: Notificacion[];
    noLeidas: number;
    pendientes: number; // convenios aprobados que esperan la firma
    error: string | null;
    refrescar: () => Promise<void>;
    marcarLeida: (id: number) => Promise<void>;
    marcarTodas: () => Promise<void>;
};

const ContextoNotificaciones = createContext<ValorNotificaciones | null>(null);

export function ProveedorNotificaciones({ children }: { children: ReactNode }) {
    const { token, usuario, cargando, cerrarSesion } = useSesion();
    const usuarioId = usuario?.id ?? null;

    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [noLeidas, setNoLeidas] = useState(0);
    const [pendientes, setPendientes] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const pendientesRef = useRef(0);

    const refrescar = useCallback(async () => {
        if (!token || usuarioId === null) return;
        try {
        const [lista, aprobados] = await Promise.all([
            obtenerNotificaciones(token),
            buscarConvenios(token, { ...FILTROS_INICIALES, estado: 'aprobado' }, 1, 1),
        ]);
        setNotificaciones(lista.notificaciones);
        setNoLeidas(lista.noLeidas);
        setPendientes(aprobados.total);
        pendientesRef.current = aprobados.total;
        setError(null);

        // Aviso del sistema por cada notificación nueva (llega al celular aunque esté bloqueado).
        await avisarNotificacionesNuevas(usuarioId, lista.notificaciones);
        } catch (e) {
        if (esErrorApi(e) && e.estado === 401) {
            await cerrarSesion();
            return;
        }
        setError(e instanceof Error ? e.message : 'No se pudieron cargar las notificaciones.');
        }
    }, [token, usuarioId]);

    // Permiso y canal de notificaciones al iniciar sesión.
    useEffect(() => {
        if (token) configurarNotificaciones().catch(() => {});
    }, [token]);

    // Tarea de segundo plano: con la app cerrada o en segundo plano, el sistema la ejecuta cada tanto,
    // consulta la API y muestra un aviso en el celular por cada notificación nueva.
    useEffect(() => {
        if (token) registrarSegundoPlano().catch(() => {});
        else if (!cargando) cancelarSegundoPlano().catch(() => {});
    }, [token, cargando]);

    // Carga inicial y consulta periódica mientras la app está abierta.
    useEffect(() => {
        let intervalo: ReturnType<typeof setInterval> | undefined;
        if (token) {
        refrescar();
        intervalo = setInterval(() => {
            if (AppState.currentState === 'active') refrescar();
        }, INTERVALO_MS);
        } else {
        setNotificaciones([]);
        setNoLeidas(0);
        setPendientes(0);
        pendientesRef.current = 0;
        }
        return () => {
        if (intervalo) clearInterval(intervalo);
        };
    }, [token, refrescar]);

    // Avisos locales: se cancelan al abrir la app y se programan al salir.
    useEffect(() => {
        cancelarAvisos().catch(() => {});
        const suscripcion = AppState.addEventListener('change', (estado) => {
        if (!token) return;
        if (estado === 'active') {
            cancelarAvisos().catch(() => {});
            refrescar();
        } else {
            programarAvisos(pendientesRef.current).catch(() => {});
        }
        });
        return () => suscripcion.remove();
    }, [token, refrescar]);

    const marcarLeida = useCallback(
        async (id: number) => {
        const existente = notificaciones.find((n) => n.id === id);
        if (!existente || existente.leida) return;
        setNotificaciones((previas) => previas.map((n) => (n.id === id ? { ...n, leida: true } : n)));
        setNoLeidas((n) => Math.max(n - 1, 0));
        try {
            await marcarLeidaApi(token, id);
        } catch {
            await refrescar();
        }
        },
        [token, notificaciones, refrescar],
    );

    const marcarTodas = useCallback(async () => {
        setNotificaciones((previas) => previas.map((n) => ({ ...n, leida: true })));
        setNoLeidas(0);
        try {
        await marcarTodasApi(token);
        } catch {
        await refrescar();
        }
    }, [token, refrescar]);

    return (
        <ContextoNotificaciones.Provider value={{ notificaciones, noLeidas, pendientes, error, refrescar, marcarLeida, marcarTodas }}>
        {children}
        </ContextoNotificaciones.Provider>
    );
}

export function useNotificaciones() {
    const ctx = useContext(ContextoNotificaciones);
    if (!ctx) throw new Error('useNotificaciones debe usarse dentro de ProveedorNotificaciones');
    return ctx;
}