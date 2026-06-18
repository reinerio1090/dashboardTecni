import pool from "@/lib/db";

export class VentasRepository {
  async getVentaTotal(
    fechaInicio: string,
    fechaFin: string
  ) {
    const [rows] = await pool.query(
      `
      SELECT
        COALESCE(SUM(precio_total),0) venta_total
      FROM facturas
      WHERE fecha_factura
      BETWEEN ? AND ?
      `,
      [fechaInicio, fechaFin]
    );

    return rows;
  }

  async getCobrosRealizados(
    fechaInicio: string,
    fechaFin: string
  ) {
    const [rows] = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(valor_cobrado),
          0
        ) cobros_realizados
      FROM pagos_historial
      WHERE fecha_cobranza
      BETWEEN ? AND ?
      `,
      [fechaInicio, fechaFin]
    );

    return rows;
  }

  async getCarteraVencida() {
    const [rows] = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(saldo_cartera),
          0
        ) cartera_vencida
      FROM cuentas_por_cobrar
      WHERE dias_vence > 0
      `
    );

    return rows;
  }
}
