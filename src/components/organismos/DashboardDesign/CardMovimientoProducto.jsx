import styled from "styled-components";
import { useEmpresaStore } from "../../..";
import { useDetalleVentasStore } from "../../../store/DetalleVentasStore";
import { useQuery } from "@tanstack/react-query";
import { BarLoader } from "react-spinners";

export const CardMovimientoProducto = () => {
  const { dataempresa } = useEmpresaStore();
  const { mostrarMayorMovimientoProducto } = useDetalleVentasStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["producto mayor movimiento", dataempresa?.id],
    queryFn: () => mostrarMayorMovimientoProducto({ _id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
  });

  if (isLoading) return <BarLoader color="#f88533" />;
  if (error) return <span>Error: {error.message}</span>;

  const item = data?.[0];

  return (
    <Container>
      <Title>Mayor salida</Title>
      <Producto>{item?.nombre_producto || "Sin datos"}</Producto>
      <Total>{item?.total_movimiento || 0} unidades</Total>
    </Container>
  );
};

const Container = styled.div`
  background: ${({ theme }) => theme.bgtotal}; // Ajusta según tu tema
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid ${({ theme }) => theme.bg4 || "#eee"};
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Title = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
  margin: 0;
`;

const Producto = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #f88533; // Usé el color naranja que vi en tu Sidebar
  margin: 0;
`;

const Total = styled.span`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;