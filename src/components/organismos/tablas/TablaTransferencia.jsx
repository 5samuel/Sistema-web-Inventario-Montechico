import styled from "styled-components";
import { useState } from "react";
import {
  ContentAccionesTabla,
  Paginacion,
  useTransferenciasStore,
} from "../../../index";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaArrowsAltV } from "react-icons/fa";

export function TablaTransferencia({ data, SetopenRegistro, setdataSelect, setAccion }) {
  // Obtenemos las funciones del store
  const { enviarTransferencia, recibirTransferencia } = useTransferenciasStore();
  
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const columns = [
    { accessorKey: "id", header: "ID" },
    { 
      accessorKey: "fecha", 
      header: "Fecha",
      cell: (info) => <span>{new Date(info.getValue()).toLocaleDateString()}</span> 
    },
    { accessorKey: "origen", header: "Origen" },
    { accessorKey: "destino", header: "Destino" },
    { accessorKey: "estado", header: "Estado" },
    {
      header: "Acciones",
      cell: (info) => {
        const item = info.row.original;
        return (
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            {/* Botón ENVIAR: Solo aparece si está PENDIENTE */}
            {item.estado === "PENDIENTE" && (
              <button 
                onClick={() => enviarTransferencia(item.id)}
                style={{ background: "#3498db", color: "white", padding: "5px 10px", borderRadius: "4px", border: "none" }}
              >
                Enviar
              </button>
            )}
            
            {/* Botón RECIBIR: Solo aparece si está EN_TRANSITO */}
            {item.estado === "EN_TRANSITO" && (
              <button 
                onClick={() => recibirTransferencia(item.id)}
                style={{ background: "#27ae60", color: "white", padding: "5px 10px", borderRadius: "4px", border: "none" }}
              >
                Recibir
              </button>
            )}

            <ContentAccionesTabla
              editar={() => {
                setAccion("Editar");
                setdataSelect(item);
                SetopenRegistro(true);
              }}
              eliminar={() => console.log("Eliminar", item.id)}
            />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Container>
      <table className="responsive-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  <span style={{ cursor: "pointer", marginLeft: "5px" }} onClick={header.column.getToggleSortingHandler()}>
                    <FaArrowsAltV />
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((item) => (
            <tr key={item.id}>
              {item.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Paginacion
        table={table}
        irinicio={() => table.setPageIndex(0)}
        pagina={table.getState().pagination.pageIndex + 1}
        maximo={table.getPageCount()}
      />
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  .responsive-table {
    width: 100%;
    border-spacing: 0;
    thead th {
      border-bottom: 2px solid ${({ theme }) => theme.color2};
      padding: 10px;
    }
    tbody td {
      text-align: center;
      padding: 10px;
      border-bottom: 1px solid rgba(161, 161, 161, 0.2);
    }
  }
`;