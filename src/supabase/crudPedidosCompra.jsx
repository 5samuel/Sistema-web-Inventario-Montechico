import { supabase } from "../index";

const tabla = "pedidos_compra";

// 1. Insertar Pedido de Compra
export async function InsertarPedidosCompra(p) {
  const { error, data } = await supabase.rpc("insertarpedidocompra", {
    _id_empresa: p._id_empresa,
    _id_proveedor: p._id_proveedor || null, // Maneja opcional si no hay proveedor seleccionado aún
    _id_usuario: p._id_usuario || null,
    _id_sucursal: p._id_sucursal,
    _id_almacen: p._id_almacen,
    _observacion: p._descripcion, // Mapeado de dataForm.descripcion
    _total: p._total,
    _detalle: p._detalles // Mapeado del array de la grilla interactiva
  });

  if (error) {
    throw new Error(error.message);
  }
  console.log(data);
  return data;
}

// 2. Mostrar Pedidos de Compra
// 📁 Ubicación: src/supabase/crudPedidosCompra.jsx
export async function MostrarPedidosCompra(p) {
  const { data, error } = await supabase
    .from("pedidos_compra")
    .select(`
      *,
      observacion,
      clientes_proveedores (
        nombres
      ),
      detalle_pedido_compra (
        id,
        cantidad,
        precio_compra,
        id_producto,
        total,
        productos (
          id,
          nombre
        )
      )
    `)
    .eq("id_empresa", p.id_empresa);

  if (error) throw new Error(error.message);
  return data;
}

// 3. Buscar Pedidos de Compra
export async function BuscarPedidosCompra(p) {
  const { data, error } = await supabase.rpc("buscarpedidocompra", {
    _id_empresa: p.id_empresa,
    buscador: p.buscador,
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

// 4. Editar Pedido de Compra
export async function EditarPedidosCompra(p) {
  const { error } = await supabase.rpc("editarpedidocompra", {
    _id: p._id,
    _id_proveedor: p._id_proveedor || null,
    _id_almacen: p._id_almacen,
    _observacion: p._descripcion,
    _total: p._total,
    _detalle: p._detalles
  });

  if (error) {
    throw new Error(error.message);
  }
}

// 5. Eliminar Pedido de Compra
export async function EliminarPedidosCompra(p) {
  const { error } = await supabase.from(tabla).delete().eq("id", p.id);
  
  if (error) {
    throw new Error(error.message);
  }
}

// 6. Recibir Pedido (Soporta p.id y p.id_pedido enviado desde la tabla)
export async function RecibirPedidoCompra(p) {
  const idPedido = p.id_pedido || p.id;
  const { error } = await supabase.rpc("recibirpedidocompra", {
    _id_pedido: idPedido,
  });

  if (error) {
    throw new Error(error.message);
  }
}

// ==========================================
// ALIAS DE SEGURIDAD PARA EVITAR CRASHES POR IMPORTACIÓN (Minúsculas/Mayúsculas)
// ==========================================
export const mostrarPedidosCompra = MostrarPedidosCompra;
export const mostrarPedidos = MostrarPedidosCompra;
export const buscarPedidosCompra = BuscarPedidosCompra;
export const insertarPedidosCompra = InsertarPedidosCompra;
export const editarPedidosCompra = EditarPedidosCompra;
export const eliminarPedidosCompra = EliminarPedidosCompra;
export const recibirPedidoCompra = RecibirPedidoCompra;