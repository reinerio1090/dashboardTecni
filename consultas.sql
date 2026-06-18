#tarjetas
#Obtener las ventas internas por sucursal. 

SELECT 
#*
SUM(total_con_iva) 
FROM `facturas` 
where fecha_factura >= "2026-06-01"
and bodega="B_TOTORACOCHA"
AND ruta_documento is null


#ventas del mes de agente pero que no tienen rutas

select * from facturas f
inner JOIN vendedores v on f.usuario=v.codigo 
where  fecha_factura BETWEEN "2026-05-01" and "2026-06-01" and
ruta_documento is null
order by numero_factura asc


#ventas total DE USUARIO DE RUTA
select * from facturas f
inner JOIN vendedores v on f.usuario=v.codigo 
where  fecha_factura >="2026-06-01" 
and codigo="CUYAGUARI"
AND (ruta_documento="R_TOTORACOCHA" OR ruta_documento IS NULL)

SELECT
    f.codigo_vend,
    f.nombre_vend,
    SUM(f.total_con_iva) AS ventas
FROM facturas f
LEFT JOIN vendedores v
    ON v.codigo = f.codigo_vend
WHERE v.codigo IS NULL
GROUP BY
    f.codigo_vend,
    f.nombre_vend
ORDER BY ventas DESC;


SELECT
    f.codigo_vend,
    f.nombre_vend,
    SUM(f.total_con_iva) AS ventas
FROM facturas f
WHERE f.fecha_factura BETWEEN '2026-06-01' AND '2026-06-30'
  AND f.bodega = 'B_TOTORACOCHA'	
  AND NOT EXISTS (
      SELECT 1
      FROM vendedores v
      WHERE v.codigo = f.codigo_vend
  )
GROUP BY
    f.codigo_vend,
    f.nombre_vend
ORDER BY ventas DESC;




SELECT
    s.nombre,
    SUM(f.total_con_iva) ventas
FROM facturas f
INNER JOIN sucursales s
    ON s.codigo = f.bodega
WHERE f.fecha_factura BETWEEN '2026-06-01' AND '2026-06-30'
GROUP BY s.id, s.nombre;




SELECT
    c.id,
    c.documento_numero AS documentoNumero,
    c.fecha_vence AS fechaVence,
    c.fecha_emision AS fechaEmision,
    c.ruta,
    COALESCE(r.nombre, c.ruta) AS rutaNombre,
    COALESCE(s.codigo, '') AS sucursalCodigo,
    c.codigo_vendedor AS codigoVendedor,
    c.vendedor,
    c.codigo_cliente AS codigoCliente,
    c.cliente,
    c.venta_total AS ventaTotal,
    c.saldo_cartera AS saldoCartera,
    DATEDIFF(CURDATE(), c.fecha_vence) AS diasVence,
		SUM()
FROM cuentas_por_cobrar AS c
LEFT JOIN rutas AS r
    ON c.ruta COLLATE utf8mb4_general_ci =
       r.codigo COLLATE utf8mb4_general_ci
LEFT JOIN sucursales AS s
    ON r.id_sucursal = s.id
WHERE c.existe_en_excel = 1
  AND r.id_sucursal IN (
      1, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15
  )
  AND s.codigo COLLATE utf8mb4_general_ci IN (
      'B_TOTORACOCHA'
  )
  AND c.ruta COLLATE utf8mb4_general_ci IN (
      'R_TOTORACOCHA'
  )
ORDER BY
    diasVence DESC,
    c.saldo_cartera DESC;
		
		
		
		
		
		
		SELECT
    f.codigo_vend AS codigoVendedor,
    f.nombre_vend AS nombreVendedor,
    f.bodega AS sucursalCodigo,
    f.ruta_documento AS rutaDocumento,
    COALESCE(SUM(f.precio_total), 0) AS ventaTotal,
    COUNT(DISTINCT f.numero_factura) AS cantidadFacturas
FROM facturas AS f
WHERE f.fecha_factura BETWEEN '2026-05-01' AND '2026-05-31'
  AND f.bodega COLLATE utf8mb4_general_ci IN (
      'B_PUYO',
      'B_AZOGUES',
      'B_CIRCO SOCIAL',
      'B_CONTROL_SUR',
      'B_GUALACEO',
      'B_LOJA',
      'B_MACAS',
      'B_MACHANGARA',
      'B_RIOBAMBA',
      'B_SANTA ISABEL',
      'B_TOTORACOCHA'
  )
  AND ( f.ruta_documento COLLATE utf8mb4_general_ci = 'R_TOTORACOCHA' )
	
GROUP BY
    f.codigo_vend,
    f.nombre_vend,
    f.bodega,
    f.ruta_documento
ORDER BY ventaTotal DESC;




SELECT
    f.codigo_vend AS codigoVendedor,
    f.nombre_vend AS nombreVendedor,
    f.bodega AS sucursalCodigo,
    f.ruta_documento AS rutaDocumento,
    COALESCE(SUM(f.precio_total), 0) AS ventaTotal,
    COUNT(DISTINCT f.numero_factura) AS cantidadFacturas
FROM facturas AS f
WHERE f.fecha_factura BETWEEN '2026-05-01' AND '2026-05-31'
  AND f.bodega COLLATE utf8mb4_general_ci IN ('B_TOTORACOCHA') 
GROUP BY
    f.codigo_vend,
    f.nombre_vend,
    f.bodega,
    f.ruta_documento
ORDER BY ventaTotal DESC;

