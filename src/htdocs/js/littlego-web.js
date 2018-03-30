(function () {
    "use strict";

    // TODO: Establish connection. Include error handling!
    // var websocketUrl =
    //     "ws://"
    //     + websocketConfig.hostname
    //     + ":"
    //     + websocketConfig.port;
    // var webSocket = new WebSocket(websocketUrl);
    var theWebSocket = null;

    // Declare a few global variables
    var theSession = null;

    $(document).ready(function ()
    {
        // We can create the Session object only after the document is ready
        // because the validationComplete event handler needs to show or hide
        // elements in the DOM.
        theSession = new Session(theWebSocket, onSessionValidationComplete);

        // We want to handle the login process without form submission
        // mechanics because that would require another server request,
        // but we want to be a single-page app. We therefore don't
        // listen for the form's "submit" event (in fact the form cannot
        // be submitted at all, the button is not a submit button),
        // instead we perform just regular click handling.
        $("#login-form").on("submit", onLogin);

        $("#button-game-requests").on("click", onGameRequests);
        $("#button-games-in-progress").on("click", onGamesInProgress);
        $("#button-finished-games").on("click", onFinishedGames);
        $("#button-high-scores").on("click", onHighScores);
        $("#button-logout").on("click", onLogout);
    });

    function onSessionValidationComplete(session)
    {
        // TODO: This is executed too late, the user sees the
        // main app container for a very short moment before it's hidden.
        if (session.isValid())
        {
            // Main containers
            $("#container-login-form").hide();
            $("#container-main-app").show();

            // App containers
            // TODO Make the initial selection dynamic: If the user has games
            // in progress then show this section. In addition, if the user
            // has only one game in progress, then immediately show the play
            // area. If the user has no games in progress then show the game
            // requests section - even if that section is empty, because then
            // at least the user can immediately submit a new game request.
            makeAppContainerVisible("container-play");
            // Although we don't show the "games in progress" list, we
            // technically are still in that section.
            makeNavItemActive("button-games-in-progress");
        }
        else
        {
            // Main containers
            $("#container-login-form").show();
            $("#container-main-app").hide();

            // This is necessary after a logout
            $("#email-address").focus();
        }
    }

    function onLogin(event)
    {
        // We don't want form submission to take place.
        // We want to handle the login process ourselves.
        event.preventDefault();

        // TODO Form validation

        var emailAddress = $("#email-address").val();
        var password = $("#password").val();
        // TODO: Add a checkbox to the login form and query its value
        var persistSession = true;

        // Triggers onSessionValidationComplete
        theSession.login(emailAddress, password, persistSession);

        $("#login-form")[0].reset();
    }

    function onGameRequests(event)
    {
        // We don't want the anchor click to take place.
        // We want to handle the logout process ourselves.
        event.preventDefault();

        updateGameRequestsData();
        activateTab("game-requests");
    }

    function onGamesInProgress(event)
    {
        // We don't want the anchor click to take place.
        // We want to handle the logout process ourselves.
        event.preventDefault();

        activateTab("games-in-progress");
    }

    function onFinishedGames(event)
    {
        // We don't want the anchor click to take place.
        // We want to handle the logout process ourselves.
        event.preventDefault();

        activateTab("finished-games");
    }

    function onHighScores(event)
    {
        // We don't want the anchor click to take place.
        // We want to handle the logout process ourselves.
        event.preventDefault();

        activateTab("high-scores");
    }

    function onLogout(event)
    {
        // We don't want the anchor click to take place.
        // We want to handle the logout process ourselves.
        event.preventDefault();

        // Triggers onSessionValidationComplete which in turn hides the
        // app container and instead shows the login form
        theSession.invalidate();
    }

    function activateTab(tabName)
    {
        makeNavItemActive("button-" + tabName);
        makeAppContainerVisible("container-" + tabName);
    }

    function makeNavItemActive(navItemID)
    {
        $(".nav-item.active").removeClass("active");
        $("#" + navItemID).addClass("active");
    }

    function makeAppContainerVisible(appContainerID)
    {
        // Use the direct child selector for better performance
        $("#container-main-app > .container-fluid").hide();
        $("#" + appContainerID).show();
    }

    function updateGameRequestsData()
    {
        var appContainerID = "container-game-requests";
        clearDataTable(appContainerID);
        addPlaceholderMessageToDataTable(appContainerID);

        // TODO Retrieve current game requests from the server. At the
        // moment we generate static fake data.
        var gameRequests = createGameRequests();

        removePlaceholderMessageFromDataTable(appContainerID, NUMBER_OF_COLUMNS_GAME_REQUEST_TABLE);

        // Rebuild the table with the new data
        var tableBody = $("#" + appContainerID + " tbody");
        gameRequests.forEach(function(gameRequest) {
            var dataRow = createNewRow(tableBody);

            gameRequest.getDataTableValues().forEach(function(dataValue) {
                var dataCell = createNewCell(dataRow);
                fillCell(dataCell, dataValue);
            });

            var actionsCell = createNewCell(dataRow);
            addActionToCell(actionsCell, "Resume");
            addActionToCell(actionsCell, "Cancel");
        })
    }

    // Removes all rows from the data table that is located inside the
    // app container with the specified ID.
    function clearDataTable(appContainerID)
    {
        var tableBody = $("#" + appContainerID + " tbody");
        tableBody.empty();
    }

    // Adds a placeholder message to the data table that is located
    // inside the app container with the specified ID. The placeholder
    // message is suitable to be displayed while data is retrieved
    // from the server.
    //
    // This function expects that the data table contains no other data.
    function addPlaceholderMessageToDataTable(appContainerID, numberOfColumns)
    {
        var tableBody = $("#" + appContainerID + " tbody");

        var placerHolderRow = createNewRow(tableBody);
        var placeHolderCell = createNewCell(placerHolderRow);

        placeHolderCell.attr("colspan", numberOfColumns);
        fillCell(placeHolderCell, "Retrieving data ...");
    }

    // Removes a placeholder message previously added by
    // addPlaceholderMessageToDataTable() from the data table that is located
    // inside the app container with the specified ID.
    //
    // This function expects that the data table contains no other data
    // except for the placer holder message.
    function removePlaceholderMessageFromDataTable(appContainerID)
    {
        clearDataTable(appContainerID);
    }

    // Creates a new table row and adds it as the last row to the
    // specified table body.
    //
    // The specified table body must be a jQuery object representing
    // a "tbody" element.
    //
    // Returns a jQuery object that represents the newly created
    // "tr" element.
    function createNewRow(tableBody)
    {
        var newRowElement = document.createElement("tr");

        // append() returns the container, not the new child, so the
        // return value is useless to us
        tableBody.append(newRowElement);

        // We need a jQuery object, so we can't return newRowElement
        return tableBody.children().last();
    }

    // Creates a new table cell and adds it as the last cell to the
    // specified table row.
    //
    // The specified table row must be a jQuery object representing
    // a "tr" element.
    //
    // Returns a jQuery object that represents the newly created
    // "td" element.
    function createNewCell(parentRow)
    {
        var newCellElement = document.createElement("td");

        // append() returns the container, not the new child, so the
        // return value is useless to us
        parentRow.append(newCellElement);

        // We need a jQuery object, so we can't return newCellElement
        return parentRow.children().last();
    }

    // Fills the specified cell with the specified value.
    //
    // The specified table cell must be a jQuery object representing
    // a "td" element.
    function fillCell(tableCell, cellValue)
    {
        // Use html(), not text(), to make sure that HTML entities
        // are rendered
        tableCell.html(cellValue);
    }

    // Adds the specified action to the specified cell.
    //
    // The specified table cell must be a jQuery object representing
    // a "td" element.
    function addActionToCell(tableCell, actionName)
    {
        var newActionElement = document.createElement("button");

        // append() returns the container, not the new child, so the
        // return value is useless to us
        tableCell.append(newActionElement);

        // We need a jQuery object
        var newAction = tableCell.children().last()

        newAction.text(actionName);

        // TODO: Add Bootstrap classes to the action element
        // TODO: Add ID of the data item to the action element
        // TODO: Add event handler to the action element

        return newAction;
    }
})();
