import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { useSesion } from '@/contexto/ContextoSesion';
import { esErrorApi } from '@/services/api';
import { descargarDocumento } from '@/services/documentos.service';
import { useTema } from '@/tema/ProveedorTema';

const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';

// Página que dibuja cada hoja del PDF en un canvas, una debajo de otra.
function construirHtml(base64: string): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
<style>
    body { margin: 0; background: #525659; color: #fff; font-family: sans-serif; }
    #estado { padding: 16px; text-align: center; font-size: 15px; }
    canvas { display: block; width: 100%; height: auto; margin: 0 0 8px 0; background: #fff; }
</style>
</head>
<body>
<div id="estado">Cargando PDF…</div>
<div id="paginas"></div>
<script src="${PDFJS}/pdf.min.js"></script>
<script>
(async function () {
    var estado = document.getElementById('estado');
    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '${PDFJS}/pdf.worker.min.js';
        var binario = atob('${base64}');
        var datos = new Uint8Array(binario.length);
        for (var i = 0; i < binario.length; i++) datos[i] = binario.charCodeAt(i);
        var pdf = await pdfjsLib.getDocument({ data: datos }).promise;
        var contenedor = document.getElementById('paginas');
        var ancho = document.body.clientWidth;
        for (var n = 1; n <= pdf.numPages; n++) {
        estado.textContent = 'Cargando página ' + n + ' de ' + pdf.numPages + '…';
        var pagina = await pdf.getPage(n);
        var base = pagina.getViewport({ scale: 1 });
        var escala = (ancho / base.width) * Math.min(window.devicePixelRatio || 1, 2);
        var vp = pagina.getViewport({ scale: escala });
        var canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        contenedor.appendChild(canvas);
        await pagina.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
        }
        estado.style.display = 'none';
    } catch (e) {
        estado.textContent = 'No se pudo mostrar el PDF. Verificá tu conexión. (' + (e && e.message ? e.message : e) + ')';
    }
})();
</script>
</body>
</html>`;
}

export default function VisorPdf() {
    const { colores } = useTema();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { token, cerrarSesion } = useSesion();
    const { id, titulo, codigo } = useLocalSearchParams<{ id: string; titulo?: string; codigo?: string }>();

    const [archivo, setArchivo] = useState<File | null>(null);
    const [html, setHtml] = useState<string | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const nombre = titulo ?? 'Documento';

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
        const f = await descargarDocumento(token, Number(id));
        const base64 = await f.base64();
        setArchivo(f);
        setHtml(construirHtml(base64));
        } catch (e) {
        if (esErrorApi(e) && e.estado === 401) {
            await cerrarSesion();
            return;
        }
        setError(e instanceof Error ? e.message : 'No se pudo cargar el PDF.');
        } finally {
        setCargando(false);
        }
    }, [id, token]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const guardarOCompartir = async () => {
        if (!archivo) return;
        try {
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(archivo.uri, { mimeType: 'application/pdf', dialogTitle: nombre });
        } else {
            Alert.alert('No disponible', 'Este dispositivo no permite compartir archivos.');
        }
        } catch {
        Alert.alert('No se pudo compartir', 'Intentá de nuevo.');
        }
    };

    const abrirEnOtraApp = async () => {
        if (!archivo) return;
        try {
        if (await archivo.canPreview({ mimeType: 'application/pdf' })) {
            await archivo.preview({ title: nombre, mimeType: 'application/pdf' });
        } else {
            Alert.alert('No hay un visor de PDF', 'Instalá una app para abrir PDF o usá «Guardar o compartir».');
        }
        } catch {
        Alert.alert('No se pudo abrir el PDF', 'Probá con «Guardar o compartir».');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colores.background }}>
        <EncabezadoPantalla
            titulo={nombre}
            subtitulo={codigo ? `Convenio ${codigo} · PDF` : 'Documento PDF'}
            onVolver={() => router.back()}
            ayuda="documento"
        />

        {cargando ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <ActivityIndicator size="large" color={colores.primary} accessibilityLabel="Cargando" />
            <Texto variante="subtitulo">Descargando documento…</Texto>
            </View>
        ) : error || !html ? (
            <View style={{ padding: 16 }}>
            <View style={{ backgroundColor: colores.surface, borderRadius: 14, borderWidth: 1, borderColor: colores.border, padding: 16, gap: 12 }}>
                <Texto variante="error" accessibilityLiveRegion="polite">
                {error ?? 'No se pudo cargar el PDF.'}
                </Texto>
                <Boton titulo="Reintentar" variante="contorno" tamano="chico" onPress={cargar} />
            </View>
            </View>
        ) : (
            <>
            <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1, backgroundColor: '#525659' }} />
            <View
                style={{
                flexDirection: 'row',
                gap: 10,
                padding: 12,
                paddingBottom: 12 + insets.bottom,
                backgroundColor: colores.surface,
                borderTopWidth: 1,
                borderTopColor: colores.border,
                }}
            >
                <View style={{ flex: 1 }}>
                <Boton titulo="Guardar o compartir" variante="contorno" tamano="chico" onPress={guardarOCompartir} />
                </View>
                <View style={{ flex: 1 }}>
                <Boton titulo="Abrir en otra app" variante="contorno" tamano="chico" onPress={abrirEnOtraApp} />
                </View>
            </View>
            </>
        )}
        </View>
    );
}