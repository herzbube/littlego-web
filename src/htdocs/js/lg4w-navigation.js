// ----------------------------------------------------------------------
// This file contains the directive for the navigation bar, and the
// controller that manages navigation.
// ----------------------------------------------------------------------

"use strict";

lg4wApp.directive("lg4wNavigation", function() {
    var directiveObject = {
        restrict : "E",
        templateUrl : "template/navigation.html",
        controller : "lg4wNavigationController"
    };

    return directiveObject;
});

lg4wApp.controller("lg4wNavigationController", ["$scope", "$location", ANGULARNAME_SERVICE_SESSION, function($scope, $location, sessionService) {

    $scope.$on('$routeChangeSuccess', function(angularEvent, currentRoute, previousRoute) {

        var tabName;
        switch ($location.path())
        {
            case ANGULARROUTE_PATH_GAMEREQUESTS:
                tabName = TAB_NAME_GAME_REQUESTS;
                break;

            case ANGULARROUTE_PATH_GAMESINPROGRESS:
            case ANGULARROUTE_PATH_BOARD:
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
    });

    // At the time this controller is initialized the session service may
    // already have a valid session (it does on a dev machine where everything
    // is local and comms is fast). If that's the case, the validationComplete
    // event listener will not be invoked, so initially we must actively obtain
    // the display name from the service.
    updateUserDisplayName();

    function updateUserDisplayName()
    {
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

    $scope.$on('$destroy', function() {
        sessionService.removeValidationCompleteListener(handleValidationComplete);
    })

}]);
