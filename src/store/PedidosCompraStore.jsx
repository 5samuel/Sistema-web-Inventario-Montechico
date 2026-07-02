import { create } from "zustand";
import {
  BuscarPedidosCompra,
  EditarPedidosCompra,
  EliminarPedidosCompra,
  InsertarPedidosCompra,
  MostrarPedidosCompra,
  RecibirPedidoCompra
} from "../supabase/crudPedidosCompra";
import { supabase } from "../supabase/supabase.config";
export const usePedidosCompraStore = create((set, get) => ({
  refetchs: null,
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  dataPedidosCompra: [],
  pedidosCompraItemSelect: null,
  parametros: {},

  // 1. Mostrar Pedidos
  mostrarPedidosCompra: async (p) => {
    const response = await  MostrarPedidosCompra(p);
    set({ parametros: p });
    set({ dataPedidosCompra: response });
    set({ pedidosCompraItemSelect: response[0] || null });
    set({ refetchs: p.refetchs });
    return response;
  },

  // 2. Seleccionar un Pedido de la lista
  selectPedidosCompra: (p) => {
    set({ pedidosCompraItemSelect: p });
  },

  // 3. Resetear el Pedido Seleccionado
  resetPedidosCompraItemSelect: () => {
    set({ pedidosCompraItemSelect: null });
  },

  // 4. Insertar Pedido
  insertarPedidosCompra: async (p) => {
    const response = await InsertarPedidosCompra(p);
    const { mostrarPedidosCompra, parametros } = get();
    await mostrarPedidosCompra(parametros);
    return response;
  },

  // 5. Eliminar Pedido
  eliminarPedidosCompra: async (p) => {
    await EliminarPedidosCompra(p);
    const { mostrarPedidosCompra, parametros } = get();
    await mostrarPedidosCompra(parametros);
  },

  // 6. Editar Pedido
  editarPedidosCompra: async (p) => {
    await EditarPedidosCompra(p);
    const { mostrarPedidosCompra, parametros } = get();
    await mostrarPedidosCompra(parametros);
  },

  //  Enviar Pedido
enviarPedidoCompra: async (p) => {
  await EnviarPedidoCompra(p);
  const { mostrarPedidosCompra, parametros } = get();
  await mostrarPedidosCompra(parametros);
},

// 8. Cancelar Pedido
cancelarPedidoCompra: async (p) => {
  await CancelarPedidoCompra(p);
  const { mostrarPedidosCompra, parametros } = get();
  await mostrarPedidosCompra(parametros);
},

  // 7. Buscar Pedidos
  buscarPedidosCompra: async (p) => {
    const response = await BuscarPedidosCompra(p);
    set({ dataPedidosCompra: response });
    return response;
  },

  // 8. Recibir Pedido (Cambia estado a 'recibido' e incrementa stocks)
  recibirPedidoCompra: async (p) => {
    await RecibirPedidoCompra(p);
    const { mostrarPedidosCompra, parametros } = get();
    await mostrarPedidosCompra(parametros);
  },



  mostrarPedidosLive: async (params) => {
    try {
      const { data, error } = await supabase.rpc("mostrarpedidoslive", params);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error en mostrarPedidosLive:", error);
      return []; // Retorna array vacío para que el .map no falle
    }
  },



}));