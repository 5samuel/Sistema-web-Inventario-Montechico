import styled from "styled-components";
import { LiveIndicator } from "../../moleculas/LiveIndicator";
import { useEmpresaStore } from "../../..";
import { usePedidosCompraStore } from "../../../store/PedidosCompraStore";
import { useQuery } from "@tanstack/react-query";
import { BarLoader } from "react-spinners";

export const CardPedidosCompraLive = () => {
  const { dataempresa } = useEmpresaStore();
  const { mostrarPedidosLive } = usePedidosCompraStore();

  const { data, isLoading } = useQuery({
    queryKey: ["pedidos-live", dataempresa?.id],
    queryFn: () => mostrarPedidosLive({ _id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
  });

  if (isLoading) return <BarLoader color="#f88533" />;

  return (
    <Container>
      <HeaderCard>
        <Title>Pedidos realizados</Title>
        <LiveIndicator />
      </HeaderCard>

      <Table>
        <thead>
          <tr>
            <th>Proveedor / Detalle</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id_pedido}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold' }}>{item.proveedor}</span>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>{item.nota}</span>
                  </div>
                </td>
                <td>{new Date(item.fecha).toLocaleDateString()}</td>
                <td>${Number(item.total).toFixed(2)}</td>
                <td>
                  <StatusBadge status={item.estado}>
                    {item.estado}
                  </StatusBadge>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                No hay pedidos recientes
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

// Estilos de la tabla tipo "Top 10"
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  th {
    text-align: left;
    padding: 12px 15px;
    border-bottom: 2px solid ${({ theme }) => theme.bg4};
    color: ${({ theme }) => theme.text};
  }

  td {
    padding: 12px 15px;
    border-bottom: 1px solid ${({ theme }) => theme.bg4};
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${({ status }) => status === 'RECIBIDO' ? '#e8f5e9' : '#fff3e0'};
  color: ${({ status }) => status === 'RECIBIDO' ? '#2e7d32' : '#ef6c00'};
`;

const Container = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.bgtotal};
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 10px;
`;

const HeaderCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1rem;
`;