import { create } from "zustand";
import {
  EliminarAlmacen,
  MostrarAlmacenXSucursal,
  MostrarAlmacenesXEmpresa,
  InsertarAlmacen,
  EditarAlmacen,
  MostrarAlmacenesXSucursal,
} from "../index";

export const useAlmacenesStore = create((set, get) => ({
  stateAlmacen: false,
  setStateAlmacen: (p) => set({ stateAlmacen: p }),
  accion: "",
  setAccion: (p) => set({ accion: p }),
  almacenSelectItem: [],
  setAlmacenSelectItem: (p) => {
    set({ almacenSelectItem: p });
  },

  dataalmacen: [],
  dataalmacenxsucursalxproducto: [],
  
  mostrarAlmacenXsucursal: async (p) => {
    // Protección por si los parámetros vienen vacíos o como undefined
    if (!p?.id_sucursal || p.id_sucursal === "undefined") {
      return [];
    }
    const response = await MostrarAlmacenXSucursal(p);
    set({ dataalmacenxsucursalxproducto: response });
    const { dataalmacenxsucursalxproducto } = get();
    return dataalmacenxsucursalxproducto;
  },

  dataAlmacenesXempresa: null,
  mostrarAlmacenesXEmpresa: async (p) => {
    if (!p?.id_empresa || p.id_empresa === "undefined") {
      return [];
    }
    const response = await MostrarAlmacenesXEmpresa(p);
    set({ dataAlmacenesXsucursal: response });
    return response;
  },

  dataAlmacenesXsucursal: null,
  mostrarAlmacenesXSucursal: async (p) => {
    // 🧠 CONTROL DE SEGURIDAD: Evita disparar el GET rest/v1/almacen?id_sucursal=eq.undefined
    if (!p?.id_sucursal || p.id_sucursal === "undefined") {
      set({ almacenSelectItem: null, dataAlmacenesXsucursal: [] });
      return [];
    }

    const response = await MostrarAlmacenesXSucursal(p);
    
    // Si la respuesta tiene datos, seleccionamos el primero por defecto para evitar errores visuales
    if (response && response.length > 0) {
      set({ almacenSelectItem: response[0] });
    } else {
      set({ almacenSelectItem: null });
    }

    set({ dataAlmacenesXsucursal: response });
    return response;
  },
 
  insertarAlmacen: async (p) => {
    await InsertarAlmacen(p);
  },
  eliminarAlmacen: async (p) => {
    await EliminarAlmacen(p);
  },
  editarAlmacen: async (p) => {
    await EditarAlmacen(p);
  },
}));