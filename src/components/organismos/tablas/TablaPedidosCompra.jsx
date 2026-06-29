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
import { FaArrowsAltV, FaCheckCircle, FaStickyNote } from "react-icons/fa";

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
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
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
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sí, recibir",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await recibirPedidoCompra({ id_pedido: p.id });
      }
    });
  }

  const columns = useMemo(() => [
    {
      accessorKey: "id",
      header: "N° Pedido",
      cell: (info) => (
        <div className="ContentCell order-number">
          <span>{`#${info.getValue()}`}</span>
        </div>
      ),
    },
    {
      id: "proveedor",
      header: "Proveedor",
      cell: (info) => {
        const item = info.row.original;
        const nombreProveedor = 
          item.proveedor || 
          (item.clientes_proveedores && item.clientes_proveedores.nombres) || 
          (item.proveedores && item.proveedores.nombre) || 
          "Sin proveedor";
          
        return (
          <div className="ContentCell provider-cell">
            <span>{nombreProveedor}</span>
          </div>
        );
      },
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
      accessorKey: "observacion",
      header: "Nota / Observación",
      cell: (info) => {
        const val = info.getValue();
        return (
          <div className="ContentCell note-cell">
            <NoteWrapper title={val || "Sin observaciones"}>
              <FaStickyNote className="note-icon" />
              <span className="note-text">{val || "—"}</span>
            </NoteWrapper>
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: (info) => (
        <div className="ContentCell total-cell">
          <strong>{`$${Number(info.getValue()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</strong>
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
            <StatusBadge estado={estado.toLowerCase()}>
              <span className="dot" />
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
      <div className="table-wrapper">
        <table className="responsive-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    <div className="header-content">
                      {header.column.columnDef.header}
                      {header.column.getCanSort() && (
                        <span
                          className="sort-icon"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <FaArrowsAltV />
                        </span>
                  )}
                  {{ asc: " 🔼", desc: " 🔽" }[header.column.getIsSorted()]}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((item) => (
              <tr key={item.id}>
                {item.getVisibleCells().map((cell) => (
                  <td key={cell.id} data-title={cell.column.columnDef.header?.toString().toUpperCase()}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

// --- COMPONENTES ESTILIZADOS NUEVOS Y OPTIMIZADOS ---

const NoteWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.03);
  padding: 6px 12px;
  border-radius: 20px;
  max-width: 260px; /* Incrementado para que quepa mucho más texto */
  width: 100%;
  
  .note-icon {
    color: #f59e0b;
    flex-shrink: 0;
    font-size: 12px;
  }

  .note-text {
    font-size: 13px;
    color: ${({ theme }) => theme.text};
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 30px;
  font-size: 0.78em;
  font-weight: 700;
  letter-spacing: 0.5px;
  background-color: ${({ estado }) => estado === "recibido" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)"};
  color: ${({ estado }) => estado === "recibido" ? "#10b981" : "#f59e0b"};
  border: 1px solid ${({ estado }) => estado === "recibido" ? "rgba(16, 185, 129, 0.25)" : "rgba(245, 158, 11, 0.25)"};

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${({ estado }) => estado === "recibido" ? "#10b981" : "#f59e0b"};
  }
`;

const Container = styled.div`
  position: relative;
  margin: 2% 3%;
  background: ${({ theme }) => theme.bgtotal || "#ffffff"};
  border-radius: 14px;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.02);
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  @media (min-width: ${v.bpbart}) { margin: 1.5%; padding: 24px; }
  
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
    border-radius: 10px;
  }

  .ObjectRow {
    gap: 12px;
  }

  .order-number span {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 13px;
  }

  .provider-cell {
    font-weight: 500;
    color: ${({ theme }) => theme.text};
  }

  .total-cell strong {
    color: ${({ theme }) => theme.text};
    font-size: 15px;
  }

  .btn-recibir {
    background-color: #10b981;
    color: white;
    border: none;
    padding: 7px 14px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85em;
    font-weight: 600;
    transition: 0.2s ease;
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.15);
    &:hover { 
      background-color: #059669; 
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(16, 185, 129, 0.25);
    }
  }

  .responsive-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    @media (min-width: ${v.bpbart}) { font-size: 0.9em; }
    @media (min-width: ${v.bpmarge}) { font-size: 0.95em; }
    
    thead {
      position: absolute;
      padding: 0; border: 0; height: 1px; width: 1px; overflow: hidden;
      @media (min-width: ${v.bpbart}) { position: relative; height: auto; width: auto; overflow: auto; }
      
      th {
        background: rgba(0, 0, 0, 0.02);
        border-bottom: 2px solid rgba(0, 0, 0, 0.06);
        font-weight: 600;
        color: ${({ theme }) => theme.text};
        padding: 16px 12px;
        opacity: 0.9;

        .header-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .sort-icon {
          cursor: pointer;
          font-size: 11px;
          color: #94a3b8;
          transition: 0.2s;
          &:hover { color: ${({ theme }) => theme.text}; }
        }
      }
    }
    
    tbody, tr, th, td { display: block; padding: 0; text-align: left; white-space: normal; }
    tr { @media (min-width: ${v.bpbart}) { display: table-row; } }
    th, td {
      vertical-align: middle;
      @media (min-width: ${v.bpbart}) { display: table-cell; padding: 14px 12px; text-align: center; }
    }
    
    tbody {
      @media (min-width: ${v.bpbart}) { display: table-row-group; }
      tr {
        margin-bottom: 12px;
        border: 1px solid rgba(0,0,0,0.05);
        border-radius: 8px;
        background: rgba(255,255,255,0.01);
        transition: background 0.2s ease;
        
        &:nth-of-type(even) { 
          background-color: rgba(0, 0, 0, 0.01); 
        }
        &:hover {
          background-color: rgba(59, 130, 246, 0.02);
        }
        @media (min-width: ${v.bpbart}) { display: table-row; border-radius: 0; border: none; }
      }
      
      tr:not(:last-child) td {
        @media (min-width: ${v.bpbart}) {
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }
      }
      
      .ContentCell {
        text-align: right;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        @media (min-width: ${v.bpbart}) { justify-content: center; border-bottom: none; padding: 0; }
      }

      .note-cell {
        @media (min-width: ${v.bpbart}) {
          display: flex;
          justify-content: center;
        }
      }
      
      td[data-title]:before {
        content: attr(data-title);
        float: left;
        font-size: 0.75em;
        font-weight: 700;
        color: #64748b;
        letter-spacing: 0.5px;
        @media (min-width: ${v.bpbart}) { content: none; }
      }
    }
  }
`;