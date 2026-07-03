import React, { useEffect, useState } from "react";
import { useTransferenciasStore } from "../store/TransferenciasStore";
import { RegistrarTransferencia } from "../components/organismos/formularios/RegistrarTransferencia";

export const Transferencias = () => {
  const { transferencias, mostrarTransferencias, isLoading } = useTransferenciasStore();
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    mostrarTransferencias();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Módulo de Transferencias entre Almacenes</h1>
        <button 
          onClick={() => setOpenForm(true)} 
          style={{ background: "#3498db", color: "#fff", padding: "10px 15px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          ➕ Nueva Transferencia
        </button>
      </div>

      {/* MODAL / FORMULARIO FLOTANTE */}
      {openForm && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <RegistrarTransferencia onClose={() => setOpenForm(false)} />
        </div>
      )}

      {/* TABLA PRINCIPAL DE HISTORIAL */}
      <h3>Historial de Movimientos</h3>
      {isLoading ? (
        <p>Cargando transferencias...</p>
      ) : (
        <table width="100%" border="1" cellPadding="10" style={{ borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#2c3e50", color: "#fff" }}>
              <th>ID</th>
              <th>Fecha</th>
              <th>Almacén Origen</th>
              <th>Almacén Destino</th>
              <th>Estado</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            {transferencias.map((t) => (
              <tr key={t.id}>
                <td align="center">#{t.id}</td>
                <td align="center">{new Date(t.fecha).toLocaleDateString()}</td>
                <td>{t.almacen_origen?.nombre || "N/A"}</td>
                <td>{t.almacen_destino?.nombre || "N/A"}</td>
                <td align="center">
                  <span style={{ padding: "4px 8px", background: "#2ecc71", color: "#fff", borderRadius: "4px", fontSize: "12px" }}>
                    {t.estado}
                  </span>
                </td>
                <td>{t.observacion}</td>
              </tr>
            ))}
            {transferencias.length === 0 && (
              <tr>
                <td colSpan="6" align="center">No se han registrado transferencias aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};