import { Boton } from '@/componentes/atomos/Boton';
import { Texto } from '@/componentes/atomos/Texto';
import { EncabezadoPantalla } from '@/componentes/compartidos/EncabezadoPantalla';
import { useSesion } from '@/contexto/ContextoSesion';
import { esErrorApi } from '@/services/api';
import { autenticarConHuella } from '@/services/biometria.service';
import { firmarConvenio } from '@/services/convenios.service';
import { useTema } from '@/tema/ProveedorTema';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';

import { PantallaSinConexion } from '@/componentes/compartidos/PantallaSinConexion';
import { useConexion } from '@/hooks/useConexion';

type Paso = 'huella' | 'firma' | 'enviando';

export default function FirmarConvenio() {
  const { colores } = useTema();
  const router = useRouter();
  const { token, cerrarSesion } = useSesion();
  const { id, codigo } = useLocalSearchParams<{ id: string; codigo: string }>();

  const firmaRef = useRef<SignatureViewRef>(null);
  const [paso, setPaso] = useState<Paso>('huella');
  const [error, setError] = useState<string | null>(null);

  const enLinea = useConexion();

  // Paso 1: huella
  const verificarHuella = useCallback(async () => {
    setError(null);
    const r = await autenticarConHuella(`Firmá el convenio ${codigo}`);
    if (r.ok) setPaso('firma');
    else setError(r.motivo);
  }, [codigo]);

  useEffect(() => { if (enLinea) verificarHuella(); }, [verificarHuella, enLinea]);

  // Pasos 2 y 3: ubicación + envío (se ejecuta cuando confirmás la firma dibujada)
  const enviar = async (firmaBase64: string) => {
    setPaso('enviando');
    try {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (permiso.status !== 'granted') {
        throw new Error('Necesitamos tu ubicación para registrar dónde se firmó.');
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      await firmarConvenio(token, Number(id), {
        firma: firmaBase64,
        latitud: pos.coords.latitude,
        longitud: pos.coords.longitude,
      });

      Alert.alert(
        'Convenio firmado',
        `${codigo} quedó firmado.`,
        [{ text: 'Aceptar', onPress: () => router.back() }],
        { cancelable: false },
      );
    } catch (e) {
      if (esErrorApi(e) && e.estado === 401) {
        await cerrarSesion();
        return;
      }
      setPaso('firma');
      Alert.alert('No se pudo firmar', e instanceof Error ? e.message : 'Error desconocido');
    }
  };  

  if (!enLinea && paso === 'huella') {
    return (
        <PantallaSinConexion titulo="Firmar convenio" subtitulo={codigo}
            mensaje="Para firmar un convenio necesitás conexión a internet." onVolver={() => router.back()} />
    );
}

  return (
    <View style={{ flex: 1, backgroundColor: colores.background }}>
      <EncabezadoPantalla titulo="Firmar convenio" subtitulo={codigo} onVolver={() => router.back()} />
      {paso === 'huella' && (
        <View style={{ padding: 16, gap: 12 }}>
          {error ? (
            <>
              <Texto variante="error">{error}</Texto>
              <Boton titulo="Reintentar" variante="contorno" onPress={verificarHuella} />
            </>
          ) : (
            <ActivityIndicator size="large" color={colores.primary} />
          )}
        </View>
      )}

      {paso === 'firma' && (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
            <Texto variante="subtitulo">Dibujá tu firma en el recuadro y tocá Confirmar.</Texto>

            <View
            style={{
                flex: 1,
                borderRadius: 14,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colores.border,
                backgroundColor: '#fff',
            }}
            >
            <SignatureScreen
                ref={firmaRef}
                onOK={enviar}
                onEmpty={() => Alert.alert('Firma vacía', 'Dibujá tu firma antes de confirmar.')}
                descriptionText=""
                imageType="image/png"
                trimWhitespace
                autoClear={false}
                webStyle={`.m-signature-pad--footer { display: none; margin: 0; } .m-signature-pad { box-shadow: none; border: none; }`}
            />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
                <Boton titulo="Borrar" variante="contorno" onPress={() => firmaRef.current?.clearSignature()} />
            </View>
            <View style={{ flex: 1 }}>
                <Boton titulo="Confirmar" onPress={() => firmaRef.current?.readSignature()} />
            </View>
            </View>
        </View>
        )}

      {paso === 'enviando' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color={colores.primary} />
          <Texto variante="subtitulo">Registrando firma…</Texto>
        </View>
      )}
    </View>
  );
}