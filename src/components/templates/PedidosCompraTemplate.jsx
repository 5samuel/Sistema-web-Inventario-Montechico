import styled from "styled-components";
import {
  Btn1,
  Buscador,
  RegistrarPedidosCompra, // Componente del formulario dinámico que haremos
  TablaPedidosCompra,     // Componente de la tabla que pintará los pedidos
  Title,
  usePedidosCompraStore,
} from "../../index";
import { v } from "../../styles/variables";
import { useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";
import { Toaster } from "sonner";

export function PedidosCompraTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const { dataPedidosCompra, setBuscador } = usePedidosCompraStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);

  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
    setIsExploding(false);
  }

  return (
    <Container>
      <Toaster position="top-right" richColors />
      
      {openRegistro && (
        <RegistrarPedidosCompra 
          key={dataSelect?.id || "nuevo"}
          setIsExploding={setIsExploding}
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion} 
          state={openRegistro}
        />
      )}
       
      <section className="area1">
        <Title>Pedidos de Compra</Title>
        <Btn1
          funcion={nuevoRegistro}
          bgcolor={v.colorPrincipal}
          titulo="Nuevo Pedido"
          icono={<v.iconoagregar />}
        />
      </section>
      
      <section className="area2">
        <Buscador setBuscador={setBuscador} />
      </section>

      <section className="main">
        {isExploding && <ConfettiExplosion />}
        <TablaPedidosCompra 
          setdataSelect={setdataSelect} 
          setAccion={setAccion} 
          SetopenRegistro={SetopenRegistro} 
          data={dataPedidosCompra} 
        />
      </section>
    </Container>
  );
}

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
    justify-content: space-between; /* Ajustado para que el título quede a la izquierda y el botón a la derecha */
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