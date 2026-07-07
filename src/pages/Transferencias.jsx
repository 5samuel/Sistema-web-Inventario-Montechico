import React, { useState } from "react";
import { useTransferenciasStore } from "../store/TransferenciasStore";
import { useUsuariosStore } from "../store/UsuariosStore"; // <-- Importamos tu store real
import { RegistrarTransferencia } from "../components/organismos/formularios/RegistrarTransferencia";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaPencil, FaTrashCan, FaPlus } from "react-icons/fa6";
import { toast } from "sonner";

export const Transferencias = () => {
  const store = useTransferenciasStore();
  const storeUsuarios = useUsuariosStore(); // <-- Instanciamos tu store de usuarios
  const [openForm, setOpenForm] = useState(false);
  const queryClient = useQueryClient();

  // Extraemos el id del usuario activo desde tu propiedad "datausuarios"
  const idUsuarioReal = storeUsuarios.datausuarios?.id;

  const { isLoading } = useQuery({
    queryKey: ["historialTransferencias"],
    queryFn: async () => {
      await store.mostrarTransferencias();
      return true;
    }
  });

  const handleRecibir = async (idTransferencia) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas recibir los productos de esta transferencia?");
    if (!confirmar) return;

    // Validación de seguridad con alerta nativa por si no tienes configurado Sonner en el Layout
    if (!idUsuarioReal) {
      console.error("Store de usuarios actual:", storeUsuarios.datausuarios);
      alert("❌ Error: No se detectó el ID del usuario en 'datausuarios'. Asegúrate de haber iniciado sesión correctamente.");
      return;
    }

    try {
      // Invocamos la acción de tu TransferenciasStore pasando los parámetros limpios
      await store.recibirTransferencia(idTransferencia, idUsuarioReal);

      toast.success("✅ ¡Éxito! Transferencia recibida e inventario actualizado.");
      queryClient.invalidateQueries(["historialTransferencias"]);

    } catch (error) {
      console.error("Error atrapado al recibir:", error);
      toast.error("❌ No se pudo recibir la mercancía: " + error.message);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la transferencia #${id}?`)) {
      try {
        await store.eliminarTransferencia(id);
        toast.success("Transferencia eliminada por completo.");
        queryClient.invalidateQueries(["historialTransferencias"]);
      } catch (e) { 
        toast.error(e.message); 
      }
    }
  };

  const handleEditar = async (transferencia) => {
    try {
      setOpenForm(false); 
      await store.prepararEdicion(transferencia); 
      setOpenForm(true);                     
    } catch (error) {
      toast.error("Error al cargar los productos de la transferencia");
    }
  };

  const handleCloseForm = () => {
    store.resetFormulario();
    setOpenForm(false);
  };

  return (
    <div style={{ padding: "40px", background: "#f4f7f6", minHeight: "100vh" }}>
      {/* CABECERA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
        <div>
          <h1 style={{ color: "#2c3e50", margin: "0 0 10px 0", fontSize: "28px" }}>Gestión de Transferencias</h1>
          <p style={{ color: "#7f8c8d", margin: 0 }}>Administra el movimiento de mercancía entre almacenes.</p>
        </div>
        <button 
          onClick={() => { store.resetFormulario(); setOpenForm(true); }} 
          style={{ 
            background: "#2c3e50", color: "#fff", padding: "12px 24px", border: "none", borderRadius: "8px", 
            cursor: "pointer", fontWeight: "bold", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}
        >
          <FaPlus /> Registrar Envío
        </button>
      </div>

      {openForm && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <RegistrarTransferencia onClose={handleCloseForm} />
        </div>
      )}

      {/* TARJETA DE TABLA */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", padding: "20px", border: "1px solid #e1e4e8" }}>
        {isLoading ? <p style={{ textAlign: "center", padding: "20px" }}>Cargando registros...</p> : (
          <table width="100%" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: "15px", color: "#64748b", borderBottom: "2px solid #e2e8f0", fontSize: "12px" }}>Nº</th>
                <th style={{ padding: "15px", color: "#64748b", borderBottom: "2px solid #e2e8f0", fontSize: "12px" }}>Fecha</th>
                <th style={{ padding: "15px", color: "#64748b", borderBottom: "2px solid #e2e8f0", fontSize: "12px" }}>Origen</th>
                <th style={{ padding: "15px", color: "#64748b", borderBottom: "2px solid #e2e8f0", fontSize: "12px" }}>Destino</th>
                <th style={{ padding: "15px", color: "#64748b", borderBottom: "2px solid #e2e8f0", fontSize: "12px" }}>Estado</th>
                <th style={{ padding: "15px", color: "#64748b", borderBottom: "2px solid #e2e8f0", fontSize: "12px", textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {store.transferencias && store.transferencias.map((item) => {
                const estadoLimpio = item.estado ? item.estado.toUpperCase().trim() : "";
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "15px", fontWeight: "bold" }}>#{item.id}</td>
                    <td style={{ padding: "15px" }}>{new Date(item.fecha).toLocaleDateString()}</td>
                    <td style={{ padding: "15px" }}>{item.almacen_origen?.nombre || "-"}</td>
                    <td style={{ padding: "15px" }}>{item.almacen_destino?.nombre || "-"}</td>
                    <td style={{ padding: "15px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "15px", fontSize: "11px", fontWeight: "bold", background: estadoLimpio === "RECIBIDO" ? "#dcfce7" : "#dbeafe", color: estadoLimpio === "RECIBIDO" ? "#166534" : "#1e40af" }}>
                        {item.estado || "SIN ESTADO"}
                      </span>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        {estadoLimpio !== "RECIBIDO" ? (
                          <>
                            <button 
                              onClick={() => handleRecibir(item.id)} 
                              style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                            >
                              Recibir
                            </button>
                            <button onClick={() => handleEditar(item)} style={{ background: "#fff", border: "1px solid #cbd5e1", padding: "5px 10px", borderRadius: "6px", cursor: "pointer" }}><FaPencil size={12} /></button>
                          </>
                        ) : <span style={{ color: "#94a3b8", fontSize: "12px" }}>Finalizado</span>}
                        <button onClick={() => handleEliminar(item.id)} style={{ background: "#fff", border: "1px solid #fca5a5", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", color: "#ef4444" }}><FaTrashCan size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};