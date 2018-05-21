// ----------------------------------------------------------------------
// This file contains the main code that bootstraps the application and
// instantiates the main application controller.
//
// According to the docs [1] AngularJS bootstraps and executes
// code automatically when the document is ready, so no need for
// jQuery style $(document).ready(...).
//
// [1] https://docs.angularjs.org/guide/bootstrap
// ----------------------------------------------------------------------

"use strict";

var lg4wApp = angular.module("lg4wApp", ["ngRoute"]);

// When the HTML document is generated on the server, the PHP code that
// generates the document injects a literal script snippet into the
// document that sets some global variables with values that only the
// server can provide. Here we transform these global variables into
// AngularJS constants.
lg4wApp.constant(ANGULARNAME_CONSTANT_WEBSOCKETCONFIG, webSocketConfig);
lg4wApp.constant(ANGULARNAME_CONSTANT_URLBASEPATH, urlBasePath);


lg4wApp.config(["$routeProvider", "$locationProvider", "$logProvider", ANGULARNAME_CONSTANT_URLBASEPATH, function($routeProvider, $locationProvider, $logProvider, urlBasePath) {
    $locationProvider.html5Mode(true);

    // Set this to true if you want to see some debug output in the console
    $logProvider.debugEnabled(false);

    $routeProvider
        .when(ANGULARROUTE_PATH_ROOT, {
            templateUrl : urlBasePath + "/template/login-form.html",
            controller  : "lg4wLoginFormController"
        })
        .when(ANGULARROUTE_PATH_LOGIN, {
            templateUrl : urlBasePath + "/template/login-form.html",
            controller  : "lg4wLoginFormController"
        })
        .when(ANGULARROUTE_PATH_REGISTER, {
            templateUrl : urlBasePath + "/template/registration-form.html",
            controller  : "lg4wRegistrationFormController"
        })
        .when(ANGULARROUTE_PATH_GAMEREQUESTS, {
            templateUrl : urlBasePath + "/template/game-requests.html",
            controller  : "lg4wGameRequestsController"
        })
        .when(ANGULARROUTE_PATH_GAMESINPROGRESS, {
            templateUrl : urlBasePath + "/template/games-in-progress.html",
            controller  : "lg4wGamesInProgressController"
        })
        .when(ANGULARROUTE_PATH_FINISHEDGAMES, {
            templateUrl : urlBasePath + "/template/finished-games.html",
            controller  : "lg4wFinishedGamesController"
        })
        .when(ANGULARROUTE_PATH_HIGHSCORES, {
            templateUrl : urlBasePath + "/template/highscores.html",
            controller  : "lg4wHighscoresController"
        })
        .when(ANGULARROUTE_PATH_LOGOUT, {
            templateUrl : urlBasePath + "/template/logout.html",
            controller  : "lg4wLogoutController"
        })
        .when(ANGULARROUTE_PATH_BOARD + "/:gameID", {
            templateUrl : urlBasePath + "/template/board.html",
            controller  : "lg4wBoardController"
        })
        .otherwise( { redirectTo: ANGULARROUTE_PATH_GAMESINPROGRESS } ) ;
}]);

lg4wApp.controller("lg4wHighscoresController", ["$scope", function($scope) {
}]);

lg4wApp.controller("lg4wBoardController", ["$scope", function($scope) {
}]);

lg4wApp.directive("lg4wModals", [ANGULARNAME_CONSTANT_URLBASEPATH, function(urlBasePath) {
    var directiveObject = {
        restrict : "E",
        templateUrl : urlBasePath + "/template/modals.html"
    };

    return directiveObject;
}]);

lg4wApp.controller("lg4wMainController", ["$scope", ANGULARNAME_SERVICE_SESSION, function($scope, sessionService) {

    $scope.isApplicationContentShown = function() {
        // If the session service is not yet ready we don't yet know
        // whether we should display the login form or the initial tab
        // after a successful login
        return sessionService.isReady();
    };

    $scope.isNavigationShown = function() {
        return sessionService.isReady() && sessionService.hasValidSession();
    };

}]);
