-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-08-2025 a las 17:44:22
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `dragon`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cards`
--

CREATE TABLE `cards` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `altura_mts` decimal(3,2) NOT NULL,
  `tecnica` decimal(5,3) NOT NULL,
  `fuerza` int(11) NOT NULL,
  `peleas_ganadas` int(11) NOT NULL,
  `velocidad_percent` int(11) NOT NULL,
  `ki` int(11) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cards`
--

INSERT INTO `cards` (`id`, `name`, `altura_mts`, `tecnica`, `fuerza`, `peleas_ganadas`, `velocidad_percent`, `ki`, `image_url`) VALUES
(1, 'Goku', 1.75, 9.500, 95, 87, 92, 98, '/BootcampPHP/assets/images/cards/goku.jpg'),
(2, 'Vegeta', 1.64, 9.200, 92, 78, 90, 95, '/BootcampPHP/assets/images/cards/vegeta.jpg'),
(3, 'Gohan', 1.76, 8.800, 88, 45, 85, 92, '/BootcampPHP/assets/images/cards/gohan.jpg'),
(4, 'Goten', 1.23, 7.500, 75, 32, 88, 85, '/BootcampPHP/assets/images/cards/goten.jpg'),
(5, 'Trunks', 1.29, 7.800, 78, 35, 90, 87, '/BootcampPHP/assets/images/cards/trunks.jpg'),
(6, 'Future Trunks', 1.70, 8.500, 85, 52, 88, 89, '/BootcampPHP/assets/images/cards/future_trunks.jpg'),
(7, 'Bardock', 1.78, 8.200, 82, 89, 85, 86, '/BootcampPHP/assets/images/cards/bardock.jpg'),
(8, 'Raditz', 1.85, 6.800, 78, 25, 82, 75, '/BootcampPHP/assets/images/cards/raditz.jpg'),
(9, 'Nappa', 2.02, 6.500, 88, 67, 65, 72, '/BootcampPHP/assets/images/cards/nappa.jpg'),
(10, 'Broly', 2.30, 7.200, 98, 45, 75, 96, '/BootcampPHP/assets/images/cards/broly.jpg'),
(11, 'Piccolo', 2.26, 9.000, 85, 68, 80, 88, '/images/cards/piccolo.jpg'),
(12, 'Krillin', 1.53, 8.500, 65, 48, 85, 70, '/images/cards/krillin.jpg'),
(13, 'Yamcha', 1.83, 7.200, 58, 35, 78, 52, '/images/cards/yamcha.jpg'),
(14, 'Tien', 1.87, 8.800, 72, 42, 82, 68, '/images/cards/tien.jpg'),
(15, 'Chiaotzu', 1.38, 6.500, 35, 15, 75, 45, '/images/cards/chiaotzu.jpg'),
(16, 'Master Roshi', 1.65, 9.200, 65, 78, 70, 75, '/images/cards/master_roshi.jpg'),
(17, 'Yajirobe', 1.65, 5.500, 45, 12, 40, 25, '/images/cards/yajirobe.jpg'),
(18, 'Android 16', 2.00, 7.800, 90, 15, 75, 85, '/images/cards/android_16.jpg'),
(19, 'Android 17', 1.69, 8.200, 82, 38, 88, 88, '/images/cards/android_17.jpg'),
(20, 'Android 18', 1.69, 8.000, 78, 42, 85, 85, '/images/cards/android_18.jpg'),
(21, 'Cell', 2.13, 9.800, 95, 28, 92, 96, '/images/cards/cell.jpg'),
(22, 'Cell Jr', 1.32, 8.500, 75, 8, 90, 80, '/images/cards/cell_jr.jpg'),
(23, 'Frieza', 1.58, 9.500, 92, 85, 88, 94, '/images/cards/frieza.jpg'),
(24, 'Majin Buu', 1.69, 7.500, 88, 45, 70, 92, '/images/cards/majin_buu.jpg'),
(25, 'Kid Buu', 1.45, 8.200, 85, 12, 95, 95, '/images/cards/kid_buu.jpg'),
(26, 'Super Buu', 2.44, 8.800, 90, 25, 88, 94, '/images/cards/super_buu.jpg'),
(27, 'Dabura', 2.13, 8.500, 82, 35, 78, 85, '/images/cards/dabura.jpg'),
(28, 'Saibaman', 1.20, 4.500, 45, 5, 65, 35, '/images/cards/saibaman.jpg'),
(29, 'Guldo', 1.19, 6.200, 35, 8, 45, 42, '/images/cards/guldo.jpg'),
(30, 'Recoome', 2.41, 6.800, 85, 22, 60, 65, '/images/cards/recoome.jpg'),
(31, 'Burter', 2.24, 7.200, 72, 18, 95, 68, '/images/cards/burter.jpg'),
(32, 'Jeice', 1.98, 7.000, 68, 15, 88, 65, '/images/cards/jeice.jpg'),
(33, 'Captain Ginyu', 1.87, 8.200, 78, 45, 82, 78, '/images/cards/captain_ginyu.jpg'),
(34, 'Bulma', 1.65, 9.800, 15, 0, 55, 8, '/images/cards/bulma.jpg'),
(35, 'Chi-Chi', 1.63, 7.500, 52, 25, 70, 45, '/images/cards/chi_chi.jpg'),
(36, 'Videl', 1.57, 7.800, 48, 35, 75, 42, '/images/cards/videl.jpg'),
(37, 'Mr. Satan', 1.88, 6.200, 55, 89, 65, 35, '/images/cards/mr_satan.jpg'),
(38, 'Ox-King', 3.50, 5.800, 78, 45, 35, 52, '/images/cards/ox_king.jpg'),
(39, 'Beerus', 1.75, 9.900, 99, 95, 95, 99, '/images/cards/beerus.jpg'),
(40, 'Whis', 1.79, 9.990, 99, 98, 98, 99, '/images/cards/whis.jpg'),
(41, 'King Kai', 1.03, 8.500, 25, 15, 45, 88, '/images/cards/king_kai.jpg'),
(42, 'Kami', 2.26, 9.200, 65, 35, 70, 85, '/images/cards/kami.jpg'),
(43, 'Mr. Popo', 1.75, 8.800, 72, 85, 75, 82, '/images/cards/mr_popo.jpg'),
(44, 'Cooler', 2.13, 9.200, 88, 42, 85, 90, '/images/cards/cooler.jpg'),
(45, 'Janemba', 1.95, 8.800, 92, 15, 88, 94, '/images/cards/janemba.jpg'),
(46, 'Garlic Jr', 1.07, 7.500, 65, 18, 72, 75, '/images/cards/garlic_jr.jpg'),
(47, 'Turles', 1.78, 8.000, 82, 35, 88, 85, '/images/cards/turles.jpg'),
(48, 'Lord Slug', 2.44, 7.800, 85, 45, 70, 82, '/images/cards/lord_slug.jpg'),
(49, 'Babidi', 1.22, 8.500, 25, 12, 55, 88, '/images/cards/babidi.jpg'),
(50, 'Spopovich', 2.13, 5.500, 78, 25, 65, 42, '/images/cards/spopovich.jpg'),
(51, 'Yamu', 1.83, 5.200, 72, 22, 68, 38, '/images/cards/yamu.jpg'),
(52, 'General Blue', 1.80, 7.800, 68, 35, 82, 65, '/images/cards/general_blue.jpg'),
(53, 'Colonel Silver', 1.75, 6.500, 55, 28, 75, 45, '/images/cards/colonel_silver.jpg'),
(54, 'Tambourine', 1.65, 7.200, 65, 18, 85, 62, '/images/cards/tambourine.jpg'),
(55, 'Cymbal', 1.70, 6.800, 62, 15, 82, 58, '/images/cards/cymbal.jpg'),
(56, 'Drum', 2.44, 7.500, 78, 22, 75, 68, '/images/cards/drum.jpg'),
(57, 'King Piccolo', 2.50, 8.800, 82, 65, 78, 88, '/images/cards/king_piccolo.jpg'),
(58, 'Shenron', 9.99, 9.500, 88, 85, 70, 95, '/images/cards/shenron.jpg'),
(59, 'Porunga', 9.99, 9.200, 85, 78, 65, 92, '/images/cards/porunga.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `game_rooms`
--

CREATE TABLE `game_rooms` (
  `id` int(11) NOT NULL,
  `max_players` int(11) DEFAULT 7,
  `current_players` int(11) DEFAULT 0,
  `status` enum('waiting','voting','playing','finished') DEFAULT 'waiting',
  `selected_map_id` int(11) DEFAULT NULL,
  `current_round` int(11) DEFAULT 0,
  `current_attribute` int(11) DEFAULT 0,
  `current_turn` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `started_at` timestamp NULL DEFAULT NULL,
  `room_code` varchar(10) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `game_rooms`
--

INSERT INTO `game_rooms` (`id`, `max_players`, `current_players`, `status`, `selected_map_id`, `current_round`, `current_attribute`, `current_turn`, `created_at`, `started_at`, `room_code`) VALUES
(4, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:34:07', NULL, 'D2MSC0'),
(5, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:34:19', NULL, 'QQ955H'),
(6, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:34:20', NULL, '6A9BDB'),
(7, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:34:48', NULL, '4L8MMF'),
(8, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:36:24', NULL, 'IHC3Q2'),
(9, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:38:03', NULL, 'T4D8PV'),
(10, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:39:20', NULL, 'M0E602'),
(11, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:42:43', NULL, 'CA1HKA'),
(12, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:42:57', NULL, '23CM14'),
(13, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:49:51', NULL, 'KD5XPK'),
(14, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:49:52', NULL, '91NDL5'),
(15, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:51:01', NULL, '3CQC2Y'),
(16, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:51:02', NULL, 'IFJ1DQ'),
(17, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:51:03', NULL, '51R1FT'),
(18, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:51:18', NULL, 'QDMUXM'),
(19, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:54:44', NULL, 'R8CG6W'),
(20, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 05:01:25', NULL, '6BX03V'),
(21, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 05:03:39', NULL, 'RZI0AP'),
(22, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 05:03:49', NULL, '4I6THV'),
(23, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 05:12:32', NULL, 'NVO15Q'),
(24, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 05:30:07', NULL, 'A8M7LA'),
(25, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 12:31:52', NULL, 'MNU61Y'),
(26, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 12:31:54', NULL, '6MMN5B'),
(27, 7, 7, 'waiting', 1, 0, 0, 0, '2025-08-04 12:36:09', NULL, 'S9FNOT'),
(28, 7, 7, 'waiting', 1, 0, 0, 0, '2025-08-04 12:36:20', NULL, 'JXW2NP'),
(29, 7, 7, 'waiting', 1, 0, 0, 0, '2025-08-04 12:42:12', NULL, 'HSJVFY'),
(30, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 12:53:17', NULL, 'ESHCS4'),
(31, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:03:11', NULL, 'H4O3H2'),
(32, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:03:41', NULL, 'YQ0WGA'),
(33, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:05:07', NULL, '037FR7'),
(34, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:05:23', NULL, 'N2N8PY'),
(35, 2, 2, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:06:16', NULL, 'ISQJKU'),
(36, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:22:54', NULL, '58JUWZ'),
(37, 2, 2, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:23:15', NULL, '7CR9HK'),
(38, 2, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:29:31', NULL, 'HIH5LG'),
(39, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:33:19', NULL, 'ELIPXB'),
(40, 2, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:37:58', NULL, 'Z6OJBZ'),
(41, 2, 2, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:39:40', NULL, '8FHW7Z'),
(42, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:41:26', NULL, 'FNSCY6'),
(43, 2, 2, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:44:19', NULL, 'Y2VD86'),
(44, 2, 2, 'waiting', NULL, 0, 0, 0, '2025-08-04 13:50:03', NULL, 'T5PGAL'),
(45, 2, 2, 'playing', 1, 1, 0, 0, '2025-08-04 14:10:17', '2025-08-04 14:10:17', 'A6PGPH'),
(46, 2, 2, 'playing', 1, 1, 0, 0, '2025-08-04 14:37:30', '2025-08-04 14:37:30', 'JQZR2C'),
(47, 2, 2, 'playing', 1, 1, 0, 0, '2025-08-04 14:58:21', '2025-08-04 14:58:21', 'JX286B'),
(48, 2, 2, 'playing', 1, 1, 0, 0, '2025-08-04 15:06:47', '2025-08-04 15:06:47', '5QE34J'),
(49, 2, 2, 'playing', 1, 1, 0, 0, '2025-08-04 15:09:07', '2025-08-04 15:09:08', '84NMNN'),
(50, 2, 2, 'playing', 1, 1, 0, 0, '2025-08-04 15:22:45', '2025-08-04 15:22:45', 'VF6C3B');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `game_rounds`
--

CREATE TABLE `game_rounds` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `round_number` int(11) NOT NULL,
  `selected_attribute` varchar(50) NOT NULL,
  `winner_player_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `game_rounds`
--

INSERT INTO `game_rounds` (`id`, `room_id`, `round_number`, `selected_attribute`, `winner_player_id`, `created_at`) VALUES
(1, 45, 1, 'altura_mts', NULL, '2025-08-04 14:10:36'),
(2, 46, 1, 'tecnica', NULL, '2025-08-04 14:37:41'),
(3, 47, 1, 'peleas_ganadas', NULL, '2025-08-04 14:58:24'),
(4, 48, 1, 'velocidad_percent', NULL, '2025-08-04 15:06:50'),
(5, 49, 1, 'tecnica', NULL, '2025-08-04 15:09:20'),
(6, 50, 1, 'velocidad_percent', NULL, '2025-08-04 15:22:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `maps`
--

CREATE TABLE `maps` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `maps`
--

INSERT INTO `maps` (`id`, `name`, `description`, `image_url`) VALUES
(1, 'Planeta Tierra', 'El hogar de Goku y los Guerreros Z', 'https://www.dzoom.org.es/wp-content/uploads/2017/07/seebensee-2384369-810x540.jpg'),
(2, 'Planeta Namek', 'Mundo natal de Piccolo y las Esferas del Dragón originales', 'https://www.dzoom.org.es/wp-content/uploads/2017/07/seebensee-2384369-810x540.jpg'),
(3, 'Planeta Vegeta', 'El planeta destruido de la raza Saiyajin', 'https://www.dzoom.org.es/wp-content/uploads/2017/07/seebensee-2384369-810x540.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `player_cards`
--

CREATE TABLE `player_cards` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `player_cards`
--

INSERT INTO `player_cards` (`id`, `room_id`, `player_id`, `card_id`, `is_used`, `assigned_at`) VALUES
(1, 45, 172, 27, 0, '2025-08-04 14:10:17'),
(2, 45, 172, 13, 0, '2025-08-04 14:10:17'),
(3, 45, 172, 55, 0, '2025-08-04 14:10:17'),
(4, 45, 172, 46, 0, '2025-08-04 14:10:17'),
(5, 45, 172, 6, 1, '2025-08-04 14:10:17'),
(6, 45, 172, 36, 0, '2025-08-04 14:10:17'),
(7, 45, 172, 29, 0, '2025-08-04 14:10:17'),
(8, 45, 172, 43, 0, '2025-08-04 14:10:17'),
(9, 45, 173, 48, 0, '2025-08-04 14:10:17'),
(10, 45, 173, 39, 0, '2025-08-04 14:10:17'),
(11, 45, 173, 51, 0, '2025-08-04 14:10:17'),
(12, 45, 173, 32, 0, '2025-08-04 14:10:17'),
(13, 45, 173, 25, 0, '2025-08-04 14:10:17'),
(14, 45, 173, 58, 0, '2025-08-04 14:10:17'),
(15, 45, 173, 28, 0, '2025-08-04 14:10:17'),
(16, 45, 173, 47, 0, '2025-08-04 14:10:17'),
(17, 46, 174, 21, 1, '2025-08-04 14:37:30'),
(18, 46, 174, 26, 0, '2025-08-04 14:37:30'),
(19, 46, 174, 52, 0, '2025-08-04 14:37:30'),
(20, 46, 174, 33, 0, '2025-08-04 14:37:30'),
(21, 46, 174, 25, 0, '2025-08-04 14:37:30'),
(22, 46, 174, 47, 0, '2025-08-04 14:37:30'),
(23, 46, 174, 42, 0, '2025-08-04 14:37:30'),
(24, 46, 174, 18, 0, '2025-08-04 14:37:30'),
(25, 46, 175, 34, 0, '2025-08-04 14:37:30'),
(26, 46, 175, 22, 0, '2025-08-04 14:37:30'),
(27, 46, 175, 20, 0, '2025-08-04 14:37:30'),
(28, 46, 175, 35, 0, '2025-08-04 14:37:30'),
(29, 46, 175, 40, 0, '2025-08-04 14:37:30'),
(30, 46, 175, 41, 0, '2025-08-04 14:37:30'),
(31, 46, 175, 24, 0, '2025-08-04 14:37:30'),
(32, 46, 175, 45, 0, '2025-08-04 14:37:30'),
(33, 47, 176, 52, 0, '2025-08-04 14:58:21'),
(34, 47, 176, 19, 0, '2025-08-04 14:58:21'),
(35, 47, 176, 40, 0, '2025-08-04 14:58:21'),
(36, 47, 176, 21, 0, '2025-08-04 14:58:21'),
(37, 47, 176, 56, 0, '2025-08-04 14:58:21'),
(38, 47, 176, 7, 0, '2025-08-04 14:58:21'),
(39, 47, 176, 51, 0, '2025-08-04 14:58:21'),
(40, 47, 176, 53, 1, '2025-08-04 14:58:21'),
(41, 47, 177, 36, 0, '2025-08-04 14:58:21'),
(42, 47, 177, 3, 0, '2025-08-04 14:58:21'),
(43, 47, 177, 47, 0, '2025-08-04 14:58:21'),
(44, 47, 177, 30, 0, '2025-08-04 14:58:21'),
(45, 47, 177, 15, 0, '2025-08-04 14:58:21'),
(46, 47, 177, 48, 0, '2025-08-04 14:58:21'),
(47, 47, 177, 55, 0, '2025-08-04 14:58:21'),
(48, 47, 177, 9, 0, '2025-08-04 14:58:21'),
(49, 48, 178, 6, 0, '2025-08-04 15:06:47'),
(50, 48, 178, 33, 0, '2025-08-04 15:06:47'),
(51, 48, 178, 19, 0, '2025-08-04 15:06:47'),
(52, 48, 178, 2, 0, '2025-08-04 15:06:47'),
(53, 48, 178, 4, 0, '2025-08-04 15:06:47'),
(54, 48, 178, 52, 0, '2025-08-04 15:06:47'),
(55, 48, 178, 28, 1, '2025-08-04 15:06:47'),
(56, 48, 178, 17, 0, '2025-08-04 15:06:47'),
(57, 48, 179, 13, 0, '2025-08-04 15:06:47'),
(58, 48, 179, 5, 0, '2025-08-04 15:06:47'),
(59, 48, 179, 21, 0, '2025-08-04 15:06:47'),
(60, 48, 179, 36, 0, '2025-08-04 15:06:47'),
(61, 48, 179, 32, 0, '2025-08-04 15:06:47'),
(62, 48, 179, 7, 0, '2025-08-04 15:06:47'),
(63, 48, 179, 38, 0, '2025-08-04 15:06:47'),
(64, 48, 179, 46, 0, '2025-08-04 15:06:47'),
(65, 49, 180, 43, 0, '2025-08-04 15:09:08'),
(66, 49, 180, 25, 0, '2025-08-04 15:09:08'),
(67, 49, 180, 44, 0, '2025-08-04 15:09:08'),
(68, 49, 180, 14, 0, '2025-08-04 15:09:08'),
(69, 49, 180, 9, 0, '2025-08-04 15:09:08'),
(70, 49, 180, 33, 0, '2025-08-04 15:09:08'),
(71, 49, 180, 55, 0, '2025-08-04 15:09:08'),
(72, 49, 180, 50, 0, '2025-08-04 15:09:08'),
(73, 49, 181, 29, 0, '2025-08-04 15:09:08'),
(74, 49, 181, 37, 0, '2025-08-04 15:09:08'),
(75, 49, 181, 4, 0, '2025-08-04 15:09:08'),
(76, 49, 181, 42, 0, '2025-08-04 15:09:08'),
(77, 49, 181, 18, 0, '2025-08-04 15:09:08'),
(78, 49, 181, 56, 0, '2025-08-04 15:09:08'),
(79, 49, 181, 53, 0, '2025-08-04 15:09:08'),
(80, 49, 181, 21, 0, '2025-08-04 15:09:08'),
(81, 50, 182, 34, 0, '2025-08-04 15:22:45'),
(82, 50, 182, 33, 0, '2025-08-04 15:22:45'),
(83, 50, 182, 13, 0, '2025-08-04 15:22:45'),
(84, 50, 182, 44, 0, '2025-08-04 15:22:45'),
(85, 50, 182, 37, 0, '2025-08-04 15:22:45'),
(86, 50, 182, 42, 0, '2025-08-04 15:22:45'),
(87, 50, 182, 25, 0, '2025-08-04 15:22:45'),
(88, 50, 182, 4, 1, '2025-08-04 15:22:45'),
(89, 50, 183, 9, 0, '2025-08-04 15:22:45'),
(90, 50, 183, 56, 0, '2025-08-04 15:22:45'),
(91, 50, 183, 12, 0, '2025-08-04 15:22:45'),
(92, 50, 183, 38, 0, '2025-08-04 15:22:45'),
(93, 50, 183, 45, 0, '2025-08-04 15:22:45'),
(94, 50, 183, 5, 0, '2025-08-04 15:22:45'),
(95, 50, 183, 49, 0, '2025-08-04 15:22:45'),
(96, 50, 183, 20, 0, '2025-08-04 15:22:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `room_players`
--

CREATE TABLE `room_players` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `player_name` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `player_order` int(11) NOT NULL,
  `score` int(11) DEFAULT 0,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `room_players`
--

INSERT INTO `room_players` (`id`, `room_id`, `player_name`, `user_id`, `player_order`, `score`, `joined_at`) VALUES
(1, 4, 'Jugador 1', 2, 1, 0, '2025-08-04 04:34:07'),
(2, 4, 'Jugador 2', 2, 2, 0, '2025-08-04 04:34:07'),
(3, 4, 'Jugador 3', 2, 3, 0, '2025-08-04 04:34:07'),
(4, 4, 'Jugador 4', 2, 4, 0, '2025-08-04 04:34:07'),
(5, 4, 'Jugador 5', 2, 5, 0, '2025-08-04 04:34:07'),
(6, 4, 'Jugador 6', 2, 6, 0, '2025-08-04 04:34:07'),
(7, 4, 'Jugador 7', 2, 7, 0, '2025-08-04 04:34:07'),
(8, 5, 'Jugador 1', 2, 1, 0, '2025-08-04 04:34:19'),
(9, 5, 'Jugador 2', 2, 2, 0, '2025-08-04 04:34:19'),
(10, 5, 'Jugador 3', 2, 3, 0, '2025-08-04 04:34:19'),
(11, 5, 'Jugador 4', 2, 4, 0, '2025-08-04 04:34:19'),
(12, 5, 'Jugador 5', 2, 5, 0, '2025-08-04 04:34:19'),
(13, 5, 'Jugador 6', 2, 6, 0, '2025-08-04 04:34:19'),
(14, 5, 'Jugador 7', 2, 7, 0, '2025-08-04 04:34:19'),
(15, 6, 'Jugador 1', 2, 1, 0, '2025-08-04 04:34:20'),
(16, 6, 'Jugador 2', 2, 2, 0, '2025-08-04 04:34:20'),
(17, 6, 'Jugador 3', 2, 3, 0, '2025-08-04 04:34:20'),
(18, 6, 'Jugador 4', 2, 4, 0, '2025-08-04 04:34:20'),
(19, 6, 'Jugador 5', 2, 5, 0, '2025-08-04 04:34:20'),
(20, 6, 'Jugador 6', 2, 6, 0, '2025-08-04 04:34:20'),
(21, 6, 'Jugador 7', 2, 7, 0, '2025-08-04 04:34:20'),
(22, 7, 'Jugador 1', 2, 1, 0, '2025-08-04 04:34:48'),
(23, 7, 'Jugador 2', 2, 2, 0, '2025-08-04 04:34:48'),
(24, 7, 'Jugador 3', 2, 3, 0, '2025-08-04 04:34:48'),
(25, 7, 'Jugador 4', 2, 4, 0, '2025-08-04 04:34:48'),
(26, 7, 'Jugador 5', 2, 5, 0, '2025-08-04 04:34:48'),
(27, 7, 'Jugador 6', 2, 6, 0, '2025-08-04 04:34:48'),
(28, 7, 'Jugador 7', 2, 7, 0, '2025-08-04 04:34:48'),
(29, 8, 'Jugador 1', 2, 1, 0, '2025-08-04 04:36:24'),
(30, 8, 'Jugador 2', 2, 2, 0, '2025-08-04 04:36:24'),
(31, 8, 'Jugador 3', 2, 3, 0, '2025-08-04 04:36:24'),
(32, 8, 'Jugador 4', 2, 4, 0, '2025-08-04 04:36:24'),
(33, 8, 'Jugador 5', 2, 5, 0, '2025-08-04 04:36:24'),
(34, 8, 'Jugador 6', 2, 6, 0, '2025-08-04 04:36:24'),
(35, 8, 'Jugador 7', 2, 7, 0, '2025-08-04 04:36:24'),
(36, 9, 'Jugador 1', NULL, 1, 0, '2025-08-04 04:38:03'),
(37, 9, 'Jugador 2', NULL, 2, 0, '2025-08-04 04:38:03'),
(38, 9, 'Jugador 3', NULL, 3, 0, '2025-08-04 04:38:03'),
(39, 9, 'Jugador 4', NULL, 4, 0, '2025-08-04 04:38:03'),
(40, 9, 'Jugador 5', NULL, 5, 0, '2025-08-04 04:38:03'),
(41, 9, 'Jugador 6', NULL, 6, 0, '2025-08-04 04:38:03'),
(42, 9, 'Jugador 7', NULL, 7, 0, '2025-08-04 04:38:03'),
(43, 10, 'Jugador 1', NULL, 1, 0, '2025-08-04 04:39:20'),
(44, 10, 'Jugador 2', NULL, 2, 0, '2025-08-04 04:39:20'),
(45, 10, 'Jugador 3', NULL, 3, 0, '2025-08-04 04:39:20'),
(46, 10, 'Jugador 4', NULL, 4, 0, '2025-08-04 04:39:20'),
(47, 10, 'Jugador 5', NULL, 5, 0, '2025-08-04 04:39:20'),
(48, 10, 'Jugador 6', NULL, 6, 0, '2025-08-04 04:39:20'),
(49, 10, 'Jugador 7', NULL, 7, 0, '2025-08-04 04:39:21'),
(50, 21, 'Jugador 1', 2, 1, 0, '2025-08-04 05:03:39'),
(51, 21, 'Jugador 2', 2, 2, 0, '2025-08-04 05:03:39'),
(52, 21, 'Jugador 3', 2, 3, 0, '2025-08-04 05:03:39'),
(53, 21, 'Jugador 4', 2, 4, 0, '2025-08-04 05:03:39'),
(54, 21, 'Jugador 5', 2, 5, 0, '2025-08-04 05:03:39'),
(55, 21, 'Jugador 6', 2, 6, 0, '2025-08-04 05:03:39'),
(56, 21, 'Jugador 7', 2, 7, 0, '2025-08-04 05:03:39'),
(57, 22, 'Jugador 1', 2, 1, 0, '2025-08-04 05:03:49'),
(58, 22, 'Jugador 2', 2, 2, 0, '2025-08-04 05:03:49'),
(59, 22, 'Jugador 3', 2, 3, 0, '2025-08-04 05:03:49'),
(60, 22, 'Jugador 4', 2, 4, 0, '2025-08-04 05:03:50'),
(61, 22, 'Jugador 5', 2, 5, 0, '2025-08-04 05:03:50'),
(62, 22, 'Jugador 6', 2, 6, 0, '2025-08-04 05:03:50'),
(63, 22, 'Jugador 7', 2, 7, 0, '2025-08-04 05:03:50'),
(64, 23, 'Jugador 1', NULL, 1, 0, '2025-08-04 05:12:32'),
(65, 23, 'Jugador 2', NULL, 2, 0, '2025-08-04 05:12:33'),
(66, 23, 'Jugador 3', NULL, 3, 0, '2025-08-04 05:12:33'),
(67, 23, 'Jugador 4', NULL, 4, 0, '2025-08-04 05:12:33'),
(68, 23, 'Jugador 5', NULL, 5, 0, '2025-08-04 05:12:33'),
(69, 23, 'Jugador 6', NULL, 6, 0, '2025-08-04 05:12:33'),
(70, 23, 'Jugador 7', NULL, 7, 0, '2025-08-04 05:12:33'),
(71, 24, 'Jugador 1', NULL, 1, 0, '2025-08-04 05:30:07'),
(72, 24, 'Jugador 2', NULL, 2, 0, '2025-08-04 05:30:07'),
(73, 24, 'Jugador 3', NULL, 3, 0, '2025-08-04 05:30:07'),
(74, 24, 'Jugador 4', NULL, 4, 0, '2025-08-04 05:30:07'),
(75, 24, 'Jugador 5', NULL, 5, 0, '2025-08-04 05:30:07'),
(76, 24, 'Jugador 6', NULL, 6, 0, '2025-08-04 05:30:07'),
(77, 24, 'Jugador 7', NULL, 7, 0, '2025-08-04 05:30:07'),
(78, 25, 'Jugador 1', NULL, 1, 0, '2025-08-04 12:31:53'),
(79, 25, 'Jugador 2', NULL, 2, 0, '2025-08-04 12:31:53'),
(80, 25, 'Jugador 3', NULL, 3, 0, '2025-08-04 12:31:53'),
(81, 25, 'Jugador 4', NULL, 4, 0, '2025-08-04 12:31:53'),
(82, 25, 'Jugador 5', NULL, 5, 0, '2025-08-04 12:31:53'),
(83, 25, 'Jugador 6', NULL, 6, 0, '2025-08-04 12:31:53'),
(84, 25, 'Jugador 7', NULL, 7, 0, '2025-08-04 12:31:53'),
(85, 26, 'Jugador 1', NULL, 1, 0, '2025-08-04 12:31:54'),
(86, 26, 'Jugador 2', NULL, 2, 0, '2025-08-04 12:31:54'),
(87, 26, 'Jugador 3', NULL, 3, 0, '2025-08-04 12:31:54'),
(88, 26, 'Jugador 4', NULL, 4, 0, '2025-08-04 12:31:54'),
(89, 26, 'Jugador 5', NULL, 5, 0, '2025-08-04 12:31:54'),
(90, 26, 'Jugador 6', NULL, 6, 0, '2025-08-04 12:31:54'),
(91, 26, 'Jugador 7', NULL, 7, 0, '2025-08-04 12:31:54'),
(92, 27, 'Jugador 1', NULL, 1, 0, '2025-08-04 12:36:09'),
(93, 27, 'Jugador 2', NULL, 2, 0, '2025-08-04 12:36:09'),
(94, 27, 'Jugador 3', NULL, 3, 0, '2025-08-04 12:36:09'),
(95, 27, 'Jugador 4', NULL, 4, 0, '2025-08-04 12:36:10'),
(96, 27, 'Jugador 5', NULL, 5, 0, '2025-08-04 12:36:10'),
(97, 27, 'Jugador 6', NULL, 6, 0, '2025-08-04 12:36:10'),
(98, 27, 'Jugador 7', NULL, 7, 0, '2025-08-04 12:36:10'),
(99, 28, 'Jugador 1', NULL, 1, 0, '2025-08-04 12:36:20'),
(100, 28, 'Jugador 2', NULL, 2, 0, '2025-08-04 12:36:20'),
(101, 28, 'Jugador 3', NULL, 3, 0, '2025-08-04 12:36:20'),
(102, 28, 'Jugador 4', NULL, 4, 0, '2025-08-04 12:36:20'),
(103, 28, 'Jugador 5', NULL, 5, 0, '2025-08-04 12:36:20'),
(104, 28, 'Jugador 6', NULL, 6, 0, '2025-08-04 12:36:20'),
(105, 28, 'Jugador 7', NULL, 7, 0, '2025-08-04 12:36:20'),
(106, 29, 'Jugador 1', NULL, 1, 0, '2025-08-04 12:42:12'),
(107, 29, 'Jugador 2', NULL, 2, 0, '2025-08-04 12:42:12'),
(108, 29, 'Jugador 3', NULL, 3, 0, '2025-08-04 12:42:12'),
(109, 29, 'Jugador9', NULL, 4, 0, '2025-08-04 12:42:12'),
(110, 29, 'Jugador 5', NULL, 5, 0, '2025-08-04 12:42:12'),
(111, 29, 'Jugador 6', NULL, 6, 0, '2025-08-04 12:42:12'),
(112, 29, 'Jugador 7', NULL, 7, 0, '2025-08-04 12:42:12'),
(113, 30, 'Jugador 1', NULL, 1, 0, '2025-08-04 12:53:17'),
(114, 30, 'Jugador 2', NULL, 2, 0, '2025-08-04 12:53:17'),
(115, 30, 'Jugador 3', NULL, 3, 0, '2025-08-04 12:53:17'),
(116, 30, 'Jugador 4', NULL, 4, 0, '2025-08-04 12:53:17'),
(117, 30, 'Jugador 5', NULL, 5, 0, '2025-08-04 12:53:17'),
(118, 30, 'Jugador 6', NULL, 6, 0, '2025-08-04 12:53:17'),
(119, 30, 'Jugador 7', NULL, 7, 0, '2025-08-04 12:53:17'),
(120, 31, 'Jugador 1', NULL, 1, 0, '2025-08-04 13:03:11'),
(121, 31, 'Jugador 2', NULL, 2, 0, '2025-08-04 13:03:11'),
(122, 31, 'Jugador 3', NULL, 3, 0, '2025-08-04 13:03:11'),
(123, 31, 'Jugador 4', NULL, 4, 0, '2025-08-04 13:03:11'),
(124, 31, 'Jugador 5', NULL, 5, 0, '2025-08-04 13:03:11'),
(125, 31, 'Jugador 6', NULL, 6, 0, '2025-08-04 13:03:11'),
(126, 31, 'Jugador 7', NULL, 7, 0, '2025-08-04 13:03:11'),
(127, 32, 'Jugador 1', NULL, 1, 0, '2025-08-04 13:03:41'),
(128, 32, 'Jugador 2', NULL, 2, 0, '2025-08-04 13:03:41'),
(129, 32, 'Jugador 3', NULL, 3, 0, '2025-08-04 13:03:41'),
(130, 32, 'Jugador 4', NULL, 4, 0, '2025-08-04 13:03:41'),
(131, 32, 'Jugador 5', NULL, 5, 0, '2025-08-04 13:03:41'),
(132, 32, 'Jugador 6', NULL, 6, 0, '2025-08-04 13:03:41'),
(133, 32, 'Jugador 7', NULL, 7, 0, '2025-08-04 13:03:41'),
(134, 33, 'Jugador 1', NULL, 1, 0, '2025-08-04 13:05:07'),
(135, 33, 'Jugador 2', NULL, 2, 0, '2025-08-04 13:05:07'),
(136, 33, 'Jugador 3', NULL, 3, 0, '2025-08-04 13:05:07'),
(137, 33, 'Jugador 4', NULL, 4, 0, '2025-08-04 13:05:07'),
(138, 33, 'Jugador 5', NULL, 5, 0, '2025-08-04 13:05:07'),
(139, 33, 'Jugador 6', NULL, 6, 0, '2025-08-04 13:05:07'),
(140, 33, 'Jugador 7', NULL, 7, 0, '2025-08-04 13:05:07'),
(141, 34, 'Jugador 1', NULL, 1, 0, '2025-08-04 13:05:23'),
(142, 34, 'Jugador 2', NULL, 2, 0, '2025-08-04 13:05:23'),
(143, 34, 'Jugador 3', NULL, 3, 0, '2025-08-04 13:05:23'),
(144, 34, 'Jugador 4', NULL, 4, 0, '2025-08-04 13:05:23'),
(145, 34, 'Jugador 5', NULL, 5, 0, '2025-08-04 13:05:23'),
(146, 34, 'Jugador 6', NULL, 6, 0, '2025-08-04 13:05:23'),
(147, 34, 'Jugador 7', NULL, 7, 0, '2025-08-04 13:05:23'),
(148, 35, 'Jugador 1', NULL, 1, 0, '2025-08-04 13:06:16'),
(149, 35, 'Jugador 2', NULL, 2, 0, '2025-08-04 13:06:16'),
(150, 36, 'Jugador 1', NULL, 1, 0, '2025-08-04 13:22:54'),
(151, 36, 'Jugador 2', NULL, 2, 0, '2025-08-04 13:22:54'),
(152, 36, 'Jugador 3', NULL, 3, 0, '2025-08-04 13:22:54'),
(153, 36, 'Jugador 4', NULL, 4, 0, '2025-08-04 13:22:54'),
(154, 36, 'Jugador 5', NULL, 5, 0, '2025-08-04 13:22:54'),
(155, 36, 'Jugador 6', NULL, 6, 0, '2025-08-04 13:22:54'),
(156, 36, 'Jugador 7', NULL, 7, 0, '2025-08-04 13:22:54'),
(157, 37, 'Jugador 1', NULL, 1, 0, '2025-08-04 13:23:15'),
(158, 37, 'Jugador 2', NULL, 2, 0, '2025-08-04 13:23:15'),
(159, 41, 'Jugador 1', NULL, 1, 0, '2025-08-04 13:39:40'),
(160, 41, 'Jugador 2', NULL, 2, 0, '2025-08-04 13:39:40'),
(161, 42, 'Jugador 1', NULL, 1, 0, '2025-08-04 13:41:26'),
(162, 42, 'Jugador 2', NULL, 2, 0, '2025-08-04 13:41:26'),
(163, 42, 'Jugador 3', NULL, 3, 0, '2025-08-04 13:41:26'),
(164, 42, 'Jugador 4', NULL, 4, 0, '2025-08-04 13:41:26'),
(165, 42, 'Jugador 5', NULL, 5, 0, '2025-08-04 13:41:26'),
(166, 42, 'Jugador 6', NULL, 6, 0, '2025-08-04 13:41:26'),
(167, 42, 'Jugador 7', NULL, 7, 0, '2025-08-04 13:41:27'),
(168, 43, 'Jugador 1', NULL, 1, 0, '2025-08-04 13:44:19'),
(169, 43, 'Jugador 2', NULL, 2, 0, '2025-08-04 13:44:19'),
(170, 44, 'dsf', NULL, 1, 0, '2025-08-04 13:50:03'),
(171, 44, 'sdf', NULL, 2, 0, '2025-08-04 13:50:03'),
(172, 45, 'Jugador 1', NULL, 1, 0, '2025-08-04 14:10:17'),
(173, 45, 'Jugador 2', NULL, 2, 0, '2025-08-04 14:10:17'),
(174, 46, 'Jugador 1', NULL, 1, 0, '2025-08-04 14:37:30'),
(175, 46, 'Jugador 2', NULL, 2, 0, '2025-08-04 14:37:30'),
(176, 47, 'Jugador 1', NULL, 1, 0, '2025-08-04 14:58:21'),
(177, 47, 'Jugador 2', NULL, 2, 0, '2025-08-04 14:58:21'),
(178, 48, 'Jugador 1', NULL, 1, 0, '2025-08-04 15:06:47'),
(179, 48, 'Jugador 2', NULL, 2, 0, '2025-08-04 15:06:47'),
(180, 49, 'Jugador 1', NULL, 1, 0, '2025-08-04 15:09:08'),
(181, 49, 'Jugador 2', NULL, 2, 0, '2025-08-04 15:09:08'),
(182, 50, 'Jugador 1', NULL, 1, 0, '2025-08-04 15:22:45'),
(183, 50, 'Jugador 2', NULL, 2, 0, '2025-08-04 15:22:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `round_cards`
--

CREATE TABLE `round_cards` (
  `id` int(11) NOT NULL,
  `round_id` int(11) NOT NULL,
  `player_id` int(11) NOT NULL,
  `card_id` int(11) NOT NULL,
  `attribute_value` int(11) NOT NULL,
  `played_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `round_cards`
--

INSERT INTO `round_cards` (`id`, `round_id`, `player_id`, `card_id`, `attribute_value`, `played_at`) VALUES
(1, 1, 172, 6, 2, '2025-08-04 14:11:30'),
(2, 2, 174, 21, 10, '2025-08-04 14:37:54'),
(3, 3, 176, 53, 28, '2025-08-04 14:58:30'),
(4, 4, 178, 28, 65, '2025-08-04 15:06:57'),
(5, 6, 182, 4, 88, '2025-08-04 15:22:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `created_at`) VALUES
(1, 'daniel', '$2y$10$TOe73IgYrkZXC.66lkc6TOeKWZvgfgn4FZ83BRM0n3q/FNBPrBJYS', '2025-08-03 16:44:14'),
(2, 'dadada', '$2y$10$GEh1oivKHT8px5kjabU1z.2h73h7CIms5P/w27ww7G65hXb.UBgwe', '2025-08-03 18:46:37'),
(3, 'da', '$2y$10$COC0krlrresKfbVersZW8.2V56CBKOwKP/pp7YcZc4ltQ2v4spqJG', '2025-08-04 01:35:39');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cards`
--
ALTER TABLE `cards`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `game_rooms`
--
ALTER TABLE `game_rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_code` (`room_code`),
  ADD KEY `selected_map_id` (`selected_map_id`);

--
-- Indices de la tabla `game_rounds`
--
ALTER TABLE `game_rounds`
  ADD PRIMARY KEY (`id`),
  ADD KEY `winner_player_id` (`winner_player_id`),
  ADD KEY `idx_room_round` (`room_id`,`round_number`);

--
-- Indices de la tabla `maps`
--
ALTER TABLE `maps`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `player_cards`
--
ALTER TABLE `player_cards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `player_id` (`player_id`),
  ADD KEY `card_id` (`card_id`),
  ADD KEY `idx_room_player` (`room_id`,`player_id`),
  ADD KEY `idx_unused_cards` (`room_id`,`player_id`,`is_used`);

--
-- Indices de la tabla `room_players`
--
ALTER TABLE `room_players`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `round_cards`
--
ALTER TABLE `round_cards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `player_id` (`player_id`),
  ADD KEY `card_id` (`card_id`),
  ADD KEY `idx_round_player` (`round_id`,`player_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cards`
--
ALTER TABLE `cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT de la tabla `game_rooms`
--
ALTER TABLE `game_rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `game_rounds`
--
ALTER TABLE `game_rounds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `maps`
--
ALTER TABLE `maps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `player_cards`
--
ALTER TABLE `player_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT de la tabla `room_players`
--
ALTER TABLE `room_players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=184;

--
-- AUTO_INCREMENT de la tabla `round_cards`
--
ALTER TABLE `round_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `game_rooms`
--
ALTER TABLE `game_rooms`
  ADD CONSTRAINT `game_rooms_ibfk_1` FOREIGN KEY (`selected_map_id`) REFERENCES `maps` (`id`);

--
-- Filtros para la tabla `game_rounds`
--
ALTER TABLE `game_rounds`
  ADD CONSTRAINT `game_rounds_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `game_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `game_rounds_ibfk_2` FOREIGN KEY (`winner_player_id`) REFERENCES `room_players` (`id`);

--
-- Filtros para la tabla `player_cards`
--
ALTER TABLE `player_cards`
  ADD CONSTRAINT `player_cards_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `game_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `player_cards_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `room_players` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `player_cards_ibfk_3` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`);

--
-- Filtros para la tabla `room_players`
--
ALTER TABLE `room_players`
  ADD CONSTRAINT `room_players_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `game_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `room_players_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `round_cards`
--
ALTER TABLE `round_cards`
  ADD CONSTRAINT `round_cards_ibfk_1` FOREIGN KEY (`round_id`) REFERENCES `game_rounds` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `round_cards_ibfk_2` FOREIGN KEY (`player_id`) REFERENCES `room_players` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `round_cards_ibfk_3` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
