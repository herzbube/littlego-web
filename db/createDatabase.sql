-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 30, 2018 at 01:03 PM
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
-- Table structure for table `game`
--

CREATE TABLE `game` (
  `gameID` bigint(20) UNSIGNED NOT NULL,
  `createTime` bigint(20) NOT NULL,
  `boardSize` tinyint(4) NOT NULL,
  `handicap` tinyint(4) NOT NULL,
  `komi` float NOT NULL,
  `koRule` tinyint(4) NOT NULL,
  `scoringSystem` tinyint(4) NOT NULL,
  `state` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `gamemove`
--

CREATE TABLE `gamemove` (
  `gameMoveID` bigint(20) UNSIGNED NOT NULL,
  `createTime` bigint(20) NOT NULL,
  `gameID` bigint(20) UNSIGNED NOT NULL,
  `moveType` tinyint(4) NOT NULL,
  `moveColor` tinyint(4) NOT NULL,
  `vertexX` tinyint(4) NOT NULL,
  `vertexY` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  `userID` bigint(20) UNSIGNED NOT NULL,
  `state` tinyint(4) NOT NULL,
  `gameID` bigint(20) UNSIGNED DEFAULT NULL
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
-- Table structure for table `gameresult`
--

CREATE TABLE `gameresult` (
  `gameResultID` bigint(20) UNSIGNED NOT NULL,
  `createTime` bigint(20) NOT NULL,
  `gameID` bigint(20) UNSIGNED NOT NULL,
  `resultType` tinyint(4) NOT NULL,
  `winningStoneColor` tinyint(4) NOT NULL,
  `winningPoints` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `gamesusersmapping`
--

CREATE TABLE `gamesusersmapping` (
  `gamesusersmappingID` bigint(20) UNSIGNED NOT NULL,
  `gameID` bigint(20) UNSIGNED NOT NULL,
  `userID` bigint(20) UNSIGNED NOT NULL,
  `stoneColor` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Stand-in structure for view `highscore`
-- (See below for the actual view)
--
CREATE TABLE `highscore` (
   `userID` bigint(20) unsigned
  ,`displayName` varchar(64)
  ,`totalGamesWon` bigint(21)
  ,`totalGamesLost` bigint(21)
  ,`mostRecentWin` bigint(20)
  ,`gamesWonAsBlack` bigint(21)
  ,`gamesWonAsWhite` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `score`
--

CREATE TABLE `score` (
  `scoreID` bigint(20) UNSIGNED NOT NULL,
  `gameID` bigint(20) UNSIGNED NOT NULL,
  `state` tinyint(4) NOT NULL,
  `lastModifiedByUserID` bigint(20) UNSIGNED NOT NULL,
  `lastModifiedTime` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `scoredetail`
--

CREATE TABLE `scoredetail` (
  `scoreDetailID` bigint(20) UNSIGNED NOT NULL,
  `scoreID` bigint(20) UNSIGNED NOT NULL,
  `vertexX` tinyint(4) NOT NULL,
  `vertexY` tinyint(4) NOT NULL,
  `stoneGroupState` tinyint(4) NOT NULL
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

-- --------------------------------------------------------

--
-- Structure for view `highscore`
--
DROP TABLE IF EXISTS `highscore`;

--
-- !!! Warning to whoever edits the following CREATE VIEW statement !!!
-- Make sure that the DEFINER clause always uses CURRENT_USER as its
-- value! If an explicit user name is present, and that user name
-- differs from the user who executes this database creation script,
-- the executing user must have the SUPER privilege.
--
CREATE ALGORITHM=UNDEFINED DEFINER=CURRENT_USER SQL SECURITY DEFINER VIEW `highscore`  AS  select `user`.`userID` AS `userID`,`user`.`displayName` AS `displayName`,coalesce(`totalgameswonquery`.`totalGamesWon`,0) AS `totalGamesWon`,coalesce(`totalgameslostquery`.`totalGamesLost`,0) AS `totalGamesLost`,coalesce((select `gameresult`.`createTime` AS `mostRecentWin` from (`gameresult` join `gamesusersmapping` on((`gameresult`.`gameID` = `gamesusersmapping`.`gameID`))) where (((`gameresult`.`resultType` = 0) or (`gameresult`.`resultType` = 1)) and (`gamesusersmapping`.`stoneColor` = `gameresult`.`winningStoneColor`) and (`gamesusersmapping`.`userID` = `user`.`userID`)) order by `gameresult`.`createTime` limit 1),-(1)) AS `mostRecentWin`,coalesce(`gameswonasblackquery`.`gamesWonAsBlack`,0) AS `gamesWonAsBlack`,coalesce(`gameswonaswhitequery`.`gamesWonAsWhite`,0) AS `gamesWonAsWhite` from ((((`user` left join (select `gamesusersmapping`.`userID` AS `userID`,count(`gameresult`.`gameResultID`) AS `totalGamesWon` from (`gameresult` join `gamesusersmapping` on((`gameresult`.`gameID` = `gamesusersmapping`.`gameID`))) where (((`gameresult`.`resultType` = 0) or (`gameresult`.`resultType` = 1)) and (`gamesusersmapping`.`stoneColor` = `gameresult`.`winningStoneColor`)) group by `gamesusersmapping`.`userID`) `totalgameswonquery` on((`user`.`userID` = `totalgameswonquery`.`userID`))) left join (select `gamesusersmapping`.`userID` AS `userID`,count(`gameresult`.`gameResultID`) AS `totalGamesLost` from (`gameresult` join `gamesusersmapping` on((`gameresult`.`gameID` = `gamesusersmapping`.`gameID`))) where (((`gameresult`.`resultType` = 0) or (`gameresult`.`resultType` = 1)) and (`gamesusersmapping`.`stoneColor` <> `gameresult`.`winningStoneColor`)) group by `gamesusersmapping`.`userID`) `totalgameslostquery` on((`user`.`userID` = `totalgameslostquery`.`userID`))) left join (select `gamesusersmapping`.`userID` AS `userID`,count(`gameresult`.`gameResultID`) AS `gamesWonAsBlack` from (`gameresult` join `gamesusersmapping` on((`gameresult`.`gameID` = `gamesusersmapping`.`gameID`))) where (((`gameresult`.`resultType` = 0) or (`gameresult`.`resultType` = 1)) and (`gameresult`.`winningStoneColor` = 0) and (`gamesusersmapping`.`stoneColor` = `gameresult`.`winningStoneColor`)) group by `gamesusersmapping`.`userID`) `gameswonasblackquery` on((`user`.`userID` = `gameswonasblackquery`.`userID`))) left join (select `gamesusersmapping`.`userID` AS `userID`,count(`gameresult`.`gameResultID`) AS `gamesWonAsWhite` from (`gameresult` join `gamesusersmapping` on((`gameresult`.`gameID` = `gamesusersmapping`.`gameID`))) where (((`gameresult`.`resultType` = 0) or (`gameresult`.`resultType` = 1)) and (`gameresult`.`winningStoneColor` = 1) and (`gamesusersmapping`.`stoneColor` = `gameresult`.`winningStoneColor`)) group by `gamesusersmapping`.`userID`) `gameswonaswhitequery` on((`user`.`userID` = `gameswonaswhitequery`.`userID`))) order by `totalGamesWon` desc,`totalGamesLost`,`mostRecentWin` desc,`user`.`displayName` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `game`
--
ALTER TABLE `game`
  ADD PRIMARY KEY (`gameID`),
  ADD KEY `createTime` (`createTime`);

--
-- Indexes for table `gamemove`
--
ALTER TABLE `gamemove`
  ADD PRIMARY KEY (`gameMoveID`),
  ADD KEY `gamemove_gameID` (`gameID`),
  ADD KEY `createTime` (`createTime`);

--
-- Indexes for table `gamerequest`
--
ALTER TABLE `gamerequest`
  ADD PRIMARY KEY (`gameRequestID`),
  ADD KEY `gamerequest_userID` (`userID`),
  ADD KEY `createTime` (`createTime`),
  ADD KEY `gamerequest_gameID` (`gameID`);

--
-- Indexes for table `gamerequestpairing`
--
ALTER TABLE `gamerequestpairing`
  ADD PRIMARY KEY (`gameRequestPairingID`),
  ADD KEY `gamerequestpairing_blackPlayerGameRequestID` (`blackPlayerGameRequestID`),
  ADD KEY `gamerequestpairing_whitePlayerGameRequestID` (`whitePlayerGameRequestID`),
  ADD KEY `createTime` (`createTime`);

--
-- Indexes for table `gameresult`
--
ALTER TABLE `gameresult`
  ADD PRIMARY KEY (`gameResultID`),
  ADD UNIQUE KEY `gameresult_gameID` (`gameID`),
  ADD KEY `createTime` (`createTime`);

--
-- Indexes for table `gamesusersmapping`
--
ALTER TABLE `gamesusersmapping`
  ADD PRIMARY KEY (`gamesusersmappingID`),
  ADD UNIQUE KEY `gameID_userID` (`gameID`,`userID`) USING BTREE,
  ADD UNIQUE KEY `gameID_stoneColor` (`gameID`,`stoneColor`) USING BTREE,
  ADD KEY `gamesusersmapping_userID` (`userID`);

--
-- Indexes for table `score`
--
ALTER TABLE `score`
  ADD PRIMARY KEY (`scoreID`),
  ADD KEY `score_gameID` (`gameID`),
  ADD KEY `score_userID` (`lastModifiedByUserID`),
  ADD KEY `lastModifiedTime` (`lastModifiedTime`);

--
-- Indexes for table `scoredetail`
--
ALTER TABLE `scoredetail`
  ADD PRIMARY KEY (`scoreDetailID`),
  ADD UNIQUE KEY `scoredetail_uniquestonegroup` (`scoreID`,`vertexX`,`vertexY`);

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
-- AUTO_INCREMENT for table `game`
--
ALTER TABLE `game`
  MODIFY `gameID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gamemove`
--
ALTER TABLE `gamemove`
  MODIFY `gameMoveID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT for table `gameresult`
--
ALTER TABLE `gameresult`
  MODIFY `gameResultID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gamesusersmapping`
--
ALTER TABLE `gamesusersmapping`
  MODIFY `gamesusersmappingID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `score`
--
ALTER TABLE `score`
  MODIFY `scoreID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `scoredetail`
--
ALTER TABLE `scoredetail`
  MODIFY `scoreDetailID` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `gamemove`
--
ALTER TABLE `gamemove`
  ADD CONSTRAINT `gamemove_gameID` FOREIGN KEY (`gameID`) REFERENCES `game` (`gameID`);

--
-- Constraints for table `gamerequest`
--
ALTER TABLE `gamerequest`
  ADD CONSTRAINT `gamerequest_gameID` FOREIGN KEY (`gameID`) REFERENCES `game` (`gameID`),
  ADD CONSTRAINT `gamerequest_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`);

--
-- Constraints for table `gamerequestpairing`
--
ALTER TABLE `gamerequestpairing`
  ADD CONSTRAINT `gamerequestpairing_blackPlayerGameRequestID` FOREIGN KEY (`blackPlayerGameRequestID`) REFERENCES `gamerequest` (`gameRequestID`),
  ADD CONSTRAINT `gamerequestpairing_whitePlayerGameRequestID` FOREIGN KEY (`whitePlayerGameRequestID`) REFERENCES `gamerequest` (`gameRequestID`);

--
-- Constraints for table `gameresult`
--
ALTER TABLE `gameresult`
  ADD CONSTRAINT `gameresult_gameID` FOREIGN KEY (`gameID`) REFERENCES `game` (`gameID`);

--
-- Constraints for table `gamesusersmapping`
--
ALTER TABLE `gamesusersmapping`
  ADD CONSTRAINT `gamesusersmapping_gameID` FOREIGN KEY (`gameID`) REFERENCES `game` (`gameID`),
  ADD CONSTRAINT `gamesusersmapping_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`);

--
-- Constraints for table `score`
--
ALTER TABLE `score`
  ADD CONSTRAINT `score_gameID` FOREIGN KEY (`gameID`) REFERENCES `game` (`gameID`),
  ADD CONSTRAINT `score_userID` FOREIGN KEY (`lastModifiedByUserID`) REFERENCES `user` (`userID`);

--
-- Constraints for table `scoredetail`
--
ALTER TABLE `scoredetail`
  ADD CONSTRAINT `scoredetail_scoreID` FOREIGN KEY (`scoreID`) REFERENCES `score` (`scoreID`);

--
-- Constraints for table `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `session_userID` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`);
COMMIT;
