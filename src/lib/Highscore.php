<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The Highscore class is a simple data container that represents a
    // single row in the database view "highscore".
    class Highscore
    {
        private $userID = HIGHSCORE_USERID_DEFAULT;
        private $displayName = HIGHSCORE_DISPLAYNAME_DEFAULT;
        private $totalGamesWon = HIGHSCORE_TOTALGAMESWON_DEFAULT;
        private $totalGamesLost = HIGHSCORE_TOTALGAMESLOST_DEFAULT;
        private $mostRecentWin = HIGHSCORE_MOSTRECENTWIN_DEFAULT;
        private $gamesWonAsBlack = HIGHSCORE_GAMESWONASBLACK_DEFAULT;
        private $gamesWonAsWhite = HIGHSCORE_GAMESWONASWHITE_DEFAULT;

        public function __construct(
            int $userID,
            string $displayName,
            int $totalGamesWon,
            int $totalGamesLost,
            int $mostRecentWin,
            int $gamesWonAsBlack,
            int $gamesWonAsWhite)
        {
            $this->userID = $userID;
            $this->displayName = $displayName;
            $this->totalGamesWon = $totalGamesWon;
            $this->totalGamesLost = $totalGamesLost;
            $this->mostRecentWin = $mostRecentWin;
            $this->gamesWonAsBlack = $gamesWonAsBlack;
            $this->gamesWonAsWhite = $gamesWonAsWhite;
        }

        public function getUserID(): int
        {
            return $this->userID;
        }

        public function setUserID(int $userID): void
        {
            $this->userID = $userID;
        }

        public function getDisplayName(): string
        {
            return $this->displayName;
        }

        public function setDisplayName(string $displayName): void
        {
            $this->displayName = $displayName;
        }

        public function getTotalGamesWon(): int
        {
            return $this->totalGamesWon;
        }

        public function setTotalGamesWon(int $totalGamesWon): void
        {
            $this->totalGamesWon = $totalGamesWon;
        }

        public function getTotalGamesLost(): int
        {
            return $this->totalGamesLost;
        }

        public function setTotalGamesLost(int $totalGamesLost): void
        {
            $this->totalGamesLost = $totalGamesLost;
        }

        public function getMostRecentWin(): int
        {
            return $this->mostRecentWin;
        }

        public function setMostRecentWin(int $mostRecentWin): void
        {
            $this->mostRecentWin = $mostRecentWin;
        }

        public function getGamesWonAsBlack(): int
        {
            return $this->gamesWonAsBlack;
        }

        public function setGamesWonAsBlack(int $gamesWonAsBlack): void
        {
            $this->gamesWonAsBlack = $gamesWonAsBlack;
        }

        public function getGamesWonAsWhite(): int
        {
            return $this->gamesWonAsWhite;
        }

        public function setGamesWonAsWhite(int $gamesWonAsWhite): void
        {
            $this->gamesWonAsWhite = $gamesWonAsWhite;
        }

        public function toJsonObject(): array
        {
            return array(
                WEBSOCKET_MESSAGEDATA_KEY_USERID => $this->userID,
                WEBSOCKET_MESSAGEDATA_KEY_DISPLAYNAME => $this->displayName,
                WEBSOCKET_MESSAGEDATA_KEY_TOTALGAMESWON => $this->totalGamesWon,
                WEBSOCKET_MESSAGEDATA_KEY_TOTALGAMESLOST => $this->totalGamesLost,
                WEBSOCKET_MESSAGEDATA_KEY_MOSTRECENTWIN => $this->mostRecentWin,
                WEBSOCKET_MESSAGEDATA_KEY_GAMESWONASBLACK => $this->gamesWonAsBlack,
                WEBSOCKET_MESSAGEDATA_KEY_GAMESWONASWHITE => $this->gamesWonAsWhite
            );
        }
    }
}
