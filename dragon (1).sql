-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 04-08-2025 a las 07:21:24
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
  `room_code` varchar(10) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `game_rooms`
--

INSERT INTO `game_rooms` (`id`, `max_players`, `current_players`, `status`, `selected_map_id`, `current_round`, `current_attribute`, `current_turn`, `created_at`, `room_code`) VALUES
(4, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:34:07', 'D2MSC0'),
(5, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:34:19', 'QQ955H'),
(6, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:34:20', '6A9BDB'),
(7, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:34:48', '4L8MMF'),
(8, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:36:24', 'IHC3Q2'),
(9, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:38:03', 'T4D8PV'),
(10, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:39:20', 'M0E602'),
(11, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:42:43', 'CA1HKA'),
(12, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:42:57', '23CM14'),
(13, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:49:51', 'KD5XPK'),
(14, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:49:52', '91NDL5'),
(15, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:51:01', '3CQC2Y'),
(16, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:51:02', 'IFJ1DQ'),
(17, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:51:03', '51R1FT'),
(18, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:51:18', 'QDMUXM'),
(19, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 04:54:44', 'R8CG6W'),
(20, 7, 0, 'waiting', NULL, 0, 0, 0, '2025-08-04 05:01:25', '6BX03V'),
(21, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 05:03:39', 'RZI0AP'),
(22, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 05:03:49', '4I6THV'),
(23, 7, 7, 'waiting', NULL, 0, 0, 0, '2025-08-04 05:12:32', 'NVO15Q');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `game_rounds`
--

CREATE TABLE `game_rounds` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `round_number` int(11) NOT NULL,
  `selected_attribute` int(11) NOT NULL,
  `winner_player_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(70, 23, 'Jugador 7', NULL, 7, 0, '2025-08-04 05:12:33');

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
  ADD KEY `room_id` (`room_id`),
  ADD KEY `winner_player_id` (`winner_player_id`);

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
  ADD KEY `room_id` (`room_id`),
  ADD KEY `player_id` (`player_id`),
  ADD KEY `card_id` (`card_id`);

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
  ADD KEY `round_id` (`round_id`),
  ADD KEY `player_id` (`player_id`),
  ADD KEY `card_id` (`card_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `game_rounds`
--
ALTER TABLE `game_rounds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `maps`
--
ALTER TABLE `maps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `player_cards`
--
ALTER TABLE `player_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `room_players`
--
ALTER TABLE `room_players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT de la tabla `round_cards`
--
ALTER TABLE `round_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
