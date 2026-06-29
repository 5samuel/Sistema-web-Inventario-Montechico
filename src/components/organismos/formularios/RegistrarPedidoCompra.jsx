import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btn1,
  usePedidosCompraStore,
  useSucursalesStore,
  useAlmacenesStore,
  useProductosStore,
} from "../../../index";

import { useClientesProveedoresStore } from "../../../store/ClientesProveedoresStore"; 
import { ContainerSelector } from "../../atomos/ContainerSelector";
import { useForm } from "react-hook-form";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Device } from "../../../styles/breakpoints";
import { useEffect, useState } from "react";
import { SelectList } from "../../ui/lists/SelectList";
import { toast } from "sonner";
import { BtnClose } from "../../ui/buttons/BtnClose";
import { FaTrash, FaPlus } from "react-icons/fa";

export function RegistrarPedidosCompra({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
  state,
}) {
  if (!state) return null;

  const { insertarPedidosCompra, editarPedidosCompra } = usePedidosCompraStore();
  const { dataempresa } = useEmpresaStore();
  const { dataSucursales, selectSucursal, sucursalesItemSelect } = useSucursalesStore();
  const { mostrarAlmacenesXSucursal, almacenSelectItem, setAlmacenSelectItem } = useAlmacenesStore();
  const { dataProductos, mostrarProductos } = useProductosStore();
  const { dataclipro, cliproItemSelect, selectCliPro, mostrarCliPro } = useClientesProveedoresStore();

  const [detallePedido, setDetallePedido] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [precioCompra, setPrecioCompra] = useState(0);

  // --- CONSULTAS CON TANSTACK QUERY ---
  useQuery({
    queryKey: ["mostrar productos para el modal pedidos", dataempresa?.id],
    queryFn: () => mostrarProductos({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  const { data: dataAlmacenes } = useQuery({
    queryKey: ["mostrar almacenes x sucursal pedidos", sucursalesItemSelect?.id],
    queryFn: () => mostrarAlmacenesXSucursal({ id_sucursal: sucursalesItemSelect?.id }),
    enabled: !!sucursalesItemSelect?.id,
  });

  useQuery({
    queryKey: ["mostrar proveedores para el modal pedidos", dataempresa?.id],
    queryFn: () => mostrarCliPro({ id_empresa: dataempresa?.id, tipo: "proveedor" }), 
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  const { register, formState: { errors }, handleSubmit, setValue } = useForm();

  const { isPending, mutate: doGuardar } = useMutation({
    mutationFn: guardarPedido,
    mutationKey: "guardar pedido compra",
    onError: (error) => toast.error(`Error: ${error.message}`),
    onSuccess: () => {
      toast.success(accion === "Editar" ? "Pedido modificado" : "Pedido registrado con éxito");
      onClose();
      setIsExploding(true);
    },
  });

  const agregarAlDetalle = () => {
    if (!productoSeleccionado) return toast.warning("Selecciona un producto");
    if (cantidad <= 0) return toast.warning("La cantidad debe ser mayor a 0");

    const precioNum = parseFloat(precioCompra);
    const cantNum = parseFloat(cantidad);
    const subtotalCalculado = cantNum * precioNum;

    const existe = detallePedido.find((item) => item.id_producto === productoSeleccionado.id);
    if (existe) {
      setDetallePedido(
        detallePedido.map((item) =>
          item.id_producto === productoSeleccionado.id
            ? { ...item, cantidad: item.cantidad + cantNum, subtotal: (item.cantidad + cantNum) * item.precio_compra, total: (item.cantidad + cantNum) * item.precio_compra }
            : item
        )
      );
    } else {
      setDetallePedido([
        ...detallePedido,
        {
          id_producto: productoSeleccionado.id,
          nombre: productoSeleccionado.nombre,
          cantidad: cantNum,
          precio_compra: precioNum,
          subtotal: subtotalCalculado,
          total: subtotalCalculado,
        },
      ]);
    }
    setCantidad(1);
    setPrecioCompra(0);
    setProductoSeleccionado(null);
  };

  const eliminarFilaDetalle = (id_prod) => {
    setDetallePedido(detallePedido.filter((item) => item.id_producto !== id_prod));
  };

  const totalPedido = detallePedido.reduce((sum, item) => sum + item.subtotal, 0);

  async function guardarPedido(dataForm) {
    if (detallePedido.length === 0) {
      throw new Error("Debes agregar al menos un producto al detalle.");
    }
    if (!sucursalesItemSelect?.id || !almacenSelectItem?.id) {
      throw new Error("Debe seleccionar una sucursal y un almacén válidos.");
    }
    if (!cliproItemSelect?.id) {
      throw new Error("Debe asignar un proveedor a este pedido.");
    }

    const payload = {
      _id_sucursal: sucursalesItemSelect.id,
      _id_almacen: almacenSelectItem.id,
      _id_proveedor: cliproItemSelect.id, 
      _id_empresa: dataempresa.id,
      _descripcion: dataForm.descripcion,
      _total: totalPedido,
      _detalles: detallePedido,
    };

    if (accion === "Editar") {
      await editarPedidosCompra({ ...payload, _id: dataSelect.id });
    } else {
      await insertarPedidosCompra(payload);
    }
  }

  const handleSelectProducto = (prod) => {
    setProductoSeleccionado(prod);
    setPrecioCompra(prod?.precio_compra || 0);
  };

  useEffect(() => {
    if (accion === "Editar" && dataSelect) {
      setValue("descripcion", dataSelect.observacion || dataSelect.descripcion || "");
      
      const origenDetalles = dataSelect.detalle_pedido_compra || dataSelect.detalles || dataSelect.detalle;
      
      if (origenDetalles) {
        const listaCruda = typeof origenDetalles === "string" ? JSON.parse(origenDetalles) : origenDetalles;
        if (Array.isArray(listaCruda)) {
          const mapeoProductos = listaCruda.map((item) => {
            const nombreExtraido = item.nombre || item.productos?.nombre || "Producto sin nombre";
            const precioExtraido = parseFloat(item.precio_compra || 0);
            const cantidadExtraida = parseFloat(item.cantidad || 0);

            return {
              id_producto: item.id_producto,
              nombre: nombreExtraido,
              cantidad: cantidadExtraida,
              precio_compra: precioExtraido,
              subtotal: parseFloat(item.total || item.subtotal || (cantidadExtraida * precioExtraido)),
            };
          });
          setDetallePedido(mapeoProductos);
        }
      }

      if (dataSelect.id_sucursal && dataSucursales) {
        const sucEncontrada = dataSucursales.find(s => s.id === dataSelect.id_sucursal);
        if (sucEncontrada) selectSucursal(sucEncontrada);
      }
      
      if (dataSelect.id_almacen && dataAlmacenes) {
        const almEncontrado = dataAlmacenes.find(a => a.id === dataSelect.id_almacen);
        if (almEncontrado) setAlmacenSelectItem(almEncontrado);
      }

      if (dataSelect.id_proveedor && dataclipro) {
        const provEncontrado = dataclipro.find(p => p.id === dataSelect.id_proveedor);
        if (provEncontrado) selectCliPro(provEncontrado);
      }
    } else {
      setDetallePedido([]);
      selectCliPro(null);
    }
  }, [accion, dataSelect, dataSucursales, dataAlmacenes, dataclipro, setValue]);

  return (
    <Container>
      {isPending ? (
        <LoadingSpan>Procesando Pedido... 🚀</LoadingSpan>
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>{accion === "Editar" ? `EDITAR PEDIDO #${dataSelect?.id}` : "NUEVO PEDIDO DE COMPRA"}</h1>
            </section>
            <section>
              <BtnClose funcion={onClose} />
            </section>
          </div>

          <form className="formulario" onSubmit={handleSubmit(doGuardar)}>
            {/* PANEL DE CONFIGURACIÓN / CABECERA */}
            <section className="seccion1 card-panel">
              <h2>Datos de la Cabecera</h2>
              <div className="input-group">
                <ContainerSelector>
                  <label>Sucursal Destino </label>
                  <SelectList
                    data={dataSucursales || []}
                    itemSelect={sucursalesItemSelect}
                    onSelect={selectSucursal}
                    displayField="nombre"
                  />
                </ContainerSelector>

                <ContainerSelector>
                  <label>Almacén Receptor </label>
                  <SelectList
                    data={dataAlmacenes || []}
                    itemSelect={almacenSelectItem}
                    onSelect={setAlmacenSelectItem}
                    displayField="nombre"
                  />
                </ContainerSelector>

                <ContainerSelector>
                  <label>Proveedor Asignado </label>
                  <SelectList
                    data={dataclipro || []}
                    itemSelect={cliproItemSelect}
                    onSelect={selectCliPro}
                    displayField="nombres" 
                  />
                </ContainerSelector>

                <article style={{ marginTop: "10px" }}>
                  <InputText icono={<v.iconoflechaderecha />}>
                    <input
                      className="form__field"
                      type="text"
                      placeholder="Notas o descripción"
                      {...register("descripcion", { required: true })}
                    />
                    <label className="form__label">Notas / Descripción</label>
                    {errors.descripcion && <p className="error">Requerido</p>}
                  </InputText>
                </article>
              </div>
            </section>

            {/* PANEL DE PRODUCTOS / DETALLE */}
            <section className="seccion2 card-panel">
              <h2>Productos del Pedido</h2>
              <DetailBox>
                <div className="grilla-agregar">
                  <div className="selector-prod">
                    <SelectList
                      data={dataProductos || []}
                      itemSelect={productoSeleccionado}
                      onSelect={handleSelectProducto}
                      displayField="nombre"
                    />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Cant."
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Costo U."
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                  />
                  <button type="button" className="btn-add" onClick={agregarAlDetalle} title="Agregar item">
                    <FaPlus />
                  </button>
                </div>

                <div className="tabla-items-scroll">
                  <table className="tabla-detalle">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th style={{ textAlign: "center" }}>Cant.</th>
                        <th style={{ textAlign: "right" }}>Costo U.</th>
                        <th style={{ textAlign: "right" }}>Subtotal</th>
                        <th style={{ width: "50px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {detallePedido.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="tabla-vacia">
                            No hay productos agregados a la lista todavía.
                          </td>
                        </tr>
                      ) : (
                        detallePedido.map((item, index) => (
                          <tr key={index}>
                            <td>{item.nombre}</td>
                            <td style={{ textAlign: "center" }}>{item.cantidad}</td>
                            <td style={{ textAlign: "right" }}>${Number(item.precio_compra).toFixed(2)}</td>
                            <td style={{ textAlign: "right", fontWeight: "600" }}>${Number(item.subtotal).toFixed(2)}</td>
                            <td style={{ textAlign: "center" }}>
                              <button type="button" className="btn-delete" onClick={() => eliminarFilaDetalle(item.id_producto)}>
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="total-container">
                  <span>TOTAL COMPRA:</span>
                  <strong>${totalPedido.toFixed(2)}</strong>
                </div>
              </DetailBox>
            </section>

            <div className="footer-button">
              <Btn1 icono={<v.iconoguardar />} titulo={accion === "Editar" ? "Modificar Pedido" : "Guardar Pedido"} bgcolor="#10b981" />
            </div>
          </form>
        </div>
      )}
    </Container>
  );
}

// 💅 ESTILOS AMPLIADOS Y RE-DISEÑADOS (Cero compactos)
const Container = styled.div`
  transition: 0.3s ease-in-out;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(15, 23, 42, 0.4);
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);

  .sub-contenedor {
    position: relative;
    background: ${({ theme }) => theme.bgtotal || "#ffffff"};
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    padding: 30px;
    z-index: 100;
    width: 95%;
    max-width: 1100px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    border-radius: 12px;

    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      padding-bottom: 12px;
      h1 {
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.5px;
        color: ${({ theme }) => theme.text};
      }
    }

    .formulario {
      display: grid;
      grid-template-columns: 1fr;
      gap: 25px;
      @media ${Device.tablet} {
        grid-template-columns: 1fr 1.4fr;
      }

      .card-panel {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(0, 0, 0, 0.05);
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        display: flex;
        flex-direction: column;
        gap: 16px;

        h2 {
          font-size: 15px;
          font-weight: 600;
          opacity: 0.8;
          margin-bottom: 5px;
          border-bottom: 2px solid ${() => v.colorPrincipal || "#3b82f6"};
          width: fit-content;
          padding-bottom: 4px;
        }
      }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: 18px; /* Le da aire vertical a los SelectLists */
      }

      .footer-button {
        grid-column: 1 / -1;
        display: flex;
        justify-content: flex-end;
        margin-top: 15px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        padding-top: 15px;
      }
    }
  }
`;

const DetailBox = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  .grilla-agregar {
    display: grid;
    grid-template-columns: 2.2fr 1fr 1fr 54px;
    gap: 10px;
    margin-bottom: 20px;
    align-items: end;

    input {
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid rgba(0,0,0,0.15);
      outline: none;
      background: ${({ theme }) => theme.bgtotal};
      color: ${({ theme }) => theme.text};
      font-size: 14px;
      transition: 0.2s;
      height: 42px;
      &:focus {
        border-color: ${() => v.colorPrincipal || "#3b82f6"};
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }
    }

    .btn-add {
      background-color: ${() => v.colorPrincipal || "#3b82f6"};
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 42px;
      font-size: 16px;
      transition: 0.2s;
      &:hover {
        background-color: #2563eb;
        transform: translateY(-1px);
      }
    }
  }

  .tabla-items-scroll {
    min-height: 200px;
    max-height: 320px;
    overflow-y: auto;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 8px;
    background: rgba(0,0,0,0.01);
  }

  .tabla-detalle {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    th, td {
      padding: 12px 14px;
      text-align: left;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    th {
      background: rgba(0, 0, 0, 0.03);
      font-weight: 600;
      color: ${({ theme }) => theme.text};
      position: sticky;
      top: 0;
      z-index: 10;
    }

    tr:hover {
      background: rgba(0,0,0,0.02);
    }

    .tabla-vacia {
      text-align: center;
      color: #94a3b8;
      padding: 40px 0;
      font-style: italic;
    }

    .btn-delete {
      background: transparent;
      color: #ef4444;
      border: none;
      cursor: pointer;
      font-size: 15px;
      transition: 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: 6px;
      &:hover {
        color: #dc2626;
        background: rgba(239, 68, 68, 0.08);
      }
    }
  }

  .total-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 20px;
    border-top: 2px dashed rgba(0,0,0,0.1);
    font-size: 15px;
    font-weight: 600;
    strong {
      color: #10b981;
      font-size: 24px;
      font-weight: 700;
    }
  }
`;

const LoadingSpan = styled.span`
  font-size: 20px;
  font-weight: 600;
  color: white;
  animation: pulse 1.5s infinite;
`;