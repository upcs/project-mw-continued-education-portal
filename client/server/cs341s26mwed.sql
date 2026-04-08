-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 07, 2026 at 04:25 PM
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
  `file_type` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `instructor`, `lessons`, `quizzes`, `progress`, `thumbnail`, `description`, `file_url`, `file_type`) VALUES
(1, 'Software Engineering', 'Hassinullah Niazy', 10, 2, 60, 'https://via.placeholder.com/300x180?text=Software+Engineering', 'Learn software engineering principles, design, testing, and development workflows.', NULL, NULL),
(2, 'React Development', 'John Doe', 12, 3, 35, 'https://via.placeholder.com/300x180?text=React+Development', 'Build modern React applications using components, hooks, and routing.', NULL, NULL),
(3, 'adsf', 'fadsf', 2, 1, 10, 'http://localhost:5000/uploads/1775106017025-72889979-Lab-7.pdf', 'asdf', '', ''),
(4, 'AAAA', 'aaaa', 0, 0, 0, 'http://localhost:5000/uploads/1775106064845-612600005-Lab-7.pdf', 'aaaa', '', ''),
(5, 'Lab 7', 'Dr. Cenek', 1, 1, 0, '', 'This is lab for CyberSecurity.', 'http://localhost:5000/uploads/1775106773306-593061817-Lab-7.pdf', 'application/pdf'),
(6, 'dsaf', 'fasdf', 0, 0, 0, 'http://localhost:5000/uploads/1775107329067-361453917-COURSES---CATALOG.png', 'fasdf', '', ''),
(7, 'adsf', 'fdsaf', 0, 0, 0, 'http://localhost:5000/uploads/1775107373608-702782741-Lab-7.pdf', 'fasdfdsaf', '', ''),
(8, 'my course', 'me', 0, 0, 0, 'http://localhost:5000/uploads/1775108409292-461821538-My-image.jpeg', 'mine', 'http://localhost:5000/uploads/1775108409304-504154823-Lab-7.pdf', 'application/pdf'),
(9, 'Course 1', 'Cenek', 1, 0, 0, 'http://localhost:5000/uploads/1775147654464-691628436-default-avatar.png', 'this is a good course', 'http://localhost:5000/uploads/1775147654487-835557891-Lab-7.pdf', 'application/pdf'),
(10, 'name', 'cenek', 1, 0, 0, 'http://localhost:5000/uploads/1775152999993-24590616-png-transparent-default-avatar.png', 'this a new course', 'http://localhost:5000/uploads/1775152999995-505168486-Lab-7.pdf', 'application/pdf');

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
  `position` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `course_modules`
--

INSERT INTO `course_modules` (`id`, `course_id`, `title`, `type`, `content`, `file_url`, `file_type`, `position`) VALUES
(1, 1, 'Introduction to Software Engineering', 'lesson', NULL, NULL, NULL, 0),
(2, 1, 'Software Development Life Cycle', 'lesson', NULL, NULL, NULL, 0),
(3, 1, 'Testing and Debugging', 'lesson', NULL, NULL, NULL, 0),
(4, 2, 'React Basics', 'lesson', NULL, NULL, NULL, 0),
(5, 2, 'State and Props', 'lesson', NULL, NULL, NULL, 0),
(6, 2, 'React Router', 'lesson', NULL, NULL, NULL, 0),
(7, 5, 'Lab 8', 'lesson', 'safdsa', 'http://localhost:5000/uploads/1775113268259-998163051-Lab8---Implementing-Security-Monitoring-and-Logging-(4e)---Hassinullah-Niazy.pdf', 'application/pdf', 1),
(8, 5, 'lab 9', 'quiz', 'asdf', 'http://localhost:5000/uploads/1775113302962-50737443-Lab3---Performing-Packet-Capture-and-Traffic-Analysis-(4e)---Hassinullah-Niazy.pdf', 'application/pdf', 2),
(9, 5, 'sdaf', 'quiz', 'sdafas', 'http://localhost:5000/uploads/1775113321758-729601060-Lab1---Exploring-the-Seven-Domains-of-a-Typical-IT-Infrastructure-(4e)---Hassinullah-Niazy.pdf', 'application/pdf', 3),
(10, 8, 'dsaf', 'lesson', 'dasf', 'http://localhost:5000/uploads/1775113380902-297332642-Lab6---Assessing-Common-Attack-Vectors-(4e)---Hassinullah-Niazy.pdf', 'application/pdf', 1),
(11, 8, 'baby', 'quiz', 'aj;ladsfj', 'http://localhost:5000/uploads/1775113650814-232038475-LexicalAnalysis.pdf', 'application/pdf', 2),
(12, 9, 'Lesson 1.1', 'lesson', 'this is new module', 'http://localhost:5000/uploads/1775147725290-944229672-UNSC-State-Behavior.pdf', 'application/pdf', 1),
(13, 9, 'Quzi 1', 'quiz', 'quiz ', 'http://localhost:5000/uploads/1775147785855-370373068-Lab-7.pdf', 'application/pdf', 2),
(14, 10, 'lesson 2', 'lesson', 'sadkfl;jdsa', 'http://localhost:5000/uploads/1775153043165-31944342-Lab-7.pdf', 'application/pdf', 1),
(15, 10, 'quiz', 'quiz', 'quiz', 'http://localhost:5000/uploads/1775153069813-410504922-Lab-7.pdf', 'application/pdf', 2);

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `profile`
--

INSERT INTO `profile` (`id`, `photo`, `fullname`, `role`, `email`, `whatsapp`, `organization`, `specialization`, `created_at`) VALUES
(1, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43b?auto=format&fit=crop&w=500&q=80', 'admin', 'Instructor', 'Admin@up.edu', '503-XXX-XXXX', 'University of Portland', 'Computer Science', '2026-03-28 02:36:08');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_submissions`
--
CREATE TABLE `quiz_submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `attempt_number` int NOT NULL DEFAULT 1,
  `is_latest` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_quiz_submissions_module_id` (`module_id`),
  KEY `idx_quiz_submissions_course_id` (`course_id`),
  KEY `idx_quiz_submissions_user_email` (`user_email`),
  KEY `idx_quiz_submissions_latest` (`is_latest`),
  KEY `idx_quiz_submissions_module_user_attempt` (`module_id`, `user_email`, `attempt_number`),
  CONSTRAINT `fk_quiz_submissions_module`
    FOREIGN KEY (`module_id`) REFERENCES `course_modules`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quiz_submissions_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
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
(3, 'hassin@up.edu', '$2b$10$QWMRL08hYcykA3Jjv0qCU.yqhtN23qFv7AEs5znV3Nuu8zV.rJF96', '2026-04-02 04:15:42'),
(5, 'wow@up.edu', '$2b$10$e.zARq2L/ZAj.AWz9Oocmu.zb5zpGElKOdSWBan8ttxkDYYvKeowa', '2026-04-02 16:30:51');

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
-- Indexes for table `profile`
--
ALTER TABLE `profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `course_modules`
--
ALTER TABLE `course_modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `profile`
--
ALTER TABLE `profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `quiz_submissions`
--
ALTER TABLE `quiz_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `course_modules`
--
ALTER TABLE `course_modules`
  ADD CONSTRAINT `course_modules_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

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
