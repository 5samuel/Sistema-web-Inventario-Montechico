import styled from "styled-components";
import { RegistrarInventario } from "../components/organismos/formularios/RegistrarInventario";
import { TablaInventarios } from "../components/organismos/tablas/TablaInventarios";
import { useQuery } from "@tanstack/react-query";

import { useMovStockStore } from "../store/MovStockStore";
import { useEmpresaStore } from "../store/EmpresaStore";
import { useProductosStore } from "../store/ProductosStore";
import { Title } from "../components/atomos/Title";
import { Btn1 } from "../components/moleculas/Btn1";
import { useState } from "react";
import { BuscadorList } from "../components/ui/lists/BuscadorList";
import { useGlobalStore } from "../store/GlobalStore";

export const Inventario = () => {
  const { mostrarMovStock } = useMovStockStore();
  const { dataempresa } = useEmpresaStore();

  const {
    buscarProductos,
    buscador,
    productosItemSelect,
    setBuscador,
    selectProductos,
  } = useProductosStore();

  const [openRegistro, SetopenRegistro] = useState(false);
  const [dataSelect, setdataSelect] = useState([]);

  const { setStateClose, setAccion, stateClose } = useGlobalStore();

  const {
    data: dataproductos,
    isLoading: isLoadingBuscarProductos,
    error,
  } = useQuery({
    queryKey: ["buscar productos", buscador],
    queryFn: () =>
      buscarProductos({
        id_empresa: dataempresa?.id,
        buscador,
      }),
    enabled: !!dataempresa?.id,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "mostrar movimientos de stock",
      dataempresa?.id,
      productosItemSelect?.id,
    ],
    queryFn: () =>
      mostrarMovStock({
        id_empresa: dataempresa?.id,
        id_producto: productosItemSelect?.id,
      }),
    enabled: !!dataempresa?.id && !!productosItemSelect?.id,
  });

  function nuevoRegistro() {
    setStateClose(true);
    setAccion("Nuevo");

    // ELIMINADO:
    // setItemSelect([]);
    // porque no existe en este componente
  }

  return (
    <Container>
      {stateClose && <RegistrarInventario />}

      <section className="area1">
        {productosItemSelect?.nombre && (
          <span>
            Producto: <strong>{productosItemSelect.nombre}</strong>
          </span>
        )}

        <Title>Inventario</Title>

        <Btn1 funcion={nuevoRegistro} titulo="Registrar" />
      </section>

      <section className="area2">
        <BuscadorList
          setBuscador={setBuscador}
          data={dataproductos}
          onSelect={selectProductos}
        />
      </section>

      <section className="main">
        <TablaInventarios
          setdataSelect={setdataSelect}
          setAccion={setAccion}
          SetopenRegistro={SetopenRegistro}
          data={data}
        />
      </section>
    </Container>
  );
};

const Container = styled.div`
  height: calc(100vh - 80px);
  margin-top: 50px;
  padding: 15px;

  display: grid;
  grid-template:
    "area1" 60px
    "area2" 60px
    "main" auto;

  .area1 {
    grid-area: area1;
    display: flex;
    justify-content: end;
    align-items: center;
    gap: 15px;
  }

  .area2 {
    grid-area: area2;
    display: flex;
    justify-content: end;
    align-items: center;
  }

  .main {
    grid-area: main;
  }
`;