import { create } from "zustand";
import { supabase } from "../supabase/supabase.config";

export const useTransferenciasStore = create((set, get) => ({
  // Listas de base de datos
  transferencias: [],
  almacenesDB: [],
  productosDB: [],
  isLoading: false,

  // Estados del formulario actual
  almacenOrigen: "",
  almacenDestino: "",
  fechaTransferencia: new Date().toISOString().split("T")[0],
  productosTransferir: [], 
  totalCantidadProductos: 0,

  // Setters
  setAlmacenOrigen: (id) => set({ almacenOrigen: id }),
  setAlmacenDestino: (id) => set({ almacenDestino: id }),
  setFechaTransferencia: (fecha) => set({ fechaTransferencia: fecha }),

  // 1. CARGAR ALMACENES DISPONIBLES
  cargarAlmacenes: async () => {
    const { data, error } = await supabase
      .from("almacen")
      .select("id, nombre")
      .eq("delete", true); // Filtrar solo los activos si usas borrado lógico

    if (!error) set({ almacenesDB: data || [] });
    else console.error("Error al cargar almacenes:", error.message);
  },

  // 2. CARGAR PRODUCTOS DISPONIBLES
  cargarProductos: async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("id, nombre, precio_compra, precio_venta");

    if (!error) set({ productosDB: data || [] });
    else console.error("Error al cargar productos:", error.message);
  },

  // 3. AGREGAR PRODUCTO AL "CARRITO" TEMPORAL
  agregarProductoTransferencia: (producto, cantidad) => {
    const { productosTransferir } = get();
    const existe = productosTransferir.find((p) => p.id === producto.id);

    let nuevosProductos;
    if (existe) {
      nuevosProductos = productosTransferir.map((p) =>
        p.id === producto.id ? { ...p, cantidad: p.cantidad + parseFloat(cantidad) } : p
      );
    } else {
      nuevosProductos = [...productosTransferir, { ...producto, cantidad: parseFloat(cantidad) }];
    }

    const nuevoTotal = nuevosProductos.reduce((acc, p) => acc + p.cantidad, 0);
    set({ productosTransferir: nuevosProductos, totalCantidadProductos: nuevoTotal });
  },

  // 4. ELIMINAR PRODUCTO TEMPORAL
  eliminarProductoTransferencia: (productoId) => {
    const { productosTransferir } = get();
    const nuevosProductos = productosTransferir.filter((p) => p.id !== productoId);
    const nuevoTotal = nuevosProductos.reduce((acc, p) => acc + p.cantidad, 0);

    set({ productosTransferir: nuevosProductos, totalCantidadProductos: nuevoTotal });
  },

  resetFormulario: () => set({
    almacenOrigen: "",
    almacenDestino: "",
    fechaTransferencia: new Date().toISOString().split("T")[0],
    productosTransferir: [],
    totalCantidadProductos: 0
  }),

  // 5. MOSTRAR HISTORIAL DE TRANSFERENCIAS REALIZADAS
  mostrarTransferencias: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from("transferencia_almacen")
      .select(`
        id,
        fecha,
        estado,
        observacion,
        almacen_origen:id_almacen_origen(nombre),
        almacen_destino:id_almacen_destino(nombre)
      `)
      .order("fecha", { ascending: false });

    if (!error) {
      set({ transferencias: data || [], isLoading: false });
    } else {
      console.error("Error historial:", error.message);
      set({ isLoading: false });
    }
  },

  // 6. PROCESAR E INSERTAR TODO EN LA BD
  guardarTransferencia: async (idUsuario, observacion = "-") => {
    const { almacenOrigen, almacenDestino, fechaTransferencia, productosTransferir } = get();

    if (!almacenOrigen || !almacenDestino) throw new Error("Debes seleccionar ambos almacenes.");
    if (almacenOrigen === almacenDestino) throw new Error("El almacén de origen y destino no pueden ser iguales.");
    if (productosTransferir.length === 0) throw new Error("Agrega al menos un producto.");

    // Insertar Cabecera en transferencia_almacen
    const { data: cabecera, error: errCabecera } = await supabase
      .from("transferencia_almacen")
      .insert({
        fecha: fechaTransferencia,
        id_almacen_origen: parseInt(almacenOrigen),
        id_almacen_destino: parseInt(almacenDestino),
        estado: "COMPLETADO",
        observacion: observacion,
        id_usuario: idUsuario
      })
      .select()
      .single();

    if (errCabecera) throw new Error(errCabecera.message);

    // Insertar filas en detalle_transferencia
    const detallesInsertar = productosTransferir.map((p) => ({
      id_transferencia: cabecera.id,
      id_producto: p.id,
      cantidad: p.cantidad,
      cantidad_recibida: p.cantidad
    }));

    const { error: errDetalle } = await supabase
      .from("detalle_transferencia")
      .insert(detallesInsertar);

    if (errDetalle) throw new Error(errDetalle.message);

    // Refrescar datos
    get().mostrarTransferencias();
    get().resetFormulario();
  }
}));