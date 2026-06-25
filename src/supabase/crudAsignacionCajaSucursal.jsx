import { supabase } from "../supabase/supabase.config";
const tabla = "asignacion_sucursal";

export async function MostrarSucursalCajaAsignada(p) {
  // 🧠 Si no viene un id_usuario válido o es la cadena 'undefined', retornamos null inmediatamente
  if (!p?.id_usuario || p.id_usuario === "undefined") {
    return null;
  }

  const { data, error } = await supabase
    .from(tabla)
    .select(`*, sucursales(*), caja(*)`)
    .eq("id_usuario", p.id_usuario)
    .maybeSingle();

  if (error) {
    console.error("Error en MostrarSucursalCajaAsignada:", error.message);
    return null;
  }

  return data;
}

export async function InsertarAsignacionCajaSucursal(p) {
  const { error } = await supabase.from(tabla).insert(p);
  if (error) {
    throw new Error(error.message);
  }
}

export async function MostrarUsuariosAsignados(p) {
  // Control de seguridad por si los parámetros de la función RPC van vacíos
  if (!p) return [];
  
  const { data, error } = await supabase.rpc("mostrarusuariosasignados", p);
  if (error) {
    console.error("Error en RPC mostrarusuariosasignados:", error.message);
    return [];
  }
  return data;
}

export async function BuscarUsuariosAsignados(p) {
  if (!p) return [];

  const { data, error } = await supabase.rpc("buscarusuariosasignados", p);
  if (error) {
    console.error("Error en RPC buscarusuariosasignados:", error.message);
    return [];
  }
  return data;
}