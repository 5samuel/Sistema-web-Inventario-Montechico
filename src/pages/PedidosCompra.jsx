import { useQuery } from "@tanstack/react-query";
import {
  PedidosCompraTemplate, // Asegúrate de exportarlo en tu index
  Spinner1,
  useEmpresaStore,
  usePedidosCompraStore,
  // Importa los stores adicionales que usarás en los selectores del formulario:
  useClientesProveedoresStore, 
  useSucursalesStore,
  useAlmacenesStore,
} from "../index";

export function PedidosCompra() {
  // Consumo de Stores
  const { mostrarPedidosCompra, buscarPedidosCompra, buscador } = usePedidosCompraStore();
  const { mostrarClientesProveedores } = useClientesProveedoresStore();
  const { mostrarSucursales } = useSucursalesStore();
  const { mostrarAlmacenes } = useAlmacenesStore();
  const { dataempresa } = useEmpresaStore();

  // 1. Cargar Pedidos de Compra (Principal)
  const {
    isLoading: isLoadingPedidos,
    error: errorPedidos,
    refetch,
  } = useQuery({
    queryKey: ["mostrar pedidos compra", dataempresa?.id],
    queryFn: () => mostrarPedidosCompra({ id_empresa: dataempresa?.id, refetchs: refetch }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });

  // 2. Buscar Pedidos de Compra (Reactivo al input buscador)
  const { isLoading: isLoadingBuscarPedidos } = useQuery({
    queryKey: ["buscar pedidos compra", buscador],
    queryFn: () => buscarPedidosCompra({ id_empresa: dataempresa?.id, buscador: buscador }),
    enabled: !!dataempresa && buscador.trim() !== "",
    refetchOnWindowFocus: false,
  });

  // 3. Mostrar Proveedores (Para el selector del formulario)
  const { isLoading: isLoadingProveedores } = useQuery({
    queryKey: ["mostrar proveedores para pedidos", dataempresa?.id],
    // Ajusta la función o parámetros según manejes tu store de proveedores
    queryFn: () => mostrarClientesProveedores({ id_empresa: dataempresa?.id }), 
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });

  // 4. Mostrar Sucursales (Para el selector del formulario)
  const { isLoading: isLoadingSucursales } = useQuery({
    queryKey: ["mostrar sucursales para pedidos", dataempresa?.id],
    queryFn: () => mostrarSucursales({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });

  // 5. Mostrar Almacenes (Para el selector del formulario)
  const { isLoading: isLoadingAlmacenes } = useQuery({
    queryKey: ["mostrar almacenes para pedidos", dataempresa?.id],
    queryFn: () => mostrarAlmacenes({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });

  // Consolidación de Estados de Carga y Error
  const isLoading = isLoadingPedidos || isLoadingProveedores || isLoadingSucursales || isLoadingAlmacenes;
  const error = errorPedidos;

  if (isLoading) {
    return <Spinner1 />;
  }

  if (error) {
    return <span>Error: {error.message}</span>;
  }

  return <PedidosCompraTemplate />;
}