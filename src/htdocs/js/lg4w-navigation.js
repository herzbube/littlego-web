// ----------------------------------------------------------------------
// This file contains the directive for the navigation bar, and the
// controller that manages navigation.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.directive("lg4wNavigation", [ANGULARNAME_CONSTANT_URLBASEPATH, function(urlBasePath) {
    var directiveObject = {
        restrict : "E",
        templateUrl : urlBasePath + "/template/navigation.html",
        controller : "lg4wNavigationController"
    };

    return directiveObject;
}]);

lg4wApp.controller("lg4wNavigationController", ["$scope", "$location", ANGULARNAME_CONSTANT_URLBASEPATH, ANGULARNAME_SERVICE_WEBSOCKET, ANGULARNAME_SERVICE_SESSION, function($scope, $location, urlBasePath, webSocketService, sessionService) {

    $scope.urlBasePath = urlBasePath;

    // Sometimes we don't receive the $routeChangeSuccess event when we
    // reload the page. Because of this we actively update the nav items
    // when this controller initializes.
    updateNavItems();

    $scope.$on("$routeChangeSuccess", function(angularEvent, currentRoute, previousRoute) {
        updateNavItems();
    });

    function updateNavItems() {
        var tabName;
        switch ($location.path())
        {
            case ANGULARROUTE_PATH_GAMEREQUESTS:
                tabName = TAB_NAME_GAME_REQUESTS;
                clearBadgeContentGameRequests();
                break;

            case ANGULARROUTE_PATH_GAMESINPROGRESS:
                tabName = TAB_NAME_GAMES_IN_PROGRESS;
                break;

            case ANGULARROUTE_PATH_FINISHEDGAMES:
                tabName = TAB_NAME_FINISHED_GAMES;
                break;

            case ANGULARROUTE_PATH_HIGHSCORES:
                tabName = TAB_NAME_HIGH_SCORES;
                break;

            case ANGULARROUTE_PATH_LOGOUT:
                tabName = TAB_NAME_LOGOUT;
                break;

            default:
                tabName = undefined;
                break;
        }

        // Deactivate all active nav items
        // TODO: Don't use jQuery
        $("." + BOOTSTRAP_CLASS_NAV_ITEM + "." + BOOTSTRAP_CLASS_ACTIVE).removeClass(BOOTSTRAP_CLASS_ACTIVE);

        // Activate the desired nav item
        if (tabName !== undefined)
        {
            // TODO: Don't use jQuery
            var navItemID = PREFIX_ID_BUTTON + tabName;
            $("#" + navItemID).addClass(BOOTSTRAP_CLASS_ACTIVE);
        }
    }

    // At the time this controller is initialized the session service may
    // already have a valid session (it does on a dev machine where everything
    // is local and comms is fast). If that's the case, the validationComplete
    // event listener will not be invoked, so initially we must actively obtain
    // the display name from the service.
    updateUserDisplayName();

    function updateUserDisplayName() {
        if (sessionService.hasValidSession())
            $scope.userDisplayName = sessionService.getUserInfo().displayName;
        else
            $scope.userDisplayName = "";
    }

    sessionService.addValidationCompleteListener(handleValidationComplete);
    function handleValidationComplete(errorMessage) {
        $scope.$apply(function() {
            updateUserDisplayName();
        });
    }

    $scope.badgeContentGameRequests = "";
    function setBadgeContentGameRequests()
    {
        $scope.badgeContentGameRequests = BADGE_SYMBOL;
    }
    function clearBadgeContentGameRequests()
    {
        $scope.badgeContentGameRequests = "";
    }

    // This is triggered not as a response to this client requesting
    // data, instead it is triggered because the server notifies us
    // about a pairing that was found because some other client
    // submitted a game request.
    webSocketService.addGameRequestPairingFoundListener(handleGameRequestPairingFound);
    function handleGameRequestPairingFound(success, gameRequestsJsonObjects, errorMessage) {
        if (success)
        {
            $scope.$apply(function() {
                setBadgeContentGameRequests();
            });
        }
        else
        {
            // We ignore all errors. Because this client didn't request the
            // data the server shouldn't send us error messages.
        }
    }

    $scope.$on("$destroy", function() {
        sessionService.removeValidationCompleteListener(handleValidationComplete);
        webSocketService.removeGameRequestPairingFoundListener(handleGameRequestPairingFound);
    })

}]);
