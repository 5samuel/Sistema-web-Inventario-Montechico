import styled from "styled-components";

import {
  Btn1,
  InputText,
  SelectList,
  
  usePedidosCompraStore,
  useProductosStore,
  v,
} from "../../../index";

import { useState } from "react";

export function DetallePedidoCompra() {

  const {
    detallePedido,
    agregarProducto,
    eliminarDetalle,
    calcularTotal,
  } =
    usePedidosCompraStore();

  const {
    dataProductos,
    productosItemSelect,
    selectProductos,
  } =
    useProductosStore();

  const [
    cantidad,
    setCantidad,
  ] =
    useState(1);

  const [
    precio,
    setPrecio,
  ] =
    useState(0);

  const agregar =
    () => {

      if (
        !productosItemSelect
      ) {
        return;
      }

      agregarProducto({

        id_producto:
          productosItemSelect.id,

        producto:
          productosItemSelect.nombre,

        cantidad:
          Number(
            cantidad
          ),

        precio:
          Number(
            precio
          ),

      });

      setCantidad(
        1
      );

      setPrecio(
        0
      );

    };

  return (

    <Container>

      <h3>
        Detalle pedido
      </h3>

      <ContainerSelector>

        <label>
          Producto
        </label>

        <SelectList
          data={
            dataProductos
          }

          itemSelect={
            productosItemSelect
          }

          onSelect={
            selectProductos
          }

          displayField="
          nombre"
        />

      </ContainerSelector>

      <Fila>

        <InputText>

          <input

            type="number"

            value={
              cantidad
            }

            min={1}

            onChange={(
              e
            ) =>
              setCantidad(
                e.target
                .value
              )
            }

          />

          <label>

            cantidad

          </label>

        </InputText>

        <InputText>

          <input

            type="number"

            value={
              precio
            }

            min={0}

            onChange={(
              e
            ) =>
              setPrecio(
                e.target
                .value
              )
            }

          />

          <label>

            costo

          </label>

        </InputText>

      </Fila>

      <Btn1
        titulo="
        Agregar"

        icono={
          <v.iconoguardar />
        }

        funcion={
          agregar
        }
      />

      <Tabla>

        <thead>

          <tr>

            <th>
              Producto
            </th>

            <th>
              Cant
            </th>

            <th>
              Costo
            </th>

            <th>
              Subtotal
            </th>

            <th>

            </th>

          </tr>

        </thead>

        <tbody>

          {
            detallePedido?.map(
              (
                item
              ) => (

                <tr
                  key={
                    item.id_producto
                  }
                >

                  <td>

                    {
                      item.producto
                    }

                  </td>

                  <td>

                    {
                      item.cantidad
                    }

                  </td>

                  <td>

                    RD$

                    {
                      item.precio
                    }

                  </td>

                  <td>

                    RD$

                    {
                      item.subtotal
                    }

                  </td>

                  <td>

                    <button

                      type="
                      button"

                      onClick={() =>
                        eliminarDetalle(
                          item.id_producto
                        )
                      }

                    >

                      X

                    </button>

                  </td>

                </tr>

              )
            )
          }

        </tbody>

      </Tabla>

      <Total>

        TOTAL:

        RD$

        {
          calcularTotal()
        }

      </Total>

    </Container>

  );

}

const Container =
styled.div`

display:flex;

flex-direction:
column;

gap:15px;

`;

const Fila =
styled.div`

display:grid;

grid-template-columns:
1fr 1fr;

gap:10px;

`;

const Tabla =
styled.table`

width:100%;

border-collapse:
collapse;

th,
td{

padding:10px;

text-align:center;

border-bottom:
1px solid #ddd;

}

`;

const Total =
styled.div`

font-size:
20px;

font-weight:
700;

text-align:
right;

`;