import React, { useState, useEffect } from "react";
import { useTransferenciasStore } from "../../../store/TransferenciasStore";
import { useUsuariosStore } from "../../../store/UsuariosStore";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const RegistrarTransferencia = ({ onClose }) => {
  const {
    transferenciaSeleccionada,
    transferencias,
    fechaTransferencia,
    almacenOrigen,
    almacenDestino,
    productosTransferir,
    almacenesDB,
    productosDB,
    setFechaTransferencia,
    setAlmacenOrigen,
    setAlmacenDestino,
    agregarProductoTransferencia,
    eliminarProductoTransferencia,
    guardarTransferencia,
    resetFormulario,
    isLoading
  } = useTransferenciasStore();

  const { datausuarios } = useUsuariosStore();
  const queryClient = useQueryClient();

  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidadInput, setCantidadInput] = useState(1);
  const [observacion, setObservacion] = useState("");
  const [guardando, setGuardando] = useState(false);

  // 🔄 Carga segura de catálogos base usando useEffect estándar (Adios errores de useQuery)
  // 🔄 Carga segura de catálogos base usando useEffect estándar
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        if (almacenesDB.length === 0) {
          await useTransferenciasStore.getState().cargarAlmacenes();
        }
        if (productosDB.length === 0) {
          await useTransferenciasStore.getState().cargarProductos();
        }
      } catch (error) {
        console.error("❌ Error al cargar los catálogos en el formulario:", error);
      }
    };

    cargarCatalogos();
  }, [almacenesDB.length, productosDB.length]);

  // Sincronizar observaciones en modo edición
  useEffect(() => {
    if (transferenciaSeleccionada) {
      const transferenciaActual = transferencias.find(
        (t) => (t.id || t.id_transferencia) === transferenciaSeleccionada
      );
      if (transferenciaActual) {
        setObservacion(transferenciaActual.observacion || "");
      }
    } else {
      setObservacion("");
    }
  }, [transferenciaSeleccionada, transferencias]);

  // 🛡️ ESCUDO DE ESPERA: Solo bloquea si Zustand está buscando los detalles en la BD
  if (isLoading) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
        <div style={{ background: "#fff", padding: "25px", borderRadius: "8px", fontWeight: "bold" }}>
          🔄 Recuperando artículos de la transferencia...
        </div>
      </div>
    );
  }

  const handleAgregarProducto = (e) => {
    e.preventDefault();
    if (!productoSeleccionado) return toast.error("Selecciona un producto.");
    if (cantidadInput <= 0) return toast.error("La cantidad debe ser mayor a 0.");

    const prodReal = productosDB.find((p) => p.id === parseInt(productoSeleccionado));
    if (prodReal) {
      agregarProductoTransferencia(prodReal, cantidadInput);
      setProductoSeleccionado("");
      setCantidadInput(1);
    }
  };

  const handleGuardarTodo = async () => {
    setGuardando(true);
    try {
      await guardarTransferencia(datausuarios?.id, observacion);
      toast.success(transferenciaSeleccionada ? "¡Cambios guardados!" : "¡Transferencia creada!");
      queryClient.invalidateQueries(["historialTransferencias"]);
      onClose();
    } catch (error) {
      toast.error(error.message || "Error al procesar.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", padding: "25px", borderRadius: "12px", width: "550px", boxShadow: "0px 5px 15px rgba(0,0,0,0.3)" }}>
        
        <h2 style={{ marginTop: 0, color: "#2c3e50" }}>
          {transferenciaSeleccionada ? `✏️ Editando: Transferencia #${transferenciaSeleccionada}` : "🚀 Nueva Transferencia"}
        </h2>

        {/* --- CABECERA --- */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "15px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Fecha:</label>
            <input 
              type="date" 
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} 
              value={fechaTransferencia || ""} 
              onChange={(e) => setFechaTransferencia(e.target.value)} 
            />
          </div>
          
          <div>
            <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Almacén Origen:</label>
            <select 
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} 
              value={almacenOrigen || ""} 
              onChange={(e) => setAlmacenOrigen(e.target.value)}
            >
              <option value="">-- Seleccione Origen --</option>
              {almacenesDB.map(a => (
                <option key={a.id} value={a.id.toString()}>{a.nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Almacén Destino:</label>
            <select 
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} 
              value={almacenDestino || ""} 
              onChange={(e) => setAlmacenDestino(e.target.value)}
            >
              <option value="">-- Seleccione Destino --</option>
              {almacenesDB.map(a => (
                <option key={a.id} value={a.id.toString()}>{a.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- AGREGAR PRODUCTOS --- */}
        <form onSubmit={handleAgregarProducto} style={{ display: "flex", gap: "5px", marginBottom: "15px", background: "#f8f9fa", padding: "10px", borderRadius: "8px" }}>
          <select style={{ flex: 2, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)}>
            <option value="">Buscar producto...</option>
            {productosDB.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
          <input type="number" style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} placeholder="Cant." value={cantidadInput} onChange={(e) => setCantidadInput(e.target.value)} />
          <button type="submit" style={{ background: "#2c3e50", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>+</button>
        </form>

        {/* --- LISTA DE PRODUCTOS --- */}
        <div style={{ maxHeight: "160px", overflowY: "auto", border: "1px solid #ddd", marginBottom: "15px", borderRadius: "6px" }}>
          <table width="100%" style={{ borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f1f2f6", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Producto</th>
                <th style={{ padding: "10px", width: "80px" }}>Cantidad</th>
                <th style={{ padding: "10px", width: "50px", textAlign: "center" }}>Quitar</th>
              </tr>
            </thead>
            <tbody>
              {productosTransferir.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: "15px", textAlign: "center", color: "#7f8c8d", fontStyle: "italic" }}>
                    No hay productos en esta transferencia.
                  </td>
                </tr>
              ) : (
                productosTransferir.map((prod) => (
                  <tr key={prod.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px" }}>{prod.nombre}</td>
                    <td style={{ padding: "10px", fontWeight: "bold" }}>{prod.cantidad}</td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <button 
                        type="button" 
                        onClick={() => eliminarProductoTransferencia(prod.id)} 
                        style={{ color: "#e74c3c", border: "none", background: "none", cursor: "pointer", fontSize: "14px" }}
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- OBSERVACIONES --- */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>Observaciones:</label>
          <input 
            type="text" 
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" }} 
            value={observacion} 
            onChange={(e) => setObservacion(e.target.value)} 
          />
        </div>

        {/* --- BOTONES --- */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button 
            type="button" 
            onClick={() => { resetFormulario(); onClose(); }} 
            style={{ padding: "8px 16px", borderRadius: "4px", border: "1px solid #ccc", cursor: "pointer", background: "#fff" }}
          >
            Cancelar
          </button>
          
          <button 
            type="button" 
            onClick={handleGuardarTodo} 
            disabled={guardando} 
            style={{ padding: "8px 16px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

      </div>
    </div>
  );
};