<?php
declare(strict_types = 1);

namespace LittleGoWeb
{
    require_once(dirname(__FILE__) . "/constants.php");

    // The MatchMaker class finds matching game requests and performs
    // pairing/unpairing of matching game requests.
    //
    // The match-making process works as follows:
    // - The game request queue is searched for candidates from the
    //   beginning so that the oldest game requests that are the longest
    //   in the queue are chosen first. [PAR-057]
    // - Game requests from the same user are not eligible.
    // - Game requests that are already paired, and that are waiting for
    //   user feedback, are not eligible.
    // - Game requests that in the past have already been paired with
    //   the game request for which we're trying to find a match, but
    //   one or both users have rejected that pairing, are not eligible.
    //   [PAR-069]
    // - The first eligible game request that contains compatible
    //   game parameters is paired.
    // - Game parameters are deemed to be compatible as follows:
    //   - A game parameter for which both game requests specify a
    //     preference is compatible if both game requests specify the
    //     same preference.
    //   - A game parameter for which only one game request specifies a
    //     preference is always compatible. The actual game parameter
    //     value is taken from the game request that specifies a
    //     preference. [PAR-053]
    //   - A game parameter for which none of the two game requests
    //     specifies a preference is always compatible. The actual game
    //     parameter value is determined according to the following list.
    //     [PAR-054]
    //     - Board size = 19x19
    //     - Handicap = None
    //     - Komi = 7.5 for area scoring with no handicap,
    //              6.5 for territory scoring with no handicap
    //              0.5 for handicap
    //     - Ko rule = Simple
    //     - Scoring system = Area scoring
    //     - Preferred stone color = Random
    //
    // Note: The game request queue is formed by sorting the rows in the
    // "gamerequest" database table by create time in ascending order.
    class MatchMaker
    {
        private $dbAccess = null;

        public function __construct(DbAccess $dbAccess)
        {
            $this->dbAccess = $dbAccess;
        }

        // Attempts to find a game request in the database that matches the
        // requested game parameters in the specified game request. If a match
        // exists the two game requests are paired (and become unavailable
        // for further match-making attempts until the pairing is rejected).
        //
        // The return value is a GameRequestPairing object that describes the
        // game that will result if the two users who submitted the game
        // requests agree to play against each other.
        //
        // Returns null if no match can be found.
        public function tryFindMatchingGameRequest(GameRequest $gameRequestToMatch): ?GameRequestPairing
        {
            $gameRequestIDToMatch = $gameRequestToMatch->getGameRequestID();

            // We get the game requests in the correct order (oldest first)
            $gameRequests = $this->dbAccess->findGameRequests();
            $gameRequestPairings = $this->dbAccess->findGameRequestPairings();

            // Perform some pre-processing to make the candidate loop
            // more efficient
            $gameRequestsWithActivePairings = [];
            $gameRequestsThatWereRejected = [];
            foreach ($gameRequestPairings as $gameRequestPairing)
            {
                if ($gameRequestPairing->isRejected())
                {
                    if ($gameRequestPairing->getBlackPlayerGameRequestID() === $gameRequestIDToMatch)
                        $gameRequestsThatWereRejected[$gameRequestPairing->getWhitePlayerGameRequestID()] = 1;
                    else if ($gameRequestPairing->getWhitePlayerGameRequestID() === $gameRequestIDToMatch)
                        $gameRequestsThatWereRejected[$gameRequestPairing->getBlackPlayerGameRequestID()] = 1;
                }
                else
                {
                    $gameRequestsWithActivePairings[$gameRequestPairing->getBlackPlayerGameRequestID()] = 1;
                    $gameRequestsWithActivePairings[$gameRequestPairing->getWhitePlayerGameRequestID()] = 1;
                }
            }

            foreach ($gameRequests as $gameRequestCandidate)
            {
                if ($gameRequestCandidate->getGameRequestID() === $gameRequestIDToMatch)
                    continue;  // not eligible, it's the same game request that we are trying to pair

                if ($gameRequestCandidate->getUserID() === $gameRequestToMatch->getUserID())
                    continue;  // not eligible, the candidate is from the same user

                if (array_key_exists($gameRequestCandidate->getGameRequestID(), $gameRequestsWithActivePairings))
                    continue;  // not eligible, the candidate is already paired

                if (array_key_exists($gameRequestCandidate->getGameRequestID(), $gameRequestsThatWereRejected))
                    continue;  // not eligible, the candidate was already paired but the pairing was rejected

                // The candidate is eligible. Now let's look at the requested
                // game parameters.

                $boardSize = NEWGAME_BOARDSIZE_DEFAULT;
                $success = $this->determineBoardSize($gameRequestToMatch, $gameRequestCandidate, $boardSize);
                if (! $success)
                    continue;

                $handicap = NEWGAME_HANDICAP_DEFAULT;
                $success = $this->determineHandicap($gameRequestToMatch, $gameRequestCandidate, $handicap);
                if (! $success)
                    continue;

                $koRule = NEWGAME_KORULE_DEFAULT;
                $success = $this->determineKoRule($gameRequestToMatch, $gameRequestCandidate, $koRule);
                if (! $success)
                    continue;

                $scoringSystem = NEWGAME_SCORINGSYSTEM_DEFAULT;
                $success = $this->determineScoringSystem($gameRequestToMatch, $gameRequestCandidate, $scoringSystem);
                if (! $success)
                    continue;

                $komi = NEWGAME_KOMI_NOHANDICAP_AREASCORING_DEFAULT;
                $success = $this->determineKomi($gameRequestToMatch, $gameRequestCandidate, $handicap, $scoringSystem, $komi);
                if (! $success)
                    continue;

                $stoneColor = COLOR_NONE;
                $success = $this->determineStoneColor($gameRequestToMatch, $gameRequestCandidate, $stoneColor);
                if (! $success)
                    continue;
                if ($stoneColor === COLOR_BLACK)
                {
                    $blackPlayerGameRequestID = $gameRequestToMatch->getGameRequestID();
                    $blackPlayerUserID = $gameRequestToMatch->getUserID();

                    $whitePlayerGameRequestID = $gameRequestCandidate->getGameRequestID();
                    $whitePlayerUserID = $gameRequestCandidate->getUserID();
                }
                else
                {
                    $blackPlayerGameRequestID = $gameRequestCandidate->getGameRequestID();
                    $blackPlayerUserID = $gameRequestCandidate->getUserID();

                    $whitePlayerGameRequestID = $gameRequestToMatch->getGameRequestID();
                    $whitePlayerUserID = $gameRequestToMatch->getUserID();
                }

                // We have a match!

                $gameRequestPairingID = GAMEREQUESTPAIRING_GAMEREQUESTPAIRINGID_DEFAULT;
                $createTime = time();
                $rejected = GAMEREQUESTPAIRING_ISREJECTED_DEFAULT;

                $blackPlayerUser = $this->dbAccess->findUserByID($blackPlayerUserID);
                if ($blackPlayerUser === null)
                    throw new \Exception("User not for black player, user ID = " . $blackPlayerUserID);
                $whitePlayerUser = $this->dbAccess->findUserByID($whitePlayerUserID);
                if ($whitePlayerUser === null)
                    throw new \Exception("User not for white player, user ID = " . $whitePlayerUserID);

                $gameRequestPairing = new GameRequestPairing(
                    $gameRequestPairingID,
                    $createTime,
                    $blackPlayerGameRequestID,
                    $whitePlayerGameRequestID,
                    $boardSize,
                    $handicap,
                    $komi,
                    $koRule,
                    $scoringSystem,
                    $rejected);

                $gameRequestPairing->setBlackPlayer($blackPlayerUser);
                $gameRequestPairing->setWhitePlayer($whitePlayerUser);

                // TODO: Add transaction that spans all database operations
                $gameRequestPairingID = $this->dbAccess->insertGameRequestPairing($gameRequestPairing);
                if ($gameRequestPairingID === -1)
                    throw new \Exception("Failed to insert game request pairing");

                $gameRequestsToUpdate = [$gameRequestToMatch, $gameRequestCandidate];
                foreach ($gameRequestsToUpdate as $gameRequestToUpdate)
                {
                    $gameRequestToUpdate->setState(GAMEREQUEST_STATE_UNCONFIRMEDPAIRING);
                    $success = $this->dbAccess->updateGameRequest($gameRequestToUpdate);
                    if (! $success)
                        throw new \Exception("Failed to update game request " . $gameRequestToUpdate->getGameRequestID());
                }

                return $gameRequestPairing;
            }

            return null;
        }

        // Examines the two game requests whether they match on board size.
        //
        // Returns true if the game requests match and fills the out variable
        // with the actual board size to use for the new game.
        //
        // Returns false if the game requests do not match.
        private function determineBoardSize(
            GameRequest $gameRequestToMatch,
            GameRequest $gameRequestCandidate,
            int& $boardSize) : bool
        {
            if ($gameRequestToMatch->getRequestedBoardSize() === $gameRequestCandidate->getRequestedBoardSize())
            {
                if ($gameRequestToMatch->getRequestedBoardSize() === GAMEREQUEST_NOPREFERENCE)
                    $boardSize = NEWGAME_BOARDSIZE_DEFAULT;
                else
                    $boardSize = $gameRequestToMatch->getRequestedBoardSize();
            }
            else if ($gameRequestToMatch->getRequestedBoardSize() === GAMEREQUEST_NOPREFERENCE)
            {
                $boardSize = $gameRequestCandidate->getRequestedBoardSize();
            }
            else if ($gameRequestCandidate->getRequestedBoardSize() === GAMEREQUEST_NOPREFERENCE)
            {
                $boardSize = $gameRequestToMatch->getRequestedBoardSize();
            }
            else
            {
                return false;
            }

            return true;
        }

        // Examines the two game requests whether they match on handicap.
        //
        // Returns true if the game requests match and fills the out variable
        // with the actual handicap to use for the new game.
        //
        // Returns false if the game requests do not match.
        private function determineHandicap(
            GameRequest $gameRequestToMatch,
            GameRequest $gameRequestCandidate,
            int& $handicap) : bool
        {
            if ($gameRequestToMatch->getRequestedHandicap() === $gameRequestCandidate->getRequestedHandicap())
            {
                if ($gameRequestToMatch->getRequestedHandicap() === GAMEREQUEST_NOPREFERENCE)
                    $handicap = NEWGAME_HANDICAP_DEFAULT;
                else
                    $handicap = $gameRequestToMatch->getRequestedHandicap();
            }
            else if ($gameRequestToMatch->getRequestedHandicap() === GAMEREQUEST_NOPREFERENCE)
            {
                $handicap = $gameRequestCandidate->getRequestedHandicap();
            }
            else if ($gameRequestCandidate->getRequestedHandicap() === GAMEREQUEST_NOPREFERENCE)
            {
                $handicap = $gameRequestToMatch->getRequestedHandicap();
            }
            else
            {
                return false;
            }

            return true;
        }

        // Examines the two game requests whether they match on the Ko rule.
        //
        // Returns true if the game requests match and fills the out variable
        // with the actual Ko rule to use for the new game.
        //
        // Returns false if the game requests do not match.
        private function determineKoRule(
            GameRequest $gameRequestToMatch,
            GameRequest $gameRequestCandidate,
            int& $koRule) : bool
        {
            if ($gameRequestToMatch->getRequestedKoRule() === $gameRequestCandidate->getRequestedKoRule())
            {
                if ($gameRequestToMatch->getRequestedKoRule() === GAMEREQUEST_NOPREFERENCE)
                    $koRule = NEWGAME_KORULE_DEFAULT;
                else
                    $koRule = $gameRequestToMatch->getRequestedKoRule();
            }
            else if ($gameRequestToMatch->getRequestedKoRule() === GAMEREQUEST_NOPREFERENCE)
            {
                $koRule = $gameRequestCandidate->getRequestedKoRule();
            }
            else if ($gameRequestCandidate->getRequestedKoRule() === GAMEREQUEST_NOPREFERENCE)
            {
                $koRule = $gameRequestToMatch->getRequestedKoRule();
            }
            else
            {
                return false;
            }

            return true;
        }

        // Examines the two game requests whether they match on the scoring
        // system.
        //
        // Returns true if the game requests match and fills the out variable
        // with the actual scoring system to use for the new game.
        //
        // Returns false if the game requests do not match.
        private function determineScoringSystem(
            GameRequest $gameRequestToMatch,
            GameRequest $gameRequestCandidate,
            int& $scoringSystem) : bool
        {
            if ($gameRequestToMatch->getRequestedScoringSystem() === $gameRequestCandidate->getRequestedScoringSystem())
            {
                if ($gameRequestToMatch->getRequestedScoringSystem() === GAMEREQUEST_NOPREFERENCE)
                    $scoringSystem = NEWGAME_SCORINGSYSTEM_DEFAULT;
                else
                    $scoringSystem = $gameRequestToMatch->getRequestedScoringSystem();
            }
            else if ($gameRequestToMatch->getRequestedScoringSystem() === GAMEREQUEST_NOPREFERENCE)
            {
                $scoringSystem = $gameRequestCandidate->getRequestedScoringSystem();
            }
            else if ($gameRequestCandidate->getRequestedScoringSystem() === GAMEREQUEST_NOPREFERENCE)
            {
                $scoringSystem = $gameRequestToMatch->getRequestedScoringSystem();
            }
            else
            {
                return false;
            }

            return true;
        }

        // Examines the two game requests whether they match on komi.
        //
        // Returns true if the game requests match and fills the out variable
        // with the actual komi to use for the new game.
        //
        // Returns false if the game requests do not match.
        private function determineKomi(
            GameRequest $gameRequestToMatch,
            GameRequest $gameRequestCandidate,
            int $handicap,
            int $scoringSystem,
            float& $komi) : bool
        {
            if ($gameRequestToMatch->getRequestedKomi() === $gameRequestCandidate->getRequestedKomi())
            {
                if ($gameRequestToMatch->getRequestedKomi() === GAMEREQUEST_NOPREFERENCE)
                {
                    if ($handicap === HANDICAP_NONE)
                    {
                        if ($scoringSystem === SCORINGSYSTEM_AREA_SCORING)
                            $komi = NEWGAME_KOMI_NOHANDICAP_AREASCORING_DEFAULT;
                        else
                            $komi = NEWGAME_KOMI_NOHANDICAP_TERRITORYSCORING_DEFAULT;
                    }
                    else
                    {
                        $komi = NEWGAME_KOMI_WITHHANDICAP_DEFAULT;
                    }
                }
                else
                {
                    $komi = $gameRequestToMatch->getRequestedKomi();
                }
            }
            else if ($gameRequestToMatch->getRequestedKomi() === GAMEREQUEST_NOPREFERENCE)
            {
                $komi = $gameRequestCandidate->getRequestedKomi();
            }
            else if ($gameRequestCandidate->getRequestedKomi() === GAMEREQUEST_NOPREFERENCE)
            {
                $komi = $gameRequestToMatch->getRequestedKomi();
            }
            else
            {
                return false;
            }

            return true;
        }

        // Examines the two game requests whether they match on preferred
        // stone color.
        //
        // Returns true if the game requests match and fills the out variable
        // with the actual stone color that the player who made
        // $gameRequestToMatch is to use for the new game.
        //
        // Returns false if the game requests do not match.
        private function determineStoneColor(
            GameRequest $gameRequestToMatch,
            GameRequest $gameRequestCandidate,
            int& $stoneColor) : bool
        {
            if ($gameRequestToMatch->getRequestedStoneColor() === $gameRequestCandidate->getRequestedStoneColor())
            {
                if ($gameRequestToMatch->getRequestedStoneColor() === GAMEREQUEST_NOPREFERENCE)
                {
                    if (rand(0, 1) === 1)
                        $stoneColor = COLOR_BLACK;
                    else
                        $stoneColor = COLOR_WHITE;
                }
                else
                {
                    return false;
                }
            }
            else if ($gameRequestToMatch->getRequestedStoneColor() === GAMEREQUEST_NOPREFERENCE)
            {
                if ($gameRequestCandidate->getRequestedStoneColor() === COLOR_BLACK)
                    $stoneColor = COLOR_WHITE;
                else
                    $stoneColor = COLOR_BLACK;
            }
            else if ($gameRequestCandidate->getRequestedStoneColor() === GAMEREQUEST_NOPREFERENCE)
            {
                $stoneColor = $gameRequestToMatch->getRequestedStoneColor();
            }
            else
            {
                $stoneColor = $gameRequestToMatch->getRequestedStoneColor();
            }

            return true;
        }
    }
}
