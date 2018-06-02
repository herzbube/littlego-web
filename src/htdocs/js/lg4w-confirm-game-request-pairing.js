// ----------------------------------------------------------------------
// This file contains the controller that manages the
// "Confirm game request pairing" modal.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wConfirmGameRequestPairingController", ["$scope", "$rootScope", ANGULARNAME_SERVICE_WEBSOCKET, ANGULARNAME_SERVICE_SESSION, ANGULARNAME_SERVICE_ERRORHANDLING, function($scope, $rootScope, webSocketService, sessionService, errorHandlingService) {

    // Remember the unregister function so that we can use it on $destroy
    var unregisterShowConfirmGameRequestPairingModal = $rootScope.$on(ANGULARNAME_EVENT_SHOWCONFIRMGAMEREQUESTPAIRINGMODAL, function(event, gameRequestPairing) {
        $scope.$apply(function() {
            showConfirmGameRequestPairingModal(gameRequestPairing);
        });
    });

    var gameRequestID = GAMEREQUESTID_UNDEFINED;
    $scope.opponentDisplayName = "";
    $scope.stoneColor = "";
    $scope.boardSize = "";
    $scope.handicap = "";
    $scope.komi = "";
    $scope.koRule = "";
    $scope.scoringSystem = "";

    function showConfirmGameRequestPairingModal(gameRequestPairing) {
        if (gameRequestPairing.blackPlayer.userID === sessionService.getUserInfo().userID)
        {
            gameRequestID = gameRequestPairing.blackPlayerGameRequestID;
            $scope.opponentDisplayName = gameRequestPairing.whitePlayer.displayName;
            $scope.stoneColor = colorToString(COLOR_BLACK).toLowerCase();
        }
        else
        {
            gameRequestID = gameRequestPairing.whitePlayerGameRequestID;
            $scope.opponentDisplayName = gameRequestPairing.blackPlayer.displayName;
            $scope.stoneColor = colorToString(COLOR_WHITE).toLocaleLowerCase();
        }
        $scope.boardSize = boardSizeToString(gameRequestPairing.boardSize);
        $scope.handicap = handicapToString(gameRequestPairing.handicap);
        $scope.komi = komiToString(gameRequestPairing.komi);
        $scope.koRule = koRuleToString(gameRequestPairing.koRule);
        $scope.scoringSystem = scoringSystemToString(gameRequestPairing.scoringSystem);

        // TODO Don't use jQuery
        $("#" + ID_CONFIRM_GAME_REQUEST_PAIRING_MODAL).modal()
    }

    $scope.startGame = function() {
        webSocketService.confirmGameRequestPairing(gameRequestID);

        // TODO: Add "waiting for server response" modal
    };

    webSocketService.addConfirmGameRequestPairingListener(handleConfirmGameRequestPairing);
    function handleConfirmGameRequestPairing(success, gameRequestsJsonObjects, errorMessage) {

        // TODO Don't use jQuery
        $("#" + ID_CONFIRM_GAME_REQUEST_PAIRING_MODAL).modal("hide");

        if (success)
        {
            // We are not interested in the game requests, that data is for
            // someone else.
        }
        else
        {
            errorHandlingService.showServerError(errorMessage);
        }
    }

    $scope.$on("$destroy", function() {
        webSocketService.removeConfirmGameRequestPairingListener(handleConfirmGameRequestPairing);

        // If we had registered on our own $scope we wouldn't need to
        // unregister. But we registered on $rootScope.
        unregisterShowConfirmGameRequestPairingModal();
    });
}]);
