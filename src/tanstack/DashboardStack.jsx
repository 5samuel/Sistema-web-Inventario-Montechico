import { useQuery } from "@tanstack/react-query";
import { MostrarValorInventario } from "../supabase/crudDashboard";

export const useValorInventarioQuery = () => {
  return useQuery({
    queryKey: ["valor inventario"],
    queryFn: MostrarValorInventario,
  });
};