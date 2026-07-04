import { create } from "zustand";
import { supabase } from "../supabase/supabase.config";

export const useTransferenciasStore = create((set, get) => ({
  transferencias: [],
  almacenesDB: [],
  productosDB: [],
  isLoading: false,

  // Estados del formulario
  transferenciaSeleccionada: null, 
  almacenOrigen: "",
  almacenDestino: "",
  fechaTransferencia: new Date().toISOString().split("T")[0],
  productosTransferir: [], 
  totalCantidadProductos: 0,

  setAlmacenOrigen: (id) => set({ almacenOrigen: id }),
  setAlmacenDestino: (id) => set({ almacenDestino: id }),
  setFechaTransferencia: (fecha) => set({ fechaTransferencia: fecha }),

  cargarAlmacenes: async () => {
    const { data } = await supabase.from("almacen").select("id, nombre");
    if (data) set({ almacenesDB: data });
  },

  cargarProductos: async () => {
    const { data } = await supabase.from("productos").select("id, nombre");
    if (data) set({ productosDB: data });
  },

  // Mostrar historial en la tabla principal
  mostrarTransferencias: async () => {
    set({ isLoading: true });
    const { data } = await supabase
      .from("transferencia_almacen")
      .select(`
        id,
        fecha,
        estado,
        observacion,
        id_almacen_origen,
        id_almacen_destino,
        almacen_origen:almacen!id_almacen_origen(nombre),
        almacen_destino:almacen!id_almacen_destino(nombre)
      `)
      .order("id", { ascending: false });

    set({ transferencias: data || [], isLoading: false });
  },

  // Acción 1: Cambiar estado a RECIBIDO
  recibirTransferencia: async (id) => {
    const { error } = await supabase
      .from("transferencia_almacen")
      .update({ estado: "RECIBIDO" })
      .eq("id", id);
    if (error) throw error;
    await get().mostrarTransferencias();
  },

  // Acción 2: Eliminar transferencia y sus detalles por CASCADE o limpieza manual
  eliminarTransferencia: async (id) => {
    
    await supabase.from("detalle_transferencia").delete().eq("id_transferencia", id);
    
    const { error } = await supabase.from("transferencia_almacen").delete().eq("id", id);
    if (error) throw error;
    await get().mostrarTransferencias();
  },

  // Acción 3: Cargar datos para edición
 // Busca y reemplaza por completo la función prepararEdicion dentro de tu TransferenciasStore.jsx:

prepararEdicion: async (transferencia) => {
    if (!transferencia) return;
    set({ isLoading: true });
    
    console.log("👉 OBJETO COMPLETO RECIBIDO DE LA TABLA:", transferencia);

    // 1. Identificamos campos de forma flexible
    const idReal = transferencia.id || transferencia.id_transferencia;
    const origenReal = transferencia.id_almacen_origen || transferencia.id_origen || transferencia.almacen_origen;
    const destinoReal = transferencia.id_almacen_destino || transferencia.id_destino || transferencia.almacen_destino;
    
    const fechaOriginal = transferencia.fecha || transferencia.fecha_transferencia;
    const fechaLimpia = fechaOriginal 
      ? fechaOriginal.split("T")[0] 
      : new Date().toISOString().split("T")[0];

    // Inyectamos la cabecera inmediatamente al estado
    set({
      transferenciaSeleccionada: idReal || null,
      almacenOrigen: origenReal ? origenReal.toString() : "",
      almacenDestino: destinoReal ? destinoReal.toString() : "",
      fechaTransferencia: fechaLimpia,
      productosTransferir: [] 
    });

    if (!idReal) {
      console.error("❌ No se pudo encontrar un ID válido en el objeto transferencia.");
      set({ isLoading: false });
      return;
    }

    try {
      // 2. Traemos solo los datos numéricos crudos del detalle (sin joins que se puedan romper)
      const { data: detalles, error: errorDetalle } = await supabase
        .from("detalle_transferencia")
        .select("id_producto, cantidad")
        .eq("id_transferencia", idReal);

      if (errorDetalle) throw errorDetalle;

      if (detalles && detalles.length > 0) {
        // 3. Extraemos todos los IDs de productos para buscar sus nombres en bloque
        const idsProductos = detalles.map(d => d.id_producto);

        // Nota: Si tu tabla de productos se llama 'producto' (singular), cámbialo abajo
        const { data: productos, error: errorProd } = await supabase
          .from("productos") 
          .select("id, nombre")
          .in("id", idsProductos);

        // 4. Cruzamos la información en memoria (Frontend) de forma segura
        const productosMapeados = detalles.map(d => {
          const infoProducto = productos?.find(p => p.id === d.id_producto);
          return {
            id: d.id_producto,
            nombre: infoProducto?.nombre || `Producto #${d.id_producto}`,
            cantidad: parseFloat(d.cantidad)
          };
        });

        set({ productosTransferir: productosMapeados });
      } else {
        set({ productosTransferir: [] });
      }

      set({ isLoading: false });

    } catch (error) {
      console.error("❌ Error en Supabase al extraer detalles:", error.message);
      set({ isLoading: false });
    }
  },

  agregarProductoTransferencia: (producto, cantidad) => {
    const { productosTransferir } = get();
    const existe = productosTransferir.find((p) => p.id === producto.id);
    let nuevos = existe 
      ? productosTransferir.map((p) => p.id === producto.id ? { ...p, cantidad: p.cantidad + parseFloat(cantidad) } : p)
      : [...productosTransferir, { ...producto, cantidad: parseFloat(cantidad) }];
    set({ productosTransferir: nuevos, totalCantidadProductos: nuevos.reduce((acc, p) => acc + p.cantidad, 0) });
  },

  eliminarProductoTransferencia: (productoId) => {
    const nuevos = get().productosTransferir.filter((p) => p.id !== productoId);
    set({ productosTransferir: nuevos, totalCantidadProductos: nuevos.reduce((acc, p) => acc + p.cantidad, 0) });
  },

  resetFormulario: () => set({
    transferenciaSeleccionada: null,
    almacenOrigen: "",
    almacenDestino: "",
    fechaTransferencia: new Date().toISOString().split("T")[0],
    productosTransferir: [],
    totalCantidadProductos: 0
  }),

  // GUARDAR (Crea en ENVIADO o Modifica conservando el estado)
  guardarTransferencia: async (idUsuario, observacion = "-") => {
    const { transferenciaSeleccionada, almacenOrigen, almacenDestino, fechaTransferencia, productosTransferir } = get();

    if (!almacenOrigen || !almacenDestino) throw new Error("Selecciona los almacenes.");
    if (almacenOrigen === almacenDestino) throw new Error("Los almacenes deben ser diferentes.");
    if (productosTransferir.length === 0) throw new Error("Añada productos.");

    let idTransferencia = transferenciaSeleccionada;

    if (idTransferencia) {
      // Editar
      const { error: errCab } = await supabase
        .from("transferencia_almacen")
        .update({
          fecha: fechaTransferencia,
          id_almacen_origen: parseInt(almacenOrigen),
          id_almacen_destino: parseInt(almacenDestino),
          observacion: observacion
        })
        .eq("id", idTransferencia);

      if (errCab) throw errCab;
      await supabase.from("detalle_transferencia").delete().eq("id_transferencia", idTransferencia);
    } else {
      // Registrar Nueva -> Estado Inicial: ENVIADO 🚀
      const { data: cabecera, error: errCab } = await supabase
        .from("transferencia_almacen")
        .insert({
          fecha: fechaTransferencia,
          id_almacen_origen: parseInt(almacenOrigen),
          id_almacen_destino: parseInt(almacenDestino),
          estado: "ENVIADO", 
          observacion: observacion,
          id_usuario: idUsuario || null
        })
        .select().single();

      if (errCab) throw errCab;
      idTransferencia = cabecera.id;
    }

    const detallesInsertar = productosTransferir.map((p) => ({
      id_transferencia: idTransferencia,
      id_producto: p.id,
      cantidad: p.cantidad,
      cantidad_recibida: p.cantidad
    }));

    const { error: errDet } = await supabase.from("detalle_transferencia").insert(detallesInsertar);
    if (errDet) throw errDet;

    await get().mostrarTransferencias();
    get().resetFormulario();
  }
}));