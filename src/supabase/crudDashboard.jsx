import { supabase } from "./supabase.config";

export async function MostrarValorInventario() {
  const { data, error } = await supabase.rpc(
    "valor_total_inventario"
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}