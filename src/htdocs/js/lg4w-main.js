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
lg4wApp.constant(ANGULARNAME_CONSTANT_WEBSOCKETCONFIG, webSocketConfig);

lg4wApp.config(["$routeProvider", "$locationProvider", "$logProvider", function($routeProvider, $locationProvider, $logProvider) {
    $locationProvider.html5Mode(true);

    // Set this to true if you want to see some debug output in the console
    $logProvider.debugEnabled(false);

    $routeProvider
        .when(ANGULARROUTE_PATH_ROOT, {
            templateUrl : "template/login-form.html",
            controller  : "lg4wLoginFormController"
        })
        .when(ANGULARROUTE_PATH_LOGIN, {
            templateUrl : "template/login-form.html",
            controller  : "lg4wLoginFormController"
        })
        .when(ANGULARROUTE_PATH_REGISTER, {
            templateUrl : "template/registration-form.html",
            controller  : "lg4wRegistrationFormController"
        })
        .when(ANGULARROUTE_PATH_GAMEREQUESTS, {
            templateUrl : "template/game-requests.html",
            controller  : "lg4wGameRequestsController"
        })
        .when(ANGULARROUTE_PATH_GAMESINPROGRESS, {
            templateUrl : "template/games-in-progress.html",
            controller  : "lg4wGamesInProgressController"
        })
        .when(ANGULARROUTE_PATH_FINISHEDGAMES, {
            templateUrl : "template/finished-games.html",
            controller  : "lg4wFinishedGamesController"
        })
        .when(ANGULARROUTE_PATH_HIGHSCORES, {
            templateUrl : "template/highscores.html",
            controller  : "lg4wHighscoresController"
        })
        .when(ANGULARROUTE_PATH_LOGOUT, {
            templateUrl : "template/logout.html",
            controller  : "lg4wLogoutController"
        })
        .when(ANGULARROUTE_PATH_BOARD, {
            templateUrl : "template/board.html",
            controller  : "lg4wBoardController"
        })
        .otherwise( { redirectTo: ANGULARROUTE_PATH_GAMESINPROGRESS } ) ;
}]);

lg4wApp.controller("lg4wGameRequestsController", ["$scope", function($scope) {
}]);

lg4wApp.controller("lg4wGamesInProgressController", ["$scope", function($scope) {
}]);

lg4wApp.controller("lg4wFinishedGamesController", ["$scope", function($scope) {
}]);

lg4wApp.controller("lg4wHighscoresController", ["$scope", function($scope) {
}]);

lg4wApp.controller("lg4wBoardController", ["$scope", function($scope) {
}]);

lg4wApp.directive("lg4wModals", function() {
    var directiveObject = {
        restrict : "E",
        templateUrl : "template/modals.html"
    };

    return directiveObject;
});

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
