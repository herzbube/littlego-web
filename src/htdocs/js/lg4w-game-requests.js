// ----------------------------------------------------------------------
// This file contains the controller that manages the "Game requests" tab.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wGameRequestsController", ["$scope", "$location", ANGULARNAME_SERVICE_WEBSOCKET, function($scope, $location, webSocketService) {

    $scope.placeHolderMessage = "Retrieving data ...";
    $scope.placeHolderMessageIsErrorMessage = false;
    $scope.gameRequests = [];

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
        // TODO: Don't use jQuery
        $("#" + ID_MODAL_NOT_YET_IMPLEMENTED).modal()
    };

    $scope.confirm = function(gameRequest) {
        // TODO: Don't use jQuery
        $("#" + ID_MODAL_NOT_YET_IMPLEMENTED).modal()
    };

    if (webSocketService.isReady())
        webSocketService.getGameRequests();
    else
        webSocketService.addServiceIsReadyListener(handleWebSocketServiceIsReady);

    function handleWebSocketServiceIsReady() {
        webSocketService.getGameRequests();
    }

    $scope.$on('$destroy', function() {
        webSocketService.removeServiceIsReadyListener(handleWebSocketServiceIsReady);
        webSocketService.removeGetGameRequestsListener(handleGetGameRequests);
    })
}]);
