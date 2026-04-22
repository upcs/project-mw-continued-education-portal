-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 16, 2026 at 04:42 PM
-- Server version: 10.3.39-MariaDB
-- PHP Version: 7.3.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cs341s26mwed`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `instructor` varchar(255) NOT NULL,
  `lessons` int(11) DEFAULT 0,
  `quizzes` int(11) DEFAULT 0,
  `progress` int(11) DEFAULT 0,
  `thumbnail` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `uploaded_by_email` varchar(255) DEFAULT NULL,
  `resource_type` varchar(20) NOT NULL DEFAULT 'file',
  `resource_url` text DEFAULT NULL,
  `embed_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `instructor`, `lessons`, `quizzes`, `progress`, `thumbnail`, `description`, `file_url`, `file_type`, `uploaded_by_email`, `resource_type`, `resource_url`, `embed_url`) VALUES
(1, 'Software Engineering', 'Hassinullah Niazy', 10, 2, 60, 'https://via.placeholder.com/300x180?text=Software+Engineering', 'Learn software engineering principles, design, testing, and development workflows.', NULL, NULL, NULL, 'file', NULL, NULL),
(2, 'React Development', 'John Doe', 12, 3, 35, 'https://via.placeholder.com/300x180?text=React+Development', 'Build modern React applications using components, hooks, and routing.', NULL, NULL, NULL, 'file', NULL, NULL),
(3, 'adsf', 'fadsf', 2, 1, 10, 'http://localhost:5000/uploads/1775106017025-72889979-Lab-7.pdf', 'asdf', '', '', NULL, 'file', NULL, NULL),
(4, 'AAAA', 'aaaa', 0, 0, 0, 'http://localhost:5000/uploads/1775106064845-612600005-Lab-7.pdf', 'aaaa', '', '', NULL, 'file', NULL, NULL),
(5, 'Lab 7', 'Dr. Cenek', 1, 1, 0, '', 'This is lab for CyberSecurity.', 'http://localhost:5000/uploads/1775106773306-593061817-Lab-7.pdf', 'application/pdf', NULL, 'file', NULL, NULL),
(6, 'dsaf', 'fasdf', 0, 0, 0, 'http://localhost:5000/uploads/1775107329067-361453917-COURSES---CATALOG.png', 'fasdf', '', '', NULL, 'file', NULL, NULL),
(7, 'adsf', 'fdsaf', 0, 0, 0, 'http://localhost:5000/uploads/1775107373608-702782741-Lab-7.pdf', 'fasdfdsaf', '', '', NULL, 'file', NULL, NULL),
(8, 'my course', 'me', 0, 0, 0, 'http://localhost:5000/uploads/1775108409292-461821538-My-image.jpeg', 'mine', 'http://localhost:5000/uploads/1775108409304-504154823-Lab-7.pdf', 'application/pdf', NULL, 'file', NULL, NULL),
(9, 'Course 1', 'Cenek', 1, 0, 0, 'http://localhost:5000/uploads/1775147654464-691628436-default-avatar.png', 'this is a good course', 'http://localhost:5000/uploads/1775147654487-835557891-Lab-7.pdf', 'application/pdf', NULL, 'file', NULL, NULL),
(10, 'name', 'cenek', 1, 0, 0, 'http://localhost:5000/uploads/1775152999993-24590616-png-transparent-default-avatar.png', 'this a new course', 'http://localhost:5000/uploads/1775152999995-505168486-Lab-7.pdf', 'application/pdf', NULL, 'file', NULL, NULL),
(11, 'Hanabi Game', 'Anyone', 3, 1, 0, 'http://localhost:3000/uploads/1775717629131-175084182-hanabi_launcher.webp', 'This is a Card Game.', 'http://localhost:3000/uploads/1775717629145-864810264-HANABI.pdf', 'application/pdf', 'malawi@up.edu', 'file', NULL, NULL),
(12, 'Title11', 'me', 0, 0, 0, '', '', '', '', 'malawi@up.edu', 'file', NULL, NULL),
(13, 'Test file', '123', 0, 0, 0, '', '', 'http://localhost:3000/uploads/1775751912529-699112219-najskd.txt', 'text/plain', 'malawi@up.edu', 'file', NULL, NULL),
(14, 'dfasd', 'asdas', 0, 0, 0, '', '', 'http://cs341s26mwed.campus.up.edu:3000/uploads/1775752182781-65852739-najskd.txt', 'text/plain', 'malawi@up.edu', 'file', NULL, NULL),
(15, 'askdna', 'asdasd', 0, 0, 0, '', '', 'http://cs341s26mwed.campus.up.edu:3000/uploads/1775752206385-608054570-najskd.txt', 'text/plain', 'malawi@up.edu', 'file', NULL, NULL),
(16, 'title', 'Davie', 1, 2, 0, 'http://cs341s26mwed.campus.up.edu:3000/uploads/1775925344038-824399425-AGS_security_service_luaocw.png', 'this is test', 'http://cs341s26mwed.campus.up.edu:3000/uploads/1775925344040-446939889-Lab-7.pdf', 'application/pdf', 'malawi@up.edu', 'file', NULL, NULL),
(17, 'Test URL', 'TEST', 1, 2, 0, '', 'Test', NULL, NULL, 'malawi@up.edu', 'url', 'https://youtu.be/1hMmZak1-6M?si=-rw0QkdJezELfXlj', 'https://www.youtube.com/embed/1hMmZak1-6M'),
(18, 'test url', 'test url', 0, 0, 0, '', 'test url', NULL, NULL, 'malawi@up.edu', 'url', 'https://youtu.be/IC8Gc7yACp0?si=a0eZdh0Ue0FxNK3h', 'https://www.youtube.com/embed/IC8Gc7yACp0'),
(19, 'Test URL', 'test URL', 0, 0, 0, '', 'tarslkfdj', NULL, NULL, 'malawi@up.edu', 'url', 'https://youtu.be/IC8Gc7yACp0?si=bQjH3Q9rebOg-dvv', 'https://www.youtube.com/embed/IC8Gc7yACp0');

-- --------------------------------------------------------

--
-- Table structure for table `course_modules`
--

CREATE TABLE `course_modules` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(20) DEFAULT 'lesson',
  `content` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `position` int(11) DEFAULT 0,
  `created_by_email` varchar(255) DEFAULT NULL,
  `resource_type` varchar(20) NOT NULL DEFAULT 'file',
  `resource_url` text DEFAULT NULL,
  `embed_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `course_modules`
--

INSERT INTO `course_modules` (`id`, `course_id`, `title`, `type`, `content`, `file_url`, `file_type`, `position`, `created_by_email`, `resource_type`, `resource_url`, `embed_url`) VALUES
(1, 1, 'Introduction to Software Engineering', 'lesson', NULL, NULL, NULL, 0, NULL, 'file', NULL, NULL),
(2, 1, 'Software Development Life Cycle', 'lesson', NULL, NULL, NULL, 0, NULL, 'file', NULL, NULL),
(3, 1, 'Testing and Debugging', 'lesson', NULL, NULL, NULL, 0, NULL, 'file', NULL, NULL),
(4, 2, 'React Basics', 'lesson', NULL, NULL, NULL, 0, NULL, 'file', NULL, NULL),
(5, 2, 'State and Props', 'lesson', NULL, NULL, NULL, 0, NULL, 'file', NULL, NULL),
(6, 2, 'React Router', 'lesson', NULL, NULL, NULL, 0, NULL, 'file', NULL, NULL),
(7, 5, 'Lab 8', 'lesson', 'safdsa', 'http://localhost:5000/uploads/1775113268259-998163051-Lab8---Implementing-Security-Monitoring-and-Logging-(4e)---Hassinullah-Niazy.pdf', 'application/pdf', 1, NULL, 'file', NULL, NULL),
(8, 5, 'lab 9', 'quiz', 'asdf', 'http://localhost:5000/uploads/1775113302962-50737443-Lab3---Performing-Packet-Capture-and-Traffic-Analysis-(4e)---Hassinullah-Niazy.pdf', 'application/pdf', 2, NULL, 'file', NULL, NULL),
(9, 5, 'sdaf', 'quiz', 'sdafas', 'http://localhost:5000/uploads/1775113321758-729601060-Lab1---Exploring-the-Seven-Domains-of-a-Typical-IT-Infrastructure-(4e)---Hassinullah-Niazy.pdf', 'application/pdf', 3, NULL, 'file', NULL, NULL),
(10, 8, 'dsaf', 'lesson', 'dasf', 'http://localhost:5000/uploads/1775113380902-297332642-Lab6---Assessing-Common-Attack-Vectors-(4e)---Hassinullah-Niazy.pdf', 'application/pdf', 1, NULL, 'file', NULL, NULL),
(11, 8, 'baby', 'quiz', 'aj;ladsfj', 'http://localhost:5000/uploads/1775113650814-232038475-LexicalAnalysis.pdf', 'application/pdf', 2, NULL, 'file', NULL, NULL),
(12, 9, 'Lesson 1.1', 'lesson', 'this is new module', 'http://localhost:5000/uploads/1775147725290-944229672-UNSC-State-Behavior.pdf', 'application/pdf', 1, NULL, 'file', NULL, NULL),
(13, 9, 'Quzi 1', 'quiz', 'quiz ', 'http://localhost:5000/uploads/1775147785855-370373068-Lab-7.pdf', 'application/pdf', 2, NULL, 'file', NULL, NULL),
(14, 10, 'lesson 2', 'lesson', 'sadkfl;jdsa', 'http://localhost:5000/uploads/1775153043165-31944342-Lab-7.pdf', 'application/pdf', 1, NULL, 'file', NULL, NULL),
(15, 10, 'quiz', 'quiz', 'quiz', 'http://localhost:5000/uploads/1775153069813-410504922-Lab-7.pdf', 'application/pdf', 2, NULL, 'file', NULL, NULL),
(16, 11, 'Title', 'lesson', ' lesson', 'http://cs341s26mwed.campus.up.edu:3000/uploads/1775925066219-823663556-Welcome-Page.jpg', 'image/jpeg', 1, 'malawi@up.edu', 'file', NULL, NULL),
(17, 11, 'fdas', 'lesson', 'fadsf', 'http://cs341s26mwed.campus.up.edu:3000/uploads/1775925089635-414736885-welcome.jpg', 'image/jpeg', 2, 'malawi@up.edu', 'file', NULL, NULL),
(18, 11, 'title', 'lesson', 'lesson 2', 'http://cs341s26mwed.campus.up.edu:3000/uploads/1775925122722-407595016-Lab-7.pdf', 'application/pdf', 3, 'malawi@up.edu', 'file', NULL, NULL),
(19, 11, 'tile', 'quiz', 'dfsadf', 'http://cs341s26mwed.campus.up.edu:3000/uploads/1775925160540-153753775-Lab-7.pdf', 'application/pdf', 4, 'malawi@up.edu', 'file', NULL, NULL),
(20, 16, 'test', 'lesson', 'test', '', '', 1, 'malawi@up.edu', 'file', NULL, NULL),
(21, 16, 'test', 'quiz', 'test', '', '', 2, 'malawi@up.edu', 'file', NULL, NULL),
(22, 16, 'rtest', 'quiz', 'test', '', '', 3, 'malawi@up.edu', 'file', NULL, NULL),
(23, 17, 'Module Test URL', 'lesson', 'Lesson URL', NULL, NULL, 1, 'malawi@up.edu', 'url', 'https://www.youtube.com/watch?v=kwvXeeNwnZU&list=RD1hMmZak1-6M&index=11', 'https://www.youtube.com/embed/kwvXeeNwnZU'),
(24, 17, 'quiz', 'quiz', 'quiz', 'http://cs341s26mwed.campus.up.edu:3000/uploads/1776212516740-57695523-CS_MCQ_300_Questions(2)---Copy.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 2, 'malawi@up.edu', 'file', NULL, NULL),
(25, 17, 'Test Quiz', 'quiz', 'test quiz', 'http://cs341s26mwed.campus.up.edu:3000/uploads/1776212619528-574967406-Computer-Science-Major-Field-Compet.txt', 'text/plain', 3, 'malawi@up.edu', 'file', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `discussions`
--

CREATE TABLE `discussions` (
  `id` int(11) NOT NULL,
  `author_email` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `question` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `discussions`
--

INSERT INTO `discussions` (`id`, `author_email`, `title`, `question`, `created_at`, `updated_at`) VALUES
(1, 'malawi@up.edu', 'Hello', 'I need help Test', '2026-04-09 00:25:04', '2026-04-09 00:25:04'),
(2, 'malawi@up.edu', 'test', 'test???', '2026-04-11 09:38:59', '2026-04-11 09:38:59');

-- --------------------------------------------------------

--
-- Table structure for table `discussion_replies`
--

CREATE TABLE `discussion_replies` (
  `id` int(11) NOT NULL,
  `discussion_id` int(11) NOT NULL,
  `author_email` varchar(255) NOT NULL,
  `reply` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `discussion_replies`
--

INSERT INTO `discussion_replies` (`id`, `discussion_id`, `author_email`, `reply`, `created_at`, `updated_at`) VALUES
(1, 1, 'malawi@up.edu', 'Here is help - Test', '2026-04-09 00:25:19', '2026-04-09 00:25:19'),
(2, 1, 'malawi@up.edu', 'fjlksa;df', '2026-04-09 00:25:24', '2026-04-09 00:25:24'),
(3, 2, 'malawi@up.edu', 'response', '2026-04-11 09:39:21', '2026-04-11 09:39:21'),
(4, 2, 'malawi@up.edu', '49014', '2026-04-11 09:39:32', '2026-04-11 09:39:32');

-- --------------------------------------------------------

--
-- Table structure for table `educator_course_assignments`
--

CREATE TABLE `educator_course_assignments` (
  `id` int(11) NOT NULL,
  `educator_email` varchar(255) NOT NULL,
  `course_id` int(11) NOT NULL,
  `assigned_by_email` varchar(255) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `status` enum('assigned','in_progress','completed') DEFAULT 'assigned',
  `assigned_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `source` enum('principal','self') NOT NULL DEFAULT 'principal',
  `progress` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `educator_course_assignments`
--

INSERT INTO `educator_course_assignments` (`id`, `educator_email`, `course_id`, `assigned_by_email`, `organization_id`, `status`, `assigned_at`, `updated_at`, `source`, `progress`) VALUES
(1, 'educator@up.edu', 11, 'educator@up.edu', 1, 'in_progress', '2026-04-09 10:10:57', '2026-04-09 10:10:57', 'self', 0),
(2, 'educator@up.edu', 5, 'educator@up.edu', 1, 'in_progress', '2026-04-09 10:11:31', '2026-04-09 10:11:31', 'self', 0),
(3, 'educator@up.edu', 19, 'malawi_principal@up.edu', 4, 'in_progress', '2026-04-14 17:51:43', '2026-04-14 17:52:38', 'principal', 0),
(5, 'educator@up.edu', 17, 'educator@up.edu', 4, 'in_progress', '2026-04-14 17:53:46', '2026-04-14 17:53:46', 'self', 0);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `recipient_email` varchar(255) NOT NULL,
  `actor_email` varchar(255) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `link` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `recipient_email`, `actor_email`, `type`, `title`, `message`, `link`, `is_read`, `created_at`, `read_at`) VALUES
(1, 'malawi_principal@up.edu', 'malawi@up.edu', 'principal_assigned', 'You were assigned as a principal', 'You have been assigned as the principal $(organizationName).', '/organization-management', 0, '2026-04-14 23:08:50', NULL),
(2, 'educator@up.edu', 'malawi_principal@up.edu', 'course_assigned', 'New course assigned', 'A new course has been assigned to you.', '/course-details/19', 1, '2026-04-15 00:51:43', '2026-04-15 00:52:38'),
(3, 'malawi@up.edu', 'educator@up.edu', 'quiz_submitted', 'New quiz submission received', 'A learner submitted \"quiz\".', '/modules/24/submissions', 0, '2026-04-15 00:54:13', NULL),
(4, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 00:57:02', NULL),
(5, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:20', NULL),
(6, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:22', NULL),
(7, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:22', NULL),
(8, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:22', NULL),
(9, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:23', NULL),
(10, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:23', NULL),
(11, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:23', NULL),
(12, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:23', NULL),
(13, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:23', NULL),
(14, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:24', NULL),
(15, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:24', NULL),
(16, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:24', NULL),
(17, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:24', NULL),
(18, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:25', NULL),
(19, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:25', NULL),
(20, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:26', NULL),
(21, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:26', NULL),
(22, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:26', NULL),
(23, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:26', NULL),
(24, 'educator@up.edu', 'malawi@up.edu', 'submission_reviewed', 'Your quiz submission was reviewed', 'Your submission for \"quiz\" in \"Test URL\" was approved.', '/my-submissions', 0, '2026-04-15 01:45:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `organizations`
--

CREATE TABLE `organizations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(100) DEFAULT NULL,
  `principal_email` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`id`, `name`, `code`, `principal_email`, `created_at`, `updated_at`) VALUES
(1, 'University of Portland', NULL, 'principal@up.edu', '2026-04-07 15:37:16', '2026-04-09 10:08:23'),
(3, 'UPlendo', '00212', 'principal@up.edu', '2026-04-07 21:51:59', '2026-04-11 09:58:09'),
(4, 'TEST Organization', '023165498', 'malawi_principal@up.edu', '2026-04-11 09:53:00', '2026-04-14 16:08:46');

-- --------------------------------------------------------

--
-- Table structure for table `profile`
--

CREATE TABLE `profile` (
  `id` int(11) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `fullname` varchar(100) NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `organization` varchar(100) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `organization_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `profile`
--

INSERT INTO `profile` (`id`, `photo`, `fullname`, `role`, `email`, `whatsapp`, `organization`, `specialization`, `created_at`, `organization_id`) VALUES
(2, 'http://cs341s26mwed.campus.up.edu:3000/uploads/1775927577897-300379419-png-transparent-default-avatar.png', 'Malawi', 'admin', 'malawi@up.edu', '502-56413', '', 'Physics, English, ', '2026-04-08 04:06:06', 1),
(3, NULL, 'Educator', 'educator', 'educator@up.edu', NULL, NULL, NULL, '2026-04-09 17:06:09', 4),
(4, '', 'Principal', 'principal', 'principal@up.edu', '', 'University of Portland', 'CS', '2026-04-09 17:06:44', NULL),
(5, NULL, 'Trainer', 'trainer', 'trainer@up.edu', NULL, NULL, NULL, '2026-04-09 17:07:05', 4),
(6, NULL, 'Hassin', 'trainer', 'hassin_trainer@gmail.com', NULL, NULL, NULL, '2026-04-09 17:16:30', 4),
(7, NULL, 'Principal', 'principal', 'malawi_principal@up.edu', NULL, NULL, NULL, '2026-04-09 17:18:07', 4);

-- --------------------------------------------------------

--
-- Table structure for table `quiz_submissions`
--

CREATE TABLE `quiz_submissions` (
  `id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `answer_text` text DEFAULT NULL,
  `file_url` text DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `status` enum('submitted','approved','rejected') DEFAULT 'submitted',
  `grade` varchar(50) DEFAULT '',
  `feedback` text DEFAULT NULL,
  `reviewed_by_email` varchar(255) DEFAULT '',
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `attempt_number` int(11) NOT NULL DEFAULT 1,
  `is_latest` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `quiz_submissions`
--

INSERT INTO `quiz_submissions` (`id`, `module_id`, `course_id`, `user_email`, `answer_text`, `file_url`, `file_type`, `status`, `grade`, `feedback`, `reviewed_by_email`, `reviewed_at`, `created_at`, `updated_at`, `attempt_number`, `is_latest`) VALUES
(1, 24, 17, 'educator@up.edu', 'submitted quiz', 'http://cs341s26mwed.campus.up.edu:3000/uploads/1776214453292-851005182-Computer-Science-Major-Field-Compet.txt', 'text/plain', 'approved', '85', 'Nice Job', 'malawi@up.edu', '2026-04-14 18:45:27', '2026-04-14 17:54:13', '2026-04-14 18:45:27', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `created_at`) VALUES
(6, 'malawi@up.edu', '$2b$10$O.Rbi1AvRY7.3WH36qYAWulj7jXkgr5i.J8rjIBDzNCyRjFhZ1vWG', '2026-04-08 04:06:06'),
(7, 'educator@up.edu', '$2b$10$/i3SlrJ1CxARw.tfNDsCROT8GH6reper8KSYqwbm8.NnCYII721l2', '2026-04-09 17:06:09'),
(8, 'principal@up.edu', '$2b$10$Si.KPJnI8ktAdtRhm4edp.iqmGY35lAj.lvzVkKNUaxVpIPEMCkQ6', '2026-04-09 17:06:44'),
(9, 'trainer@up.edu', '$2b$10$I6xdYQ.qVdKz7rKU8vV9bO0vlr0FYrfRhZ.ISc8L5Po0q71YKT/s6', '2026-04-09 17:07:05'),
(10, 'hassin_trainer@gmail.com', '$2b$10$opz6aNSN9K2.UTkT/UJBmuBPby9GAQ6G4lUvMCufZDl8WD5YGBNPq', '2026-04-09 17:16:30'),
(11, 'malawi_principal@up.edu', '$2b$10$9XVul7LUokkX0YjwxaUskOEFZrBg8vk3jP/Q2j2CJg1xZ2X/iAFAS', '2026-04-09 17:18:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `course_modules`
--
ALTER TABLE `course_modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `discussions`
--
ALTER TABLE `discussions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `discussion_replies`
--
ALTER TABLE `discussion_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_discussion_reply_discussion` (`discussion_id`);

--
-- Indexes for table `educator_course_assignments`
--
ALTER TABLE `educator_course_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_assignment_unique` (`educator_email`,`course_id`),
  ADD KEY `fk_assignment_course` (`course_id`),
  ADD KEY `fk_assignment_organization` (`organization_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_recipient` (`recipient_email`),
  ADD KEY `idx_notifications_recipient_read` (`recipient_email`,`is_read`),
  ADD KEY `fk_notifications_actor` (`actor_email`);

--
-- Indexes for table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `profile`
--
ALTER TABLE `profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_profile_organization` (`organization_id`);

--
-- Indexes for table `quiz_submissions`
--
ALTER TABLE `quiz_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `module_id` (`module_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `course_modules`
--
ALTER TABLE `course_modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `discussions`
--
ALTER TABLE `discussions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `discussion_replies`
--
ALTER TABLE `discussion_replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `educator_course_assignments`
--
ALTER TABLE `educator_course_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `profile`
--
ALTER TABLE `profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `quiz_submissions`
--
ALTER TABLE `quiz_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `course_modules`
--
ALTER TABLE `course_modules`
  ADD CONSTRAINT `course_modules_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `discussion_replies`
--
ALTER TABLE `discussion_replies`
  ADD CONSTRAINT `fk_discussion_reply_discussion` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `educator_course_assignments`
--
ALTER TABLE `educator_course_assignments`
  ADD CONSTRAINT `fk_assignment_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_assignment_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_actor` FOREIGN KEY (`actor_email`) REFERENCES `users` (`email`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notifications_recipient` FOREIGN KEY (`recipient_email`) REFERENCES `users` (`email`) ON DELETE CASCADE;

--
-- Constraints for table `profile`
--
ALTER TABLE `profile`
  ADD CONSTRAINT `fk_profile_organization` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `quiz_submissions`
--
ALTER TABLE `quiz_submissions`
  ADD CONSTRAINT `quiz_submissions_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `course_modules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_submissions_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
