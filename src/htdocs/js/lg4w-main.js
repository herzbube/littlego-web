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


// The config block is executed after providers are ready.
lg4wApp.config(["$routeProvider", "$locationProvider", "$logProvider", ANGULARNAME_CONSTANT_URLBASEPATH, function($routeProvider, $locationProvider, $logProvider, urlBasePath) {
    $locationProvider.html5Mode(true);

    // Set this to true if you want to see some debug output in the console
    $logProvider.debugEnabled(false);

    $routeProvider
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


// The run block is the ideal place to catch authentication problems, i.e.
// the user tries to access a route although she isn't logged in. In other,
// more traditional applications the server might send the authentication
// state along with the initial HTML document (typically in the form of a
// cookie), but in this application we perform authentication asynchronously
// via WebSocket. We therefore have to wait for the initial session validation
// to complete before we can tell whether the user is authorized to access
// the initial URL.
//
// The responsibility for managing this auth-based bootstrapping is divided
// between two actors:
// - The application's main controller is responsible for hiding the entire
//   application content until initial session validation is complete.
// - This run block is responsible for deciding whether we have to redirect
//   to a different URL based on the result of the initial session
//   validation.
//
// Why don't we do both things in the main controller? The run block is
// executed after all config blocks, and after services have been configured,
// but BEFORE any controllers have been initialized. Because of this the run
// block is guaranteed to be the first to install an event handler for the
// initial session validation, thus the run block's event handler will be
// invoked BEFORE any of the other handlers that controllers might install.
// This gives the run block the opportunity to redirect to the correct URL
// before the content of the wrong URL becomes visible.
//
// Also note: The run block is also required to reliably catch the
// $routeChangeStart event on initial page load. If we delegate listening for
// $routeChangeStart to a controller, the controller will NOT get the event
// on initial page load - this was experimentally determined in Firefox 58
// on macOS 10.12. At the moment we don't use $routeChangeStart because
// the event always occurs before initial session validation is complete,
// so it's useless for our purposes.
lg4wApp.run(["$location", ANGULARNAME_SERVICE_SESSION, function($location, sessionService) {

    sessionService.addValidationCompleteListener(handleValidationComplete);
    function handleValidationComplete(errorMessage) {

        // Remove the event handler, it needs to run only once to handle the
        // initial session validation
        sessionService.removeValidationCompleteListener(handleValidationComplete);

        handleInitialRoute();
    }

    function handleInitialRoute() {

        var redirectPath = undefined;

        switch ($location.path())
        {
            case ANGULARROUTE_PATH_LOGIN:
            case ANGULARROUTE_PATH_REGISTER:
                // User needs to be logged out to perform login or
                // registration. If user is logged in we redirect to the
                // default page for valid sessions. An alternative could
                // be to invalidate the session so that we can honor the
                // user's wish for the initial URL, but it's more likely
                // that the user has simply bookmarked the wrong URL.
                if (sessionService.hasValidSession())
                    redirectPath = ANGULARROUTE_PATH_DEFAULT_IF_VALID_SESSION;
                break;

            case ANGULARROUTE_PATH_GAMEREQUESTS:
            case ANGULARROUTE_PATH_GAMESINPROGRESS:
            case ANGULARROUTE_PATH_FINISHEDGAMES:
            case ANGULARROUTE_PATH_HIGHSCORES:
            case ANGULARROUTE_PATH_LOGOUT:
                // User needs to be logged in to access these pages.
                // If user is logged out we redirect to the login form.
                // An alternative could be to show a screen that informs
                // the user about the problem.
                if (! sessionService.hasValidSession())
                    redirectPath = ANGULARROUTE_PATH_LOGIN;
                break;

            default:
                if ($location.path().startsWith(ANGULARROUTE_PATH_BOARD + "/"))
                {
                    // Same handling as ANGULARROUTE_PATH_GAMEREQUESTS etc.
                    // See above for details.
                    if (! sessionService.hasValidSession())
                        redirectPath = ANGULARROUTE_PATH_LOGIN;
                }
                else
                {
                    // Whether or not we can get to this catch-all depends on
                    // how the web server is configured. For instance, the web
                    // server might filter out any unknown URL paths and
                    // return a 404 error. Of course, we could also get here
                    // if the application JavaScript code performs any
                    // unexpected redirects. This would be a programming error,
                    if (sessionService.hasValidSession())
                        redirectPath = ANGULARROUTE_PATH_DEFAULT_IF_VALID_SESSION;
                    else
                        redirectPath = ANGULARROUTE_PATH_LOGIN;
                }
                break;
        }

        if (redirectPath !== undefined)
            $location.path(redirectPath);
    }

}]);

lg4wApp.directive("lg4wModals", [ANGULARNAME_CONSTANT_URLBASEPATH, function(urlBasePath) {
    var directiveObject = {
        restrict : "E",
        templateUrl : urlBasePath + "/template/modals.html"
    };

    return directiveObject;
}]);

lg4wApp.controller("lg4wMainController", ["$scope", ANGULARNAME_SERVICE_SESSION, function($scope, sessionService) {

    var initialSessionValidationHasCompleted = false;

    $scope.isApplicationContentShown = function() {
        // If the session service has not yet performed its initial session
        // validation, we don't yet know whether we should display the
        // login form or the initial tab after a successful login.
        return initialSessionValidationHasCompleted;
    };

    $scope.isNavigationShown = function() {
        return $scope.isApplicationContentShown() && sessionService.hasValidSession();
    };

    sessionService.addValidationCompleteListener(handleValidationComplete);
    function handleValidationComplete(errorMessage) {

        // We are interested only in the initial session validation. If the
        // user logs in or out afterwards, this doesn't concern us.
        if (initialSessionValidationHasCompleted)
            return;

        $scope.$apply(function() {
            initialSessionValidationHasCompleted = true;
        });
    }

    $scope.$on("$destroy", function() {
        sessionService.removeValidationCompleteListener(handleValidationComplete);
    });
}]);
