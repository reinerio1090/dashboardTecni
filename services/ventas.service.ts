import { VentasRepository } from "@/repositories/ventas.repository";

const repository = new VentasRepository();

export class VentasService {
  async resumen(
    fechaInicio: string,
    fechaFin: string
  ) {
    return repository.getVentaTotal(
      fechaInicio,
      fechaFin
    );
  }
}