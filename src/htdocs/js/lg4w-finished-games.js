// ----------------------------------------------------------------------
// This file contains the controller that manages the "Finished games" tab.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wFinishedGamesController", ["$scope", "$location", ANGULARNAME_SERVICE_WEBSOCKET, function($scope, $location, webSocketService) {

    $scope.placeHolderMessage = "Retrieving data ...";
    $scope.placeHolderMessageIsErrorMessage = false;
    $scope.finishedGames = [];

    // We fake the asynchronous data retrieval process by generating an
    // artificial delay. Then we generate static fake data.
    var timeoutInMilliseconds = 1000;
    setTimeout(function() {
        var finishedGamesJsonObjects = createFinishedGamesJsonObjects();
        handleGetFinishedGames(true, finishedGamesJsonObjects, undefined);
    }, timeoutInMilliseconds);

    // TODO: Uncomment when web socket request is implemented
    //webSocketService.addGetFinishedGamesListener(handleGetFinishedGames);
    function handleGetFinishedGames(success, finishedGamesJsonObjects, errorMessage) {
        $scope.$apply(function() {
            if (success)
            {
                $scope.finishedGames = [];
                finishedGamesJsonObjects.forEach(function(finishedGameJsonObject) {
                    var finishedGame = new FinishedGame(finishedGameJsonObject);
                    $scope.finishedGames.push(finishedGame);
                });

                $scope.placeHolderMessageIsErrorMessage = false;

                if ($scope.finishedGames.length === 0)
                    $scope.placeHolderMessage = "You have no finished games.";
                else
                    $scope.placeHolderMessage = "";
            }
            else
            {
                $scope.placeHolderMessage = "Data retrieval error: " + errorMessage;
                $scope.placeHolderMessageIsErrorMessage = true;
                $scope.finishedGames = [];
            }
        });
    }

    $scope.isPlaceHolderMessageShown = function() {
        return ($scope.finishedGames.length === 0);
    };

    $scope.view = function(finishedGame) {
        // TODO: Don't use jQuery
        $("#" + ID_MODAL_NOT_YET_IMPLEMENTED).modal()
    };

    $scope.emailResult = function(finishedGame) {
        // TODO: Don't use jQuery
        $("#" + ID_MODAL_NOT_YET_IMPLEMENTED).modal()
    };

    $scope.delete = function(finishedGame) {
        // TODO: Don't use jQuery
        $("#" + ID_MODAL_NOT_YET_IMPLEMENTED).modal()
    };

    // TODO: Uncomment when web socket request is implemented
    // if (webSocketService.isReady())
    //     webSocketService.getFinishedGames();
    // else
    //     webSocketService.addServiceIsReadyListener(handleWebSocketServiceIsReady);
    //
    // function handleWebSocketServiceIsReady() {
    //     webSocketService.getFinishedGames();
    // }
    //
    // $scope.$on('$destroy', function() {
    //     webSocketService.removeServiceIsReadyListener(handleWebSocketServiceIsReady);
    //     webSocketService.removeGetFinishedGamesListener(handleGetFinishedGames);
    // })
}]);
