import { useValorInventarioQuery } from "../../tanstack/DashboardStack";

export function CardValorInventario() {
  const { data, isLoading } =
    useValorInventarioQuery();

  if (isLoading) return <span>Cargando...</span>;

  return (
    <div>
      <h2>
        {Number(data).toLocaleString("es-DO", {
          style: "currency",
          currency: "DOP",
        })}
      </h2>

      <span>Valor del Inventario</span>
    </div>
  );
}