<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The GameMove class is a simple data container that represents a
    // single row in the database table "gamemove".
    class GameMove
    {
        private $gameMoveID = GAMEMOVE_GAMEMOVEID_DEFAULT;
        private $createTime = GAMEMOVE_CREATETIME_DEFAULT;
        private $gameID = GAMEMOVE_GAMEID_DEFAULT;
        private $moveType = GAMEMOVE_MOVETYPE_DEFAULT;
        private $moveColor = GAMEMOVE_MOVECOLOR_DEFAULT;
        private $vertexX = GAMEMOVE_VERTEXX_DEFAULT;
        private $vertexY = GAMEMOVE_VERTEXY_DEFAULT;

        public function __construct(
            int $gameMoveID,
            int $createTime,
            int $gameID,
            int $moveType,
            int $moveColor,
            int $vertexX,
            int $vertexY)
        {
            $this->gameMoveID = $gameMoveID;
            $this->createTime = $createTime;
            $this->gameID = $gameID;
            $this->moveType = $moveType;
            $this->moveColor = $moveColor;
            $this->vertexX = $vertexX;
            $this->vertexY = $vertexY;
        }

        public function getGameMoveID(): int
        {
            return $this->gameMoveID;
        }

        public function setGameMoveID(int $gameMoveID): void
        {
            $this->gameMoveID = $gameMoveID;
        }

        public function getCreateTime(): int
        {
            return $this->createTime;
        }

        public function setCreateTime(int $createTime): void
        {
            $this->createTime = $createTime;
        }

        public function getGameID(): int
        {
            return $this->gameID;
        }

        public function setGameID(int $gameID): void
        {
            $this->gameID = $gameID;
        }

        public function getMoveType(): int
        {
            return $this->moveType;
        }

        public function setMoveType(int $moveType): void
        {
            $this->moveType = $moveType;
        }

        public function getMoveColor(): int
        {
            return $this->moveColor;
        }

        public function setMoveColor(int $moveColor): void
        {
            $this->moveColor = $moveColor;
        }

        public function getVertexX(): int
        {
            return $this->vertexX;
        }

        public function setVertexX(int $vertexX): void
        {
            $this->vertexX = $vertexX;
        }

        public function getVertexY(): int
        {
            return $this->vertexY;
        }

        public function setVertexY(int $vertexY): void
        {
            $this->vertexY = $vertexY;
        }

        public function toJsonObject(): array
        {
            return array(
                WEBSOCKET_MESSAGEDATA_KEY_GAMEMOVEID => $this->gameMoveID,
                WEBSOCKET_MESSAGEDATA_KEY_CREATETIME => $this->createTime,
                WEBSOCKET_MESSAGEDATA_KEY_GAMEID => $this->gameID,
                WEBSOCKET_MESSAGEDATA_KEY_MOVETYPE => $this->moveType,
                WEBSOCKET_MESSAGEDATA_KEY_MOVECOLOR => $this->moveColor,
                WEBSOCKET_MESSAGEDATA_KEY_VERTEXX => $this->vertexX,
                WEBSOCKET_MESSAGEDATA_KEY_VERTEXY => $this->vertexY
            );
        }
    }
}
