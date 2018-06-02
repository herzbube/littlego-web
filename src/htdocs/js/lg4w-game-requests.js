// ----------------------------------------------------------------------
// This file contains the controller that manages the "Game requests" tab.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wGameRequestsController", ["$scope", "$rootScope", "$location", ANGULARNAME_SERVICE_WEBSOCKET, ANGULARNAME_SERVICE_ERRORHANDLING, function($scope, $rootScope, $location, webSocketService, errorHandlingService) {

    $scope.placeHolderMessage = "Waiting for server connection ...";
    $scope.placeHolderMessageIsErrorMessage = false;
    $scope.gameRequests = [];

    function getGameRequests()
    {
        $scope.placeHolderMessage = "Retrieving data ...";
        $scope.placeHolderMessageIsErrorMessage = false;
        $scope.gameRequests = [];

        webSocketService.getGameRequests();
    }

    webSocketService.addGetGameRequestsListener(handleGetGameRequests);
    function handleGetGameRequests(success, gameRequestsJsonObjects, errorMessage) {
        $scope.$apply(function() {
            if (success)
            {
                $scope.gameRequests = [];
                gameRequestsJsonObjects.forEach(function(gameRequestJsonObject) {
                    var gameRequest = new GameRequest(gameRequestJsonObject);
                    $scope.gameRequests.push(gameRequest);
                });

                $scope.placeHolderMessageIsErrorMessage = false;

                if ($scope.gameRequests.length === 0)
                    $scope.placeHolderMessage = "You have no game requests.";
                else
                    $scope.placeHolderMessage = "";
            }
            else
            {
                $scope.placeHolderMessage = "Data retrieval error: " + errorMessage;
                $scope.placeHolderMessageIsErrorMessage = true;
                $scope.gameRequests = [];
            }
        });
    }

    $scope.isPlaceHolderMessageShown = function() {
        return ($scope.gameRequests.length === 0);
    };

    $scope.isUnpaired = function(gameRequest) {
        return (gameRequest.state === GAMEREQUEST_STATE_UNPAIRED);
    };

    $scope.hasUnconfirmedPairing = function(gameRequest) {
        return (gameRequest.state === GAMEREQUEST_STATE_UNCONFIRMEDPAIRING);
    };

    $scope.cancel = function(gameRequest) {
        webSocketService.cancelGameRequest(gameRequest.gameRequestID);
    };

    webSocketService.addCancelGameRequestListener(handleCancelGameRequest);
    function handleCancelGameRequest(success, gameRequestsJsonObjects, errorMessage) {
        if (success)
        {
            // The server already included an updated list of game requests in
            // its reponse, so we just need to update the model
            handleGetGameRequests(true, gameRequestsJsonObjects, undefined);
        }
        else
        {
            errorHandlingService.showServerError(errorMessage);
        }
    }

    $scope.confirm = function(gameRequest) {
        webSocketService.getGameRequestPairing(gameRequest.gameRequestID);
    };

    webSocketService.addGetGameRequestPairingListener(handleGetGameRequestPairing);
    function handleGetGameRequestPairing(success, gameRequestPairing, errorMessage) {
        if (success)
        {
            $rootScope.$broadcast(ANGULARNAME_EVENT_SHOWCONFIRMGAMEREQUESTPAIRINGMODAL, gameRequestPairing);
        }
        else
        {
            errorHandlingService.showServerError(errorMessage);
        }
    }

    // If a new game request was submitted we need to update our list of
    // game requests >>> The new game request will be part of the list.
    webSocketService.addSubmitNewGameRequestListener(handleSubmitNewGameRequest);
    function handleSubmitNewGameRequest(success, gameRequestPairing, errorMessage) {
        if (success)
        {
            // The server did not include an updated list of game requests in
            // its reponse, so we need to fetch the data from the server
            $scope.$apply(function() {
                getGameRequests();
            });
        }
        else
        {
            // We ignore all errors. It's the responsibility of the actor
            // who requested the data to handle errors.
        }
    }

    // If a game request pairing was confirmed we need to update our list of
    // game requests >>> The game request involved in the pairing on our side
    // will disappear from the list.
    webSocketService.addConfirmGameRequestPairingListener(handleConfirmGameRequestPairing);
    function handleConfirmGameRequestPairing(success, gameRequestsJsonObjects, errorMessage) {
        if (success)
        {
            // The server already included an updated list of game requests in
            // its reponse, so we just need to update the model
            handleGetGameRequests(true, gameRequestsJsonObjects, undefined);
        }
        else
        {
            // We ignore all errors. It's the responsibility of the actor
            // who requested the data to handle errors.
        }
    }

    // This is triggered not as a response to this client requesting
    // data, instead it is triggered because the server notifies us
    // about a pairing that was found because some other client
    // submitted a game request.
    webSocketService.addGameRequestPairingFoundListener(handleGameRequestPairingFound);
    function handleGameRequestPairingFound(success, gameRequestsJsonObjects, errorMessage) {
        if (success)
        {
            // The server already included an updated list of game requests in
            // its reponse, so we just need to update the model
            handleGetGameRequests(true, gameRequestsJsonObjects, undefined);
        }
        else
        {
            // We ignore all errors. Because this client didn't request the
            // data the server shouldn't send us error messages.
        }
    }

    // TODO: Disable "New game request" button if web socket service is not ready
    if (webSocketService.isReady())
        getGameRequests();
    else
        webSocketService.addServiceIsReadyListener(handleWebSocketServiceIsReady);

    function handleWebSocketServiceIsReady() {
        $scope.$apply(function() {
            getGameRequests();
        });
    }

    $scope.$on("$destroy", function() {
        webSocketService.removeServiceIsReadyListener(handleWebSocketServiceIsReady);
        webSocketService.removeGetGameRequestsListener(handleGetGameRequests);
        webSocketService.removeCancelGameRequestListener(handleCancelGameRequest);
        webSocketService.removeGetGameRequestPairingListener(handleGetGameRequestPairing);
        webSocketService.removeSubmitNewGameRequestListener(handleSubmitNewGameRequest);
        webSocketService.removeConfirmGameRequestPairingListener(handleConfirmGameRequestPairing);
        webSocketService.removeGameRequestPairingFoundListener(handleGameRequestPairingFound);
    });
}]);
