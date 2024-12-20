-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 13, 2024 at 06:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `despensas_crc`
--

-- --------------------------------------------------------

--
-- Table structure for table `estudio_socioeconomico`
--

CREATE TABLE `estudio_socioeconomico` (
  `id_despensa` int(11) NOT NULL,
  `nombre_solicitante` varchar(255) DEFAULT NULL COMMENT 'Nombre del solicitante',
  `calle` varchar(255) DEFAULT NULL COMMENT 'Calle del domicilio',
  `numero` varchar(4) DEFAULT NULL COMMENT 'Numero del domicilio',
  `colonia` varchar(255) DEFAULT NULL COMMENT 'Colonia del domicilio',
  `cp` varchar(5) DEFAULT NULL COMMENT 'Codigo postal del domicilio',
  `tel` int(11) DEFAULT NULL COMMENT 'Numero de telefono del solicitante',
  `zona` varchar(5) DEFAULT NULL COMMENT 'ZONA DE LA CIUDAD NOTE O SUR',
  `ruta` int(11) DEFAULT 0,
  `motivo` varchar(255) DEFAULT NULL COMMENT 'Motivo por el cual se realiza el estudio...(depensa, mochilas, etc)',
  `edad` tinyint(4) DEFAULT NULL COMMENT 'Edad del solicitante',
  `sexo` enum('Masculino','Femenino','Otro') DEFAULT NULL COMMENT 'Sexo del solicitante',
  `genero` enum('Mujer Cisgénero','Hombre Cisgenero','Mujer Trans','Hombre Trans','Bigenero','Género fluido','No Binario','Agénero','Otro Genero','No responde') DEFAULT NULL COMMENT 'Genero del solicitante',
  `estado_civil` varchar(20) DEFAULT NULL COMMENT 'Estado civil del solicitante',
  `escolaridad` varchar(50) DEFAULT NULL COMMENT 'Nivel de escolaridad',
  `ocupacion` varchar(100) DEFAULT NULL COMMENT 'Ocupación del solicitante',
  `fecha_registro` date DEFAULT NULL COMMENT 'Fecha de registro del solicitante',
  `nombre_1` varchar(255) DEFAULT NULL COMMENT 'Nombre del integrante familiar',
  `sexo_integrante_1` enum('Masculino','Femenino','Otro') DEFAULT NULL COMMENT 'Sexo del integrante familiar',
  `parentesco_1` varchar(50) DEFAULT NULL COMMENT 'Parentesco con el solicitante',
  `edad_integrante_1` tinyint(4) DEFAULT NULL COMMENT 'Edad del integrante familiar',
  `estado_civil_integrante_1` varchar(20) DEFAULT NULL COMMENT 'Estado civil del integrante familiar',
  `ocupacion_integrante_1` varchar(100) DEFAULT NULL COMMENT 'Ocupación del integrante familiar',
  `escolaridad_integrante_1` varchar(100) DEFAULT NULL COMMENT 'Escolaridad del integrante familiar',
  `ingreso_sol1` decimal(10,2) DEFAULT NULL COMMENT 'Ingresos del primer integrante familiar',
  `nombre_2` varchar(255) DEFAULT NULL COMMENT 'Nombre del integrante familiar',
  `sexo_integrante_2` enum('Masculino','Femenino','Otro') DEFAULT NULL COMMENT 'Sexo del integrante familiar',
  `parentesco_2` varchar(50) DEFAULT NULL COMMENT 'Parentesco con el solicitante',
  `edad_integrante_2` tinyint(4) DEFAULT NULL COMMENT 'Edad del integrante familiar',
  `estado_civil_integrante_2` varchar(20) DEFAULT NULL COMMENT 'Estado civil del integrante familiar',
  `ocupacion_integrante_2` varchar(100) DEFAULT NULL COMMENT 'Ocupación del integrante familiar',
  `escolaridad_integrante_2` varchar(100) DEFAULT NULL COMMENT 'Escolaridad del integrante familiar',
  `ingreso_sol2` decimal(10,2) DEFAULT NULL COMMENT 'Ingresos del segundo integrante familiar',
  `nombre_3` varchar(255) DEFAULT NULL COMMENT 'Nombre del integrante familiar',
  `sexo_integrante_3` enum('Masculino','Femenino','Otro') DEFAULT NULL COMMENT 'Sexo del integrante familiar',
  `parentesco_3` varchar(50) DEFAULT NULL COMMENT 'Parentesco con el solicitante',
  `edad_integrante_3` tinyint(4) DEFAULT NULL COMMENT 'Edad del integrante familiar',
  `estado_civil_integrante_3` varchar(20) DEFAULT NULL COMMENT 'Estado civil del integrante familiar',
  `ocupacion_integrante_3` varchar(100) DEFAULT NULL COMMENT 'Ocupación del integrante familiar',
  `escolaridad_integrante_3` varchar(100) DEFAULT NULL COMMENT 'Escolaridad del integrante familiar',
  `ingreso_sol3` decimal(10,2) DEFAULT NULL COMMENT 'Ingresos del tercer integrante familiar',
  `ingreso_mensual` decimal(10,2) DEFAULT NULL COMMENT 'Ingreso mensual del solicitante',
  `aportacion` decimal(10,2) DEFAULT NULL COMMENT 'Suma de la aportación',
  `luz` decimal(10,2) DEFAULT NULL COMMENT 'Gasto mensual en luz',
  `agua` decimal(10,2) DEFAULT NULL COMMENT 'Gasto mensual en agua',
  `telefono` decimal(10,2) DEFAULT NULL COMMENT 'Gasto mensual en teléfono',
  `creditos` decimal(10,2) DEFAULT NULL COMMENT 'Gasto mensual en créditos',
  `gas` decimal(10,2) DEFAULT NULL COMMENT 'Gasto mensual en gas',
  `medicinas` decimal(10,2) DEFAULT NULL COMMENT 'Gasto mensual en medicinas',
  `transporte` decimal(10,2) DEFAULT NULL COMMENT 'Gasto mensual en transporte o gasolina',
  `television` decimal(10,2) DEFAULT NULL COMMENT 'Gasto mensual en televisión de paga',
  `renta` decimal(10,2) DEFAULT NULL COMMENT 'Gasto mensual en renta',
  `alimentacion` decimal(10,2) DEFAULT NULL COMMENT 'Gasto mensual en alimentación',
  `escuela` decimal(10,2) DEFAULT NULL COMMENT 'Gasto mensual en escuela',
  `internet` decimal(10,2) DEFAULT NULL COMMENT 'Gasto mensual en internet',
  `total` decimal(10,2) DEFAULT NULL COMMENT 'Total de gastos mensuales',
  `vehiculo` varchar(255) DEFAULT NULL,
  `situacionLegal` varchar(255) DEFAULT NULL,
  `materialParedes` varchar(255) DEFAULT NULL,
  `materialTecho` varchar(255) DEFAULT NULL,
  `materialPiso` varchar(255) DEFAULT NULL,
  `numCuartos` int(11) DEFAULT NULL COMMENT 'Número de cuartos',
  `nivelSocioEconomico` varchar(255) DEFAULT NULL,
  `firma` varchar(255) DEFAULT NULL,
  `ine1` varchar(100) DEFAULT NULL,
  `ine2` varchar(100) DEFAULT NULL,
  `ine3` varchar(100) DEFAULT NULL,
  `comentarios` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estudio_socioeconomico`
--

INSERT INTO `estudio_socioeconomico` (`id_despensa`, `nombre_solicitante`, `calle`, `numero`, `colonia`, `cp`, `tel`, `zona`, `ruta`, `motivo`, `edad`, `sexo`, `genero`, `estado_civil`, `escolaridad`, `ocupacion`, `fecha_registro`, `nombre_1`, `sexo_integrante_1`, `parentesco_1`, `edad_integrante_1`, `estado_civil_integrante_1`, `ocupacion_integrante_1`, `escolaridad_integrante_1`, `ingreso_sol1`, `nombre_2`, `sexo_integrante_2`, `parentesco_2`, `edad_integrante_2`, `estado_civil_integrante_2`, `ocupacion_integrante_2`, `escolaridad_integrante_2`, `ingreso_sol2`, `nombre_3`, `sexo_integrante_3`, `parentesco_3`, `edad_integrante_3`, `estado_civil_integrante_3`, `ocupacion_integrante_3`, `escolaridad_integrante_3`, `ingreso_sol3`, `ingreso_mensual`, `aportacion`, `luz`, `agua`, `telefono`, `creditos`, `gas`, `medicinas`, `transporte`, `television`, `renta`, `alimentacion`, `escuela`, `internet`, `total`, `vehiculo`, `situacionLegal`, `materialParedes`, `materialTecho`, `materialPiso`, `numCuartos`, `nivelSocioEconomico`, `firma`, `ine1`, `ine2`, `ine3`, `comentarios`) VALUES
(1, 'Carlos Gerardo Ibarra', 'Privada de terrazas', '7417', 'Cerro de la cruz', '31640', 1111111111, 'Sur', 0, 'yes', 22, 'Femenino', 'Hombre Cisgenero', 'no sabe', 'Tsu', '2work', '2024-12-12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1000.00, 0.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1012.00, 'si', 'propia', 'paredes', 'techo', 'piso', 3, 'bajo', 'Carlos Gerardo Ibarra-firma.png', 'Carlos Gerardo Ibarra-ine1..jpg', 'Carlos Gerardo Ibarra-ine2..jpg', 'Carlos Gerardo Ibarra-ine3..jpg', 'no'),
(2, 'Carlos Gerardo Ibarra', 'Privada de terrazas', '7417', 'Cerro de la cruz', '31640', 1111111111, 'Sur', 0, 'yes', 22, 'Femenino', 'Hombre Cisgenero', 'no sabe', 'Tsu', '2work', '2024-12-12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1000.00, 0.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1012.00, 'si', 'propia', 'paredes', 'techo', 'piso', 3, 'bajo', 'Carlos Gerardo Ibarra-firma.png', 'Carlos Gerardo Ibarra-ine1..jpg', 'Carlos Gerardo Ibarra-ine2..jpg', 'Carlos Gerardo Ibarra-ine3..jpg', 'no');

-- --------------------------------------------------------

--
-- Table structure for table `inventario`
--

CREATE TABLE `inventario` (
  `id` int(11) NOT NULL,
  `Despensas` int(11) DEFAULT 0,
  `MochilaPrimaria` int(11) DEFAULT 0,
  `MochilasSecundaria` int(11) DEFAULT 0,
  `MochilasPreparatoria` int(11) DEFAULT 0,
  `Colchonetas` int(11) DEFAULT 0,
  `Aguas` int(11) DEFAULT 0,
  `Pintura` int(11) DEFAULT 0,
  `Impermeabilizante` int(11) DEFAULT 0,
  `Bicicletas` int(11) DEFAULT 0,
  `Mesas` int(11) DEFAULT 0,
  `Sillas` int(11) DEFAULT 0,
  `Dulces` int(11) DEFAULT 0,
  `Pinatas` int(11) DEFAULT 0,
  `Juguetes` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventario`
--

INSERT INTO `inventario` (`id`, `Despensas`, `MochilaPrimaria`, `MochilasSecundaria`, `MochilasPreparatoria`, `Colchonetas`, `Aguas`, `Pintura`, `Impermeabilizante`, `Bicicletas`, `Mesas`, `Sillas`, `Dulces`, `Pinatas`, `Juguetes`) VALUES
(1, 90, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `registros`
--

CREATE TABLE `registros` (
  `id_registro` int(15) NOT NULL,
  `nombre_solicitante` varchar(255) DEFAULT NULL COMMENT 'Nombre del solicitante',
  `calle` varchar(255) DEFAULT NULL COMMENT 'Calle del domicilio',
  `numero` varchar(4) DEFAULT NULL COMMENT 'Numero del domicilio',
  `colonia` varchar(255) DEFAULT NULL COMMENT 'Colonia del domicilio',
  `cp` varchar(5) DEFAULT NULL COMMENT 'Codigo postal del domicilio',
  `tel` varchar(10) DEFAULT NULL,
  `zona` varchar(5) DEFAULT NULL COMMENT 'ZONA DE LA CIUDAD NOTE O SUR',
  `ruta` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `registros`
--

INSERT INTO `registros` (`id_registro`, `nombre_solicitante`, `calle`, `numero`, `colonia`, `cp`, `tel`, `zona`, `ruta`) VALUES
(1, 'Carlos Gerardo Ibarra', 'Privada de terrazas', '7417', 'Cerro de la cruz', '31640', '2222222222', 'Sur', 0);

-- --------------------------------------------------------

--
-- Table structure for table `registro_vales`
--

CREATE TABLE `registro_vales` (
  `id_registro` int(11) NOT NULL,
  `tipo` enum('entrada','salida') NOT NULL COMMENT 'Tipo de vale: entrada o salida',
  `solicitante` varchar(255) NOT NULL,
  `recipiente` varchar(255) NOT NULL,
  `dependencia` varchar(50) NOT NULL,
  `fecha_entrega` date NOT NULL COMMENT 'Fecha de recepción de la despensa',
  `cantidad_despensas` int(11) NOT NULL COMMENT 'Cantidad de despensas entregadas',
  `cantidad_mochilas_primaria` int(11) NOT NULL COMMENT 'Cantidad de mochilas entregadas',
  `cantidad_mochilas_secundaria` int(11) NOT NULL COMMENT 'Cantidad de mochilas entregadas',
  `cantidad_mochilas_preparatoria` int(11) NOT NULL COMMENT 'Cantidad de mochilas entregadas',
  `cantidad_colchonetas` int(11) NOT NULL COMMENT 'Cantidad de colchonetas entregadas',
  `cantidad_aguas` int(11) NOT NULL COMMENT 'Cantidad de aguas entregadas',
  `cantidad_botes_pintura` int(11) NOT NULL COMMENT 'Cantidad de botes de pintura entregadas',
  `cantidad_botes_impermeabilizante` int(11) NOT NULL COMMENT 'Cantidad de botes de impermeabilizante entregados',
  `cantidad_bicicletas` int(11) NOT NULL COMMENT 'Cantidad de bicicletas entregadas',
  `cantidad_mesas` int(11) NOT NULL COMMENT 'Cantidad de mesas entregadas',
  `cantidad_sillas` int(11) NOT NULL COMMENT 'Cantidad de sillas entregadas',
  `cantidad_dulces` int(11) NOT NULL COMMENT 'Cantidad de bolsas de dulces entregadas',
  `cantidad_pinatas` int(11) NOT NULL COMMENT 'Cantidad de piñatas entregadas',
  `cantidad_juguetes` int(11) NOT NULL COMMENT 'Cantidad de juguetes entregados',
  `firma_entrega` varchar(255) NOT NULL,
  `firma_recibe` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `registro_vales`
--

INSERT INTO `registro_vales` (`id_registro`, `tipo`, `solicitante`, `recipiente`, `dependencia`, `fecha_entrega`, `cantidad_despensas`, `cantidad_mochilas_primaria`, `cantidad_mochilas_secundaria`, `cantidad_mochilas_preparatoria`, `cantidad_colchonetas`, `cantidad_aguas`, `cantidad_botes_pintura`, `cantidad_botes_impermeabilizante`, `cantidad_bicicletas`, `cantidad_mesas`, `cantidad_sillas`, `cantidad_dulces`, `cantidad_pinatas`, `cantidad_juguetes`, `firma_entrega`, `firma_recibe`) VALUES
(0, 'entrada', 'carlos', 'Crc', '', '2024-12-06', 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 'carlos_20241206_entrega.png', 'Crc_20241206_recibe.png'),
(0, 'entrada', 'carlos', 'Crc', '', '2024-12-06', 100, 100, 100, 100, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0, 'carlos_20241206_entrega.png', 'Crc_20241206_recibe.png'),
(0, 'salida', 'test', 'Crc', 'CRC', '2024-12-06', 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'test_20241206_entrega.png', 'Crc_20241206_recibe.png');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL COMMENT 'Nombre de usuario',
  `email` varchar(255) NOT NULL COMMENT 'Ingrese el correo a registrar',
  `pass` varchar(255) NOT NULL COMMENT 'Ingrese su password (debe contener al menos una letra mayúscula y un caracter especial)',
  `nivel` int(11) NOT NULL COMMENT 'Nivel de usuario'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `email`, `pass`, `nivel`) VALUES
(1, 'Carlos Ibarra', 'carlosibarraa@live.com', '123456', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `estudio_socioeconomico`
--
ALTER TABLE `estudio_socioeconomico`
  ADD PRIMARY KEY (`id_despensa`);

--
-- Indexes for table `registros`
--
ALTER TABLE `registros`
  ADD PRIMARY KEY (`id_registro`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `estudio_socioeconomico`
--
ALTER TABLE `estudio_socioeconomico`
  MODIFY `id_despensa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `registros`
--
ALTER TABLE `registros`
  MODIFY `id_registro` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
