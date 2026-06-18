/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80100
 Source Host           : localhost:3306
 Source Schema         : dash

 Target Server Type    : MySQL
 Target Server Version : 80100
 File Encoding         : 65001

 Date: 12/06/2026 09:32:26
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for clientes
-- ----------------------------
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes`  (
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tipo_identificacion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `identificacion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `nombre_compania` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `nombre_comercial` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `contacto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `moneda` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `moneda_nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `tipo_negocio` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `tipo_negocio_nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `subcanal` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `subcanal_nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `lista_precios` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `lista_precios_nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `lista_precios2` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `lista_precios2_nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `termino_pago` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `termino_pago_nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `metodo_pago` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `metodo_pago_nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `grupo_cli` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `grupo_nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `politica_desc` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `politica_desc_nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `usuario` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `usuario_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `oficina` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `oficina_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `comentario` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `objetivo_venta` decimal(18, 4) NULL DEFAULT NULL,
  `max_desc` decimal(10, 2) NULL DEFAULT NULL,
  `retencion` decimal(10, 2) NULL DEFAULT NULL,
  `balance` decimal(18, 4) NULL DEFAULT NULL,
  `tiene_credito` tinyint NULL DEFAULT NULL,
  `tiene_documentos` tinyint NULL DEFAULT NULL,
  `estatus` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `creado` datetime NULL DEFAULT NULL,
  `creado_por` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`codigo`) USING BTREE,
  INDEX `usr_index`(`usuario` ASC) USING BTREE,
  INDEX `usr_cod`(`codigo` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for cuentas_por_cobrar
-- ----------------------------
DROP TABLE IF EXISTS `cuentas_por_cobrar`;
CREATE TABLE `cuentas_por_cobrar`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `documento_numero` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_vence` date NOT NULL,
  `fecha_emision` date NULL DEFAULT NULL,
  `emision_anio` int NULL DEFAULT NULL,
  `emision_mes` int NULL DEFAULT NULL,
  `emision_dia` int NULL DEFAULT NULL,
  `emision_trimestre` int NULL DEFAULT NULL,
  `ruta` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `semana_de_ruta` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `dia_de_ruta` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `codigo_vendedor` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `vendedor` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `zona` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `codigo_cliente` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `cliente` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `direccion` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `venta_total` decimal(18, 2) NULL DEFAULT NULL,
  `saldo_cartera` decimal(18, 2) NULL DEFAULT NULL,
  `comentario` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `dias_vence` int NULL DEFAULT NULL,
  `existe_en_excel` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_ingreso` date NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_snapshot`(`documento_numero` ASC, `fecha_vence` ASC, `fecha_ingreso` ASC) USING BTREE,
  INDEX `idx_cxc`(`codigo_cliente` ASC, `dias_vence` ASC, `existe_en_excel` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17664 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'reporte de Cxc con días de vencimiento' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for customer_address
-- ----------------------------
DROP TABLE IF EXISTS `customer_address`;
CREATE TABLE `customer_address`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cliente` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cliente_nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `cliente_identificacion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `cliente_comentario` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `cliente_grupo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `cliente_tipo_negocio` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `oficina` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `oficina_nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `codigo_barras` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `contacto` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `geo_area` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `geo_area_nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `geo_area_codigo_recorrido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `geo_area_descripcion_recorrido` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `calle_principal` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `nomenclatura` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `calle_secundaria` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `referencia` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `codigo_postal` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `telefono` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `fax` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `latitud` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `longitud` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `ultima_visita` datetime NULL DEFAULT NULL,
  `estado_localizacion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `estatus` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_cliente`(`cliente` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 31617 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for dashboard_user_sucursales
-- ----------------------------
DROP TABLE IF EXISTS `dashboard_user_sucursales`;
CREATE TABLE `dashboard_user_sucursales`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint NOT NULL,
  `id_sucursal` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_usuario_sucursal`(`id_usuario` ASC, `id_sucursal` ASC) USING BTREE,
  INDEX `fk_user_sucursal_sucursal`(`id_sucursal` ASC) USING BTREE,
  CONSTRAINT `fk_user_sucursal_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_user_sucursal_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `dashboard_users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for dashboard_users
-- ----------------------------
DROP TABLE IF EXISTS `dashboard_users`;
CREATE TABLE `dashboard_users`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nombres` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `id_rol` int NOT NULL,
  `estado` tinyint(1) NULL DEFAULT 1,
  `ultimo_acceso` datetime NULL DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `fk_dashboard_users_rol`(`id_rol` ASC) USING BTREE,
  CONSTRAINT `fk_dashboard_users_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for facturas
-- ----------------------------
DROP TABLE IF EXISTS `facturas`;
CREATE TABLE `facturas`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_factura` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_factura` date NULL DEFAULT NULL,
  `cod_producto` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `descr_producto` varchar(600) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `cod_categoria` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `descr_categoria` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `cod_marca` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `descr_marca` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `cod_tipo_inv` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `cantidad` int NULL DEFAULT NULL,
  `precio_unitario` double(8, 2) NULL DEFAULT NULL,
  `precio_total` double(8, 2) NULL DEFAULT NULL,
  `total_con_iva` double(8, 2) NULL DEFAULT NULL,
  `costo` double(8, 2) NULL DEFAULT NULL,
  `descuento` double(8, 2) NULL DEFAULT NULL,
  `descuento_pct` double(8, 2) NULL DEFAULT NULL,
  `bodega` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `lista_precio` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `termino_pago` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `usuario` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `codigo_vend` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `nombre_vend` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `codigo_cliente` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `ruc_cliente` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `razon_social` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `grupo_cliente` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `nombre_ciudad` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `ruta_documento` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ruta_doc`(`ruta_documento` ASC) USING BTREE,
  INDEX `num_fac`(`numero_factura` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 174445 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for metas_sucursales
-- ----------------------------
DROP TABLE IF EXISTS `metas_sucursales`;
CREATE TABLE `metas_sucursales`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `id_sucursal` int NOT NULL,
  `anio` smallint NOT NULL,
  `mes` tinyint NOT NULL,
  `meta_mensual` decimal(18, 2) NOT NULL DEFAULT 0.00,
  `meta_diaria` decimal(18, 2) NOT NULL DEFAULT 0.00,
  `observacion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `creado_por` bigint NULL DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_meta_sucursal`(`id_sucursal` ASC, `anio` ASC, `mes` ASC) USING BTREE,
  INDEX `idx_sucursal`(`id_sucursal` ASC) USING BTREE,
  INDEX `idx_periodo`(`anio` ASC, `mes` ASC) USING BTREE,
  INDEX `fk_meta_sucursal_usuario`(`creado_por` ASC) USING BTREE,
  CONSTRAINT `fk_meta_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_meta_sucursal_usuario` FOREIGN KEY (`creado_por`) REFERENCES `dashboard_users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for metas_vendedores
-- ----------------------------
DROP TABLE IF EXISTS `metas_vendedores`;
CREATE TABLE `metas_vendedores`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `codigo_vendedor` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nombre_vendedor` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `id_sucursal` int NOT NULL,
  `anio` smallint NOT NULL,
  `mes` tinyint NOT NULL,
  `meta_mensual` decimal(18, 2) NOT NULL,
  `meta_diaria` decimal(18, 2) NOT NULL,
  `observacion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `creado_por` bigint NULL DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_meta_vendedor`(`codigo_vendedor` ASC, `anio` ASC, `mes` ASC) USING BTREE,
  INDEX `idx_sucursal`(`id_sucursal` ASC) USING BTREE,
  INDEX `fk_meta_vendedor_usuario`(`creado_por` ASC) USING BTREE,
  CONSTRAINT `fk_meta_vendedor_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_meta_vendedor_usuario` FOREIGN KEY (`creado_por`) REFERENCES `dashboard_users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for pagos_historial
-- ----------------------------
DROP TABLE IF EXISTS `pagos_historial`;
CREATE TABLE `pagos_historial`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `codigo_pago` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `factura` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `valor_cobrado` double NULL DEFAULT NULL,
  `fecha_cobranza` date NULL DEFAULT NULL,
  `fecha_expiracion_pago` date NULL DEFAULT NULL,
  `fecha_registro_sistema` date NULL DEFAULT NULL,
  `fecha_entrega` date NULL DEFAULT NULL,
  `fecha_final_despacho` date NULL DEFAULT NULL,
  `documento_pago` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `lote` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `voucher` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `dtf` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `codigo_cliente` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `nombre_cliente` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `documento` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `fecha_emision` date NULL DEFAULT NULL,
  `fecha_vencimiento` date NULL DEFAULT NULL,
  `dias_fuera_plazo` int NULL DEFAULT NULL,
  `dias_fuera_plazo_exp` int NULL DEFAULT NULL,
  `codigo_usuario_pago` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `nombre_usuario_pago` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `comentario_pago` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `tipo` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `codigo_usuario_factura` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `nombre_usuario_factura` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `monto_subtotal_factura` double NULL DEFAULT NULL,
  `monto_total_factura` double NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_pago`(`codigo_pago` ASC, `factura` ASC, `fecha_vencimiento` ASC) USING BTREE,
  INDEX `idx_cliente`(`codigo_cliente` ASC) USING BTREE,
  INDEX `idx_fecha`(`fecha_cobranza` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 25997 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for politica_financiera
-- ----------------------------
DROP TABLE IF EXISTS `politica_financiera`;
CREATE TABLE `politica_financiera`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `codigo_nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `termino_pago` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `termino_pago_nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `dias_maximos_vencimiento` int NULL DEFAULT NULL,
  `dias_vencimiento` int NULL DEFAULT NULL,
  `max_credito_venta` decimal(18, 2) NULL DEFAULT NULL,
  `venta_credito` tinyint NULL DEFAULT NULL,
  `max_cheques_protestados` int NULL DEFAULT NULL,
  `cheques_protestados` int NULL DEFAULT NULL,
  `incumplimiento_pagos` tinyint NULL DEFAULT NULL,
  `problemas_pago` tinyint NULL DEFAULT NULL,
  `limite_credito` decimal(18, 2) NULL DEFAULT NULL,
  `max_facturas_vencidas` int NULL DEFAULT NULL,
  `max_cheques_posfechados` int NULL DEFAULT NULL,
  `cheques_posfechados` int NULL DEFAULT NULL,
  `monto_cheques_posfechados` decimal(18, 2) NULL DEFAULT NULL,
  `monto_minimo_venta` decimal(18, 2) NULL DEFAULT NULL,
  `monto_maximo_venta` decimal(18, 2) NULL DEFAULT NULL,
  `promedio_venta` decimal(18, 2) NULL DEFAULT NULL,
  `objetos_afectados` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `conceptos_afectados` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `estatus` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_codigo`(`codigo` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 29483 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `estado` tinyint(1) NULL DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `nombre`(`nombre` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for rutas
-- ----------------------------
DROP TABLE IF EXISTS `rutas`;
CREATE TABLE `rutas`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `id_sucursal` int NOT NULL,
  `estado` tinyint(1) NULL DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tipo` enum('RUTA_EXTERNA','VENTA_INTERNA') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'RUTA_EXTERNA',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `codigo`(`codigo` ASC) USING BTREE,
  INDEX `fk_ruta_sucursal`(`id_sucursal` ASC) USING BTREE,
  CONSTRAINT `fk_ruta_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 66 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for sucursales
-- ----------------------------
DROP TABLE IF EXISTS `sucursales`;
CREATE TABLE `sucursales`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` tinyint(1) NULL DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `codigo`(`codigo` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_history
-- ----------------------------
DROP TABLE IF EXISTS `user_history`;
CREATE TABLE `user_history`  (
  `id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `fecha` datetime NULL DEFAULT NULL,
  `usuario` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `usuario_nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `ruta` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `ruta_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `semana` int NULL DEFAULT NULL,
  `dia` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `cliente` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `cliente_nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `direccion` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `direccion_nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `accion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `codigo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `codigo_comentario` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `comentario` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  `monto` decimal(10, 2) NULL DEFAULT NULL,
  `latitud` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `longitud` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `romper_secuencia` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_history_main`(`fecha` ASC, `cliente` ASC, `usuario` ASC, `ruta` ASC, `accion` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for usuarios
-- ----------------------------
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios`  (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `cod_usuario` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cargo` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `ruta` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `meta_mensual` double(8, 2) NULL DEFAULT NULL,
  `meta_diaria` double(8, 2) NULL DEFAULT NULL,
  `ht` double(8, 2) NULL DEFAULT NULL,
  `matbrake` double(8, 2) NULL DEFAULT NULL,
  `auttek` double(8, 2) NULL DEFAULT NULL,
  PRIMARY KEY (`id_user`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for vendedores
-- ----------------------------
DROP TABLE IF EXISTS `vendedores`;
CREATE TABLE `vendedores`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `id_sucursal` int NOT NULL,
  `tipo` enum('INTERNO','EXTERNO') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `estado` tinyint(1) NULL DEFAULT 1,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `codigo`(`codigo` ASC) USING BTREE,
  UNIQUE INDEX `uk_vendedor_codigo`(`codigo` ASC) USING BTREE,
  INDEX `fk_vendedor_sucursal`(`id_sucursal` ASC) USING BTREE,
  CONSTRAINT `fk_vendedor_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursales` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 57 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
