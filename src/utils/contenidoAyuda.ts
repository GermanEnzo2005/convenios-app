/* ---------------------------
Para el manual de usuario
----------------------------- */ 
export type PasoAyuda = { titulo: string; detalle: string };

export type GuiaAyuda = {
    id: 'identidad' | 'firmar';
    titulo: string;
    descripcion: string;
    pasos: PasoAyuda[];
};

export const GUIAS: GuiaAyuda[] = [
    {
        id: 'identidad',
        titulo: 'Registrar mi identidad',
        descripcion: 'Hacelo una sola vez. Sin identidad registrada no vas a poder firmar convenios.',
        pasos: [
            { titulo: 'Entrá a Registrar identidad', detalle: 'Abrí la sección desde el menú de la app.' },
            { titulo: 'Dibujá tu firma', detalle: 'Firmá con el dedo dentro del cuadro y tocá Guardar. Podés borrar y repetir las veces que quieras.' },
            { titulo: 'Registrá tu rostro', detalle: 'Mirá a la cámara con buena luz y seguí las indicaciones en pantalla.' },
            { titulo: 'Registrá tu huella digital', detalle: 'Apoyá tu dedo en el sensor del celular cuando la app te lo pida.' },
            { titulo: 'Verificá el resultado', detalle: 'Firma, rostro y huella deben figurar como "guardados".' },
        ],
    },
    {
        id: 'firmar',
        titulo: 'Firmar un convenio',
        descripcion: 'Necesitás conexión a internet y tu identidad registrada.',
        pasos: [
            { titulo: 'Elegí el convenio', detalle: 'En el Home, tocá "Ver convenio" en la lista "Para firmar".' },
            { titulo: 'Revisá los datos', detalle: 'Controlá las partes, las fechas y el convenio de origen (si tiene).' },
            { titulo: 'Leé el documento', detalle: 'En "Documentos" tocá "Ver PDF". Podés hacer zoom con dos dedos.' },
            { titulo: 'Tocá Firmar convenio', detalle: 'El botón aparece al final del detalle, solo si el convenio está aprobado.' },
            { titulo: 'Confirmá con tu huella', detalle: 'Apoyá el dedo en el sensor cuando el celular te lo pida.' },
            { titulo: 'Dibujá tu firma', detalle: 'Firmá en el recuadro y tocá Confirmar. Se registran fecha, hora y ubicación.' },
        ],
    },
];

/* ---------------------------
Para las ayudas en cada sección
----------------------------- */ 
export type SeccionAyuda =
    | 'inicio'
    | 'buscar'
    | 'convenio'
    | 'documento'
    | 'notificaciones'
    | 'perfil'
    | 'comentarios'
    | 'firmar';

export const AYUDAS_SECCION: Record<SeccionAyuda, { titulo: string; consejos: string[] }> = {
    inicio: {
        titulo: 'Ayuda: Inicio',
        consejos: [
            'En "Para firmar" ves los convenios aprobados que esperan tu firma.',
            'Tocá "Ver convenio" para leerlo y firmarlo.',
            'Usá el buscador de arriba para encontrar cualquier convenio por título o código.',
        ],
    },
    buscar: {
        titulo: 'Ayuda: Buscador',
        consejos: [
            'Combiná filtros (por ejemplo, año) para acotar los resultados.',
            'Los resultados se muestran como árbol: convenio padre, hijos, resoluciones y documentación.',
            'Sin conexión, el buscador no está disponible.',
        ],
    },
    convenio: {
        titulo: 'Ayuda: Detalle del convenio',
        consejos: [
            'Revisá los datos generales, las partes y el historial antes de firmar.',
            'En "Documentos" tocá "Ver PDF" para leer el convenio.',
            'El botón "Firmar convenio" aparece al final y solo si el convenio está aprobado.',
            'Si no podés firmar, la pantalla te explica el motivo.',
        ],
    },
    documento: {
        titulo: 'Ayuda: Documento',
        consejos: [
            'Hacé zoom con dos dedos para leer mejor.',
            '"Guardar o compartir" te permite enviar el PDF por WhatsApp o email.',
            '"Abrir en otra app" lo abre con el visor de PDF de tu celular.',
            'Necesitás conexión para descargarlo.',
        ],
    },
    notificaciones: {
        titulo: 'Ayuda: Notificaciones',
        consejos: [
            'Acá aparecen avisos de convenios nuevos, comentarios, cambios y cancelaciones.',
            'También te recordamos los convenios que tenés pendientes de firma.',
        ],
    },
    perfil: {
        titulo: 'Ayuda: Perfil y ajustes',
        consejos: [
            'Cambiá tu foto, el modo claro u oscuro y el tamaño de letra.',
            'El tamaño de letra se aplica a toda la app.',
        ],
    },
    comentarios: {
        titulo: 'Ayuda: Comentarios',
        consejos: [
            'Los comentarios son solo entre los usuarios que participan de este convenio.',
            'Escribí tu mensaje y tocá Enviar. Les llega una notificación a los demás.',
            'Si un comentario es ofensivo, el sistema lo detecta solo y lo reemplaza por "comentario ofensivo".',
            'Sin conexión no podés comentar. Cuando vuelva internet, podés escribir de nuevo.',
        ],
    },
    firmar: {
        titulo: 'Ayuda: Firmar convenio',
        consejos: [
            'Primero confirmás tu identidad con la huella digital de tu celular.',
            'Después dibujá tu firma con el dedo en el recuadro. "Borrar" te deja empezar de nuevo y "Confirmar" la envía.',
            'Al confirmar, la app registra la fecha, la hora y el lugar donde firmaste. Por eso te pide permiso de ubicación.',
            'Necesitás conexión a internet para firmar.',
        ],
    },
};

/* ---------------------------
Para la voz: Se arma el texto a leer
----------------------------- */ 
export const textoGuia = (g: GuiaAyuda) =>
    [
        `${g.titulo}.`,
        g.descripcion,
        ...g.pasos.map((p, i) => `Paso ${i + 1}. ${p.titulo}. ${p.detalle}`),
    ].join(' ');

export const textoSeccion = (a: { titulo: string; consejos: string[] }) =>
    [`${a.titulo}.`, ...a.consejos].join(' ');