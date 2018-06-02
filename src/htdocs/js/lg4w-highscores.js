// ----------------------------------------------------------------------
// This file contains the controller that manages the "Highscores games" tab.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.controller("lg4wHighscoresController", ["$scope", ANGULARNAME_SERVICE_WEBSOCKET, ANGULARNAME_SERVICE_ERRORHANDLING, ANGULARNAME_SERVICE_PLEASEWAIT, function($scope, webSocketService, errorHandlingService, pleaseWaitService) {

    $scope.placeHolderMessage = "Waiting for server connection ...";
    $scope.placeHolderMessageIsErrorMessage = false;
    $scope.highscores = [];

    function getHighscores()
    {
        $scope.placeHolderMessage = "Retrieving data ...";
        $scope.placeHolderMessageIsErrorMessage = false;
        $scope.highscores = [];

        webSocketService.getHighscores();
    }

    webSocketService.addGetHighscoresListener(handleGetHighscores);
    function handleGetHighscores(success, highscoresJsonObjects, errorMessage) {
        $scope.$apply(function() {
            if (success)
            {
                $scope.highscores = [];
                highscoresJsonObjects.forEach(function(highscoreJsonObject) {
                    var highscore = new Highscore(highscoreJsonObject);
                    $scope.highscores.push(highscore);
                });

                $scope.placeHolderMessageIsErrorMessage = false;

                if ($scope.highscores.length === 0)
                    $scope.placeHolderMessage = "There are no highscores.";
                else
                    $scope.placeHolderMessage = "";
            }
            else
            {
                $scope.placeHolderMessage = "Data retrieval error: " + errorMessage;
                $scope.placeHolderMessageIsErrorMessage = true;
                $scope.highscores = [];
            }
        });
    }

    $scope.isPlaceHolderMessageShown = function() {
        return ($scope.highscores.length === 0);
    };

    $scope.emailHighscores = function() {

        pleaseWaitService.showPleaseWaitModal();

        webSocketService.emailHighscores();
    };

    webSocketService.addEmailHighscoresListener(handleEmailHighscores);
    function handleEmailHighscores(success, errorMessage) {

        pleaseWaitService.hidePleaseWaitModal();

        if (success)
        {
            // TODO Don't use jQuery
            $("#" + ID_MODAL_HIGHSCORES_HAVE_BEEN_EMAILED).modal()
        }
        else
        {
            errorHandlingService.showServerError(errorMessage);
        }
    }

    if (webSocketService.isReady())
        getHighscores();
    else
        webSocketService.addServiceIsReadyListener(handleWebSocketServiceIsReady);

    function handleWebSocketServiceIsReady() {
        $scope.$apply(function() {
            getHighscores();
        });
    }

    $scope.$on("$destroy", function() {
        webSocketService.removeServiceIsReadyListener(handleWebSocketServiceIsReady);
        webSocketService.removeEmailHighscoresListener(handleEmailHighscores);
        webSocketService.removeGetHighscoresListener(handleGetHighscores);
    });
}]);
