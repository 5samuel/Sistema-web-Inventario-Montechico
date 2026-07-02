import styled from "styled-components";
import {
  Paginacion,
} from "../../../index"; // Asegúrate de ajustar esta ruta
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaArrowsAltV } from "react-icons/fa";

export function TablaTransferencia({ data }) {
  if (!data) return null;

  const [pagination, setPagination] = useState({
    pageIndex: 0, 
    pageSize: 5,  
  });

  // Define aquí las columnas específicas para Transferencias
  const columns = [
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: (info) => <span>{info.getValue()}</span>,
    },
    {
      accessorKey: "origen",
      header: "Origen",
      cell: (info) => <span>{info.getValue()}</span>,
    },
    {
      accessorKey: "destino",
      header: "Destino",
      cell: (info) => <span>{info.getValue()}</span>,
    },
    {
      accessorKey: "monto",
      header: "Monto",
      cell: (info) => <span>${Number(info.getValue()).toFixed(2)}</span>,
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
                  {header.column.columnDef.header}
                  {header.column.getCanSort() && (
                    <span style={{ cursor: "pointer", marginLeft: "5px" }} onClick={header.column.getToggleSortingHandler()}>
                      <FaArrowsAltV />
                    </span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((item) => (
            <tr key={item.id}>
              {item.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
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
  /* Puedes reutilizar los estilos de tu ejemplo anterior */
  width: 100%;
  .responsive-table {
    width: 100%;
    border-collapse: collapse;
    th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: center; }
  }
`;