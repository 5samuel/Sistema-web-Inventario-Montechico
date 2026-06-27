import styled from "styled-components";
import {
  ContentAccionesTabla,
  Paginacion,
  usePedidosCompraStore,
} from "../../../index";
import Swal from "sweetalert2";
import { v } from "../../../styles/variables";
import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaArrowsAltV, FaCheckCircle } from "react-icons/fa";

export function TablaPedidosCompra({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  if (data == null) return null;
  const [pagina, setPagina] = useState(1);
  const [columnFilters, setColumnFilters] = useState([]);

  const { eliminarPedidosCompra, recibirPedidoCompra } = usePedidosCompraStore();

  // Función para eliminar/cancelar un pedido
  function eliminar(p) {
    if (p.estado === "recibido") {
      Swal.fire({
        icon: "error",
        title: "No permitido",
        text: "No puedes eliminar un pedido que ya ha sido recibido.",
      });
      return;
    }
    Swal.fire({
      title: "¿Estás seguro de eliminar este pedido?",
      text: "¡Esta acción no se puede deshacer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await eliminarPedidosCompra({ id: p.id });
      }
    });
  }

  // Función para abrir la edición del pedido
  function editar(item) {
    if (item.estado === "recibido") {
      Swal.fire({
        icon: "warning",
        title: "Pedido Recibido",
        text: "Los pedidos con estado 'recibido' no se pueden editar.",
      });
      return;
    }
    SetopenRegistro(true);
    setdataSelect(item);
    setAccion("Editar");
  }

  // Función para procesar la entrada de stock (Recibir Pedido)
  function handleRecibir(p) {
    Swal.fire({
      title: "¿Recibir mercadería?",
      text: "Se cambiará el estado a 'recibido' e incrementará el stock en el almacén seleccionado.",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, recibir",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await recibirPedidoCompra({ id_pedido: p.id });
      }
    });
  }

  // 🟢 CONFIGURACIÓN CORREGIDA: Se cambiaron los <td> internos por celdas limpias
  const columns = useMemo(() => [
    {
      accessorKey: "id",
      header: "N° Pedido",
      cell: (info) => (
        <div className="ContentCell">
          <span>{`#${info.getValue()}`}</span>
        </div>
      ),
    },
    {
      accessorKey: "proveedor",
      header: "Proveedor",
      cell: (info) => (
        <div className="ContentCell">
          <span>{info.getValue() || "Sin proveedor"}</span>
        </div>
      ),
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: (info) => (
        <div className="ContentCell">
          <span>{new Date(info.getValue()).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: (info) => (
        <div className="ContentCell">
          <strong>{`$${Number(info.getValue()).toFixed(2)}`}</strong>
        </div>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: (info) => {
        const estado = info.getValue() || "pendiente";
        return (
          <div className="ContentCell">
            <StatusBadge estado={estado}>
              {estado.toUpperCase()}
            </StatusBadge>
          </div>
        );
      },
    },
    {
      accessorKey: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: (info) => {
        const item = info.row.original;
        return (
          <div className="ContentCell ObjectRow">
            {item.estado === "pendiente" && (
              <button 
                className="btn-recibir" 
                onClick={() => handleRecibir(item)} 
                title="Recibir pedido completo"
              >
                <FaCheckCircle /> Recibir
              </button>
            )}
            <ContentAccionesTabla
              funcionEditar={() => editar(item)}
              funcionEliminar={() => eliminar(item)}
            />
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
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
                    <span
                      style={{ cursor: "pointer", marginLeft: "5px" }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <FaArrowsAltV />
                    </span>
                  )}
                  {{ asc: " 🔼", desc: " 🔽" }[header.column.getIsSorted()]}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((item) => (
            <tr key={item.id}>
              {item.getVisibleCells().map((cell) => (
                /* El atributo data-title se lo pasamos al td principal de la tabla para conservar los estilos CSS responsive */
                <td key={cell.id} data-title={cell.column.columnDef.header?.toString().toUpperCase()}>
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
        setPagina={setPagina}
        maximo={table.getPageCount()}
      />
    </Container>
  );
}

// Estilos extendidos respetando tu diseño original
const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85em;
  font-weight: bold;
  background-color: ${({ estado }) => estado === "recibido" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)"};
  color: ${({ estado }) => estado === "recibido" ? "#10b981" : "#f59e0b"};
`;

const Container = styled.div`
  position: relative;
  margin: 5% 3%;
  @media (min-width: ${v.bpbart}) { margin: 2%; }
  
  .ObjectRow {
    gap: 8px;
  }

  .btn-recibir {
    background-color: #10b981;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85em;
    font-weight: 500;
    transition: 0.2s;
    &:hover { background-color: #059669; }
  }

  .responsive-table {
    width: 100%;
    margin-bottom: 1.5em;
    border-spacing: 0;
    @media (min-width: ${v.bpbart}) { font-size: 0.9em; }
    @media (min-width: ${v.bpmarge}) { font-size: 1em; }
    
    thead {
      position: absolute;
      padding: 0; border: 0; height: 1px; width: 1px; overflow: hidden;
      @media (min-width: ${v.bpbart}) { position: relative; height: auto; width: auto; overflow: auto; }
      th {
        border-bottom: 2px solid ${({ theme }) => theme.color2};
        font-weight: 700;
        text-align: center;
        color: ${({ theme }) => theme.text};
      }
    }
    
    tbody, tr, th, td { display: block; padding: 0; text-align: left; white-space: normal; }
    tr { @media (min-width: ${v.bpbart}) { display: table-row; } }
    th, td {
      padding: 0.5em; vertical-align: middle;
      @media (min-width: ${v.bplisa}) { padding: 0.75em 0.5em; }
      @media (min-width: ${v.bpbart}) { display: table-cell; padding: 0.5em; text-align: center; }
    }
    
    tbody {
      @media (min-width: ${v.bpbart}) { display: table-row-group; }
      tr {
        margin-bottom: 1em;
        &:nth-of-type(even) { background-color: rgba(161, 161, 161, 0.1); }
        @media (min-width: ${v.bpbart}) { display: table-row; }
      }
      
      .ContentCell {
        text-align: right;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;
        border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        @media (min-width: ${v.bpbart}) { justify-content: center; border-bottom: none; }
      }
      
      td[data-title]:before {
        content: attr(data-title);
        float: left;
        font-size: 0.8em;
        font-weight: 700;
        @media (min-width: ${v.bpbart}) { content: none; }
      }
    }
  }
`;