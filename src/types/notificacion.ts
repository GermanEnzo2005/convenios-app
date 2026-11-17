export type Notificacion = {
  id: number;
  tipo: string; // nuevo_convenio, cambio_datos, cancelado, comentario
  titulo: string;
  mensaje: string;
  convenioId: number | null;
  leida: boolean;
  creadaEn: string; // fecha y hora en formato ISO
};