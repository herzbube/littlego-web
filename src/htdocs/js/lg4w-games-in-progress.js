// ----------------------------------------------------------------------
// This file contains the controller that manages the "Games in progress" tab.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wGamesInProgressController", ["$scope", "$rootScope", "$location", ANGULARNAME_SERVICE_WEBSOCKET, ANGULARNAME_SERVICE_SESSION, function($scope, $rootScope, $location, webSocketService, sessionService) {

    $scope.placeHolderMessage = "Waiting for server connection ...";
    $scope.placeHolderMessageIsErrorMessage = false;
    $scope.gamesInProgress = [];

    function getGamesInProgress()
    {
        $scope.placeHolderMessage = "Retrieving data ...";
        $scope.placeHolderMessageIsErrorMessage = false;
        $scope.gamesInProgress = [];

        webSocketService.getGamesInProgress();
    }

    webSocketService.addGetGamesInProgressListener(handleGetGamesInProgress);
    function handleGetGamesInProgress(success, gamesInProgressJsonObjects, errorMessage) {
        $scope.$apply(function() {
            if (success)
            {
                $scope.gamesInProgress = [];
                var userID = sessionService.getUserInfo().userID;
                gamesInProgressJsonObjects.forEach(function(gameInProgressJsonObject) {
                    var gameInProgress = new GameInProgress(gameInProgressJsonObject, userID);
                    $scope.gamesInProgress.push(gameInProgress);
                });

                $scope.placeHolderMessageIsErrorMessage = false;

                if ($scope.gamesInProgress.length === 0)
                    $scope.placeHolderMessage = "You have no games in progress.";
                else
                    $scope.placeHolderMessage = "";
            }
            else
            {
                $scope.placeHolderMessage = "Data retrieval error: " + errorMessage;
                $scope.placeHolderMessageIsErrorMessage = true;
                $scope.gamesInProgress = [];
            }
        });
    }

    $scope.isPlaceHolderMessageShown = function() {
        return ($scope.gamesInProgress.length === 0);
    };

    $scope.resume = function(gameInProgress) {
        $location.path(ANGULARROUTE_PATH_BOARD + "/" + gameInProgress.gameID);
    };

    $scope.resign = function(gameInProgress) {
        $rootScope.$broadcast(ANGULARNAME_EVENT_SHOWCONFIRMGAMERESIGNMODAL, function() {

            webSocketService.resignGame(gameInProgress.gameID);

            // TODO: Update our game list

        });
    };

    if (webSocketService.isReady())
        getGamesInProgress();
    else
        webSocketService.addServiceIsReadyListener(handleWebSocketServiceIsReady);

    function handleWebSocketServiceIsReady() {
        $scope.$apply(function() {
            getGamesInProgress();
        });
    }

    $scope.$on("$destroy", function() {
        webSocketService.removeServiceIsReadyListener(handleWebSocketServiceIsReady);
        webSocketService.removeGetGamesInProgressListener(handleGetGamesInProgress);
    });
}]);
