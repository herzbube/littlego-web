// ----------------------------------------------------------------------
// This file contains the controller that manages the "Games in progress" tab.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wGamesInProgressController", ["$scope", "$location", ANGULARNAME_SERVICE_WEBSOCKET, function($scope, $location, webSocketService) {

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
                gamesInProgressJsonObjects.forEach(function(gameInProgressJsonObject) {
                    var gameInProgress = new GameInProgress(gameInProgressJsonObject);
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
        // TODO: Setup board
        //theBoard.setupBoardForGameInProgress(gameInProgress.gameID, theSession.userInfo);

        $location.path(ANGULARROUTE_PATH_BOARD);
    };

    $scope.resign = function(gameInProgress) {
        // TODO: Don't use jQuery
        $("#" + ID_MODAL_NOT_YET_IMPLEMENTED).modal()
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

    $scope.$on('$destroy', function() {
        webSocketService.removeServiceIsReadyListener(handleWebSocketServiceIsReady);
        webSocketService.removeGetGamesInProgressListener(handleGetGamesInProgress);
    })
}]);
