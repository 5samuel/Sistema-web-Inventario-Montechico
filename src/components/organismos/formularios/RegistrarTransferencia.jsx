import React, { useState, useEffect } from "react";
import { useTransferenciasStore } from "../../../store/TransferenciasStore";
import { useUsuariosStore } from "../../../store/UsuariosStore";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const RegistrarTransferencia = ({ onClose }) => {
  const store = useTransferenciasStore();
  const { datausuarios } = useUsuariosStore();

  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidadInput, setCantidadInput] = useState(1);
  const [observacion, setObservacion] = useState("");

  // 🧠 Cargar Almacenes y Productos Reales de la BD usando React Query
  const { isLoading: cargandoAlmacenes } = useQuery({
    queryKey: ["cargar almacenes formulario"],
    queryFn: async () => {
      await store.cargarAlmacenes();
      return true;
    }
  });

  const { isLoading: cargandoProductos } = useQuery({
    queryKey: ["cargar productos formulario"],
    queryFn: async () => {
      await store.cargarProductos();
      return true;
    }
  });

  const handleAgregarProducto = (e) => {
    e.preventDefault();
    if (!productoSeleccionado) return toast.error("Por favor, selecciona un producto");
    if (cantidadInput <= 0) return toast.error("La cantidad debe ser mayor a cero");

    // Buscar los datos completos del producto en la lista que bajó de la base de datos
    const prodReal = store.productosDB.find((p) => p.id === parseInt(productoSeleccionado));
    
    store.agregarProductoTransferencia(prodReal, cantidadInput);
    
    // Resetear selectores de producto
    setProductoSeleccionado("");
    setCantidadInput(1);
  };

  const handleGuardarTodo = async () => {
    try {
      // Pasamos el id del usuario de tu store global
      await store.guardarTransferencia(datausuarios?.id, observacion);
      toast.success("¡Transferencia e inventario procesados correctamente!");
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="modal-transferencia" style={{ padding: "25px", background: "#fff", borderRadius: "12px", width: "550px", boxShadow: "0px 5px 15px rgba(0,0,0,0.2)" }}>
      <h2 style={{ marginTop: 0, color: "#2c3e50" }}>Crear Nueva Transferencia</h2>
      
      {/* DATOS DE CONTROL */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
        <div>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Fecha de Operación:</label>
          <input 
            type="date" 
            style={{ width: "90%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            value={store.fechaTransferencia} 
            onChange={(e) => store.setFechaTransferencia(e.target.value)} 
          />
        </div>
        
        <div>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Almacén Origen:</label>
          <select 
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            value={store.almacenOrigen}
            onChange={(e) => store.setAlmacenOrigen(e.target.value)}
          >
            <option value="">-- Seleccione Origen --</option>
            {store.almacenesDB.map(almacen => (
              <option key={almacen.id} value={almacen.id}>{almacen.nombre}</option>
            ))}
          </select>
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Almacén Destino:</label>
          <select 
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            value={store.almacenDestino}
            onChange={(e) => store.setAlmacenDestino(e.target.value)}
          >
            <option value="">-- Seleccione Destino --</option>
            {store.almacenesDB.map(almacen => (
              <option key={almacen.id} value={almacen.id}>{almacen.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* AGREGAR PRODUCTOS */}
      <form onSubmit={handleAgregarProducto} style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "20px", background: "#f8f9fa", padding: "12px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
        <div style={{ flex: 2 }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Buscar Producto:</label>
          <select 
            style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
            value={productoSeleccionado} 
            onChange={(e) => setProductoSeleccionado(e.target.value)}
          >
            <option value="">{cargandoProductos ? "Cargando catálogo..." : "-- Elegir Producto --"}</option>
            {store.productosDB.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Cantidad:</label>
          <input 
            type="number" 
            min="1" 
            style={{ width: "80%", padding: "8px", borderRadius: "4px" }}
            value={cantidadInput} 
            onChange={(e) => setCantidadInput(e.target.value)} 
          />
        </div>
        <button type="submit" style={{ background: "#2c3e50", color: "#fff", padding: "9px 15px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          + Añadir
        </button>
      </form>

      {/* TABLA DE PRODUCTOS PRE-SELECCIONADOS */}
      <h4 style={{ margin: "10px 0" }}>Detalle del Movimiento</h4>
      <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "4px", marginBottom: "15px" }}>
        <table width="100%" style={{ borderCollapse: "collapse" }} cellPadding="8">
          <thead>
            <tr style={{ background: "#e9ecef", textAlign: "left", fontSize: "14px" }}>
              <th>Producto</th>
              <th style={{ textAlign: "center" }}>Cantidad</th>
              <th style={{ textAlign: "center" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {store.productosTransferir.map((prod) => (
              <tr key={prod.id} style={{ borderBottom: "1px solid #dee2e6", fontSize: "14px" }}>
                <td>{prod.nombre}</td>
                <td align="center" style={{ fontWeight: "bold" }}>{prod.cantidad}</td>
                <td align="center">
                  <button 
                    type="button"
                    onClick={() => store.eliminarProductoTransferencia(prod.id)}
                    style={{ color: "#e74c3c", border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}
                  >
                    Quitar ❌
                  </button>
                </td>
              </tr>
            ))}
            {store.productosTransferir.length === 0 && (
              <tr>
                <td colSpan="3" align="center" style={{ color: "#7f8c8d", padding: "15px" }}>No has agregado ningún ítem todavía.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SUMA AUTOMÁTICA */}
      <div style={{ textAlign: "right", fontWeight: "bold", fontSize: "15px", marginBottom: "15px", color: "#2c3e50" }}>
        Total de Unidades a Mover: <span style={{ color: "#e67e22", fontSize: "18px" }}>{store.totalCantidadProductos}</span>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Observaciones / Justificación:</label>
        <input 
          type="text" 
          placeholder="Escribe el motivo del traslado aquí..."
          style={{ width: "96%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          value={observacion} 
          onChange={(e) => setObservacion(e.target.value)} 
        />
      </div>

      {/* BOTONES DE CIERRE */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button 
          onClick={() => { store.resetFormulario(); onClose(); }} 
          style={{ padding: "8px 15px", background: "#bdc3c7", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Cancelar
        </button>
        <button 
          onClick={handleGuardarTodo} 
          disabled={store.productosTransferir.length === 0}
          style={{ padding: "8px 15px", background: store.productosTransferir.length === 0 ? "#95a5a6" : "#27ae60", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          Confirmar y Enviar
        </button>
      </div>
    </div>
  );
};