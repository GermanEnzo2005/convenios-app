import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { ESTADOS_FILTRO, FiltrosBusqueda, TIPOS_INSTRUMENTO } from '@/services/convenios.service';
import { useTema } from '@/tema/ProveedorTema';
import { etiquetaEstado } from '@/types/convenio';
import { Texto } from '../atomos/Texto';
import { ChipFiltro } from '../compartidos/ChipFiltro';

const ANIOS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

const ORDENES = [
    ['fecha_creacion', 'Fecha'],
    ['titulo', 'Título'],
    ['estado', 'Estado'],
    ['codigo', 'Código'],
] as const;

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
    return (
        <View style={{ gap: 8 }}>
        <Texto variante="etiqueta">{titulo}</Texto>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {children}
        </ScrollView>
        </View>
    );
}

type Props = { filtros: FiltrosBusqueda; onCambio: (filtros: FiltrosBusqueda) => void };

export function PanelFiltros({ filtros, onCambio }: Props) {
    const { colores } = useTema();
    const cambiar = (parcial: Partial<FiltrosBusqueda>) => onCambio({ ...filtros, ...parcial });

    return (
        <View
        style={{
            backgroundColor: colores.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colores.border,
            padding: 14,
            gap: 16,
        }}
        >
        <Grupo titulo="Año de creación">
            <ChipFiltro texto="Todos" activo={filtros.anio === null} onPress={() => cambiar({ anio: null })} />
            {ANIOS.map((a) => (
            <ChipFiltro key={a} texto={String(a)} activo={filtros.anio === a} onPress={() => cambiar({ anio: a })} />
            ))}
        </Grupo>

        <Grupo titulo="Estado">
            <ChipFiltro texto="Todos" activo={filtros.estado === null} onPress={() => cambiar({ estado: null })} />
            {ESTADOS_FILTRO.map((e) => (
            <ChipFiltro key={e} texto={etiquetaEstado(e)} activo={filtros.estado === e} onPress={() => cambiar({ estado: e })} />
            ))}
        </Grupo>

        <Grupo titulo="Tipo de instrumento">
            <ChipFiltro texto="Todos" activo={filtros.tipoId === null} onPress={() => cambiar({ tipoId: null })} />
            {TIPOS_INSTRUMENTO.map((t) => (
            <ChipFiltro key={t.id} texto={t.nombre} activo={filtros.tipoId === t.id} onPress={() => cambiar({ tipoId: t.id })} />
            ))}
        </Grupo>

        <Grupo titulo="Ordenar por">
            {ORDENES.map(([valor, etiqueta]) => (
            <ChipFiltro key={valor} texto={etiqueta} activo={filtros.orden === valor} onPress={() => cambiar({ orden: valor })} />
            ))}
            <ChipFiltro texto="Descendente" activo={filtros.direccion === 'desc'} onPress={() => cambiar({ direccion: 'desc' })} />
            <ChipFiltro texto="Ascendente" activo={filtros.direccion === 'asc'} onPress={() => cambiar({ direccion: 'asc' })} />
        </Grupo>
        </View>
    );
}