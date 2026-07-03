import { supabase } from "../index";

// Nombre de la tabla principal
const tabla = "transferencia_almacen";

// 1. Crear la cabecera de la transferencia
export async function InsertarTransferencia(p) {
  const { error, data } = await supabase.rpc("crear_transferencia", {
    p_origen: p.p_origen,
    p_destino: p.p_destino,
    p_observacion: p.p_observacion,
    p_usuario: p.p_usuario,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data; // Devuelve el ID de la transferencia creada
}

// 2. Obtener todas las transferencias para el listado
export async function MostrarTransferencias() {
  const { data, error } = await supabase.rpc("mostrar_transferencias");
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

// 3. Agregar productos al detalle de la transferencia
export async function AgregarDetalleTransferencia(p) {
  const { error } = await supabase.rpc("agregar_detalle_transferencia", {
    p_transferencia: p.p_transferencia,
    p_producto: p.p_producto,
    p_cantidad: p.p_cantidad,
  });
  if (error) {
    throw new Error(error.message);
  }
}

// 4. Enviar transferencia (Resta stock en Origen y cambia a EN_TRANSITO)
export async function EnviarTransferencia(p) {
  const { error, data } = await supabase.rpc("enviar_transferencia", {
    p_transferencia: p.id,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

// 5. Recibir transferencia (Suma stock en Destino y cambia a COMPLETADO)
export async function RecibirTransferencia(p) {
  const { error, data } = await supabase.rpc("recibir_transferencia", {
    p_transferencia: p.id,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}