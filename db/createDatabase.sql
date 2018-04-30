-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 29, 2018 at 04:45 PM
-- Server version: 5.7.20
-- PHP Version: 7.1.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `littlego-web`
--
CREATE DATABASE IF NOT EXISTS `littlego-web` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `littlego-web`;

-- --------------------------------------------------------

--
-- Table structure for table `gamerequest`
--

CREATE TABLE `gamerequest` (
  `gameRequestID` bigint(20) UNSIGNED NOT NULL,
  `createTime` bigint(20) NOT NULL,
  `requestedBoardSize` tinyint(4) NOT NULL,
  `requestedStoneColor` tinyint(4) NOT NULL,
  `requestedHandicap` tinyint(4) NOT NULL,
  `requestedKomi` float NOT NULL,
  `requestedKoRule` tinyint(4) NOT NULL,
  `requestedScoringSystem` tinyint(4) NOT NULL,
  `userID` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `sessionID` bigint(20) UNSIGNED NOT NULL,
  `sessionKey` varchar(128) NOT NULL,
  `userID` bigint(20) UNSIGNED NOT NULL,
  `validUntil` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `userID` bigint(20) UNSIGNED NOT NULL,
  `emailAddress` varchar(1024) NOT NULL,
  `displayName` varchar(64) NOT NULL,
  `passwordHash` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `gamerequest`
--
ALTER TABLE `gamerequest`
  ADD PRIMARY KEY (`gameRequestID`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`sessionID`),
  ADD UNIQUE KEY `sessionKey` (`sessionKey`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `emailAddress` (`emailAddress`),
  ADD UNIQUE KEY `displayName` (`displayName`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `gamerequest`
--
ALTER TABLE `gamerequest`
  MODIFY `gameRequestID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `session`
--
ALTER TABLE `session`
  MODIFY `sessionID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `userID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `gamerequest`
--
ALTER TABLE `gamerequest`
  ADD CONSTRAINT `gamerequest_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`);

--
-- Constraints for table `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `session_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`);
COMMIT;
