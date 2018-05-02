-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 02, 2018 at 06:54 AM
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
-- Table structure for table `gamerequestpairing`
--

CREATE TABLE `gamerequestpairing` (
  `gameRequestPairingID` bigint(20) UNSIGNED NOT NULL,
  `createTime` bigint(20) NOT NULL,
  `blackPlayerGameRequestID` bigint(20) UNSIGNED NOT NULL,
  `whitePlayerGameRequestID` bigint(20) UNSIGNED NOT NULL,
  `boardSize` tinyint(4) NOT NULL,
  `handicap` tinyint(4) NOT NULL,
  `komi` float NOT NULL,
  `koRule` tinyint(4) NOT NULL,
  `scoringSystem` tinyint(4) NOT NULL,
  `isRejected` tinyint(1) NOT NULL
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
  ADD KEY `gamerequest_userID` (`userID`),
  ADD KEY `createTime` (`createTime`);

--
-- Indexes for table `gamerequestpairing`
--
ALTER TABLE `gamerequestpairing`
  ADD PRIMARY KEY (`gameRequestPairingID`),
  ADD KEY `gamerequestpairing_blackPlayerGameRequestID` (`blackPlayerGameRequestID`),
  ADD KEY `gamerequestpairing_whitePlayerGameRequestID` (`whitePlayerGameRequestID`),
  ADD KEY `createTime` (`createTime`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`sessionID`),
  ADD UNIQUE KEY `sessionKey` (`sessionKey`),
  ADD KEY `session_userID` (`userID`);

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
-- AUTO_INCREMENT for table `gamerequestpairing`
--
ALTER TABLE `gamerequestpairing`
  MODIFY `gameRequestPairingID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `gamerequestpairing`
--
ALTER TABLE `gamerequestpairing`
  ADD CONSTRAINT `gamerequestpairing_blackPlayerGameRequestID` FOREIGN KEY (`blackPlayerGameRequestID`) REFERENCES `gamerequest` (`gameRequestID`),
  ADD CONSTRAINT `gamerequestpairing_whitePlayerGameRequestID` FOREIGN KEY (`whitePlayerGameRequestID`) REFERENCES `gamerequest` (`gameRequestID`);

--
-- Constraints for table `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `session_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`);
COMMIT;
