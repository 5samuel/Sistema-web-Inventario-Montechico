import styled from "styled-components";
import { useState } from "react";
import { Toaster } from "sonner";
import {
  Btn1,
  TablaTransferencia,
  RegistrarTransferencia,
  Title,
  useTransferenciasStore,
} from "../../index";
import { v } from "../../styles/variables";

export function TransferenciasTemplate() {
  // Estado para el modal de registro
  const [openRegistro, setOpenRegistro] = useState(false);
  // Estados para controlar la acción (Nuevo/Editar) y los datos seleccionados
  const [accion, setAccion] = useState("Nuevo");
  const [dataSelect, setDataSelect] = useState(null);

  // Obtenemos los datos desde el store
  const { dataTransferencias } = useTransferenciasStore();

  // Función para abrir el modal de nuevo registro
  function nuevoRegistro() {
    setDataSelect(null);
    setAccion("Nuevo");
    setOpenRegistro(true);
  }

  return (
    <Container>
      <Toaster richColors position="top-right" />
      
      {openRegistro && (
        <RegistrarTransferencia
          onClose={() => setOpenRegistro(false)}
          dataSelect={dataSelect}
          accion={accion}
          state={openRegistro}
        />
      )}

      <section className="area1">
        <Title>Transferencias de Almacén</Title>
        <Btn1
          funcion={nuevoRegistro}
          bgcolor={v.colorPrincipal}
          titulo="Nueva Transferencia"
          icono={<v.iconoagregar />}
        />
      </section>

      <section className="main">
        <TablaTransferencia 
          data={dataTransferencias}
          SetopenRegistro={setOpenRegistro} 
          setdataSelect={setDataSelect} 
          setAccion={setAccion} 
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
    "main" auto;
    
  .area1 {
    grid-area: area1;
    display: flex;
    justify-content: space-between; /* Ajustado para mejor distribución */
    align-items: center;
    gap: 15px;
    padding-bottom: 10px;
  }
  
  .main {
    grid-area: main;
    overflow-y: auto; /* Permite scroll si la tabla es muy larga */
  }
`;