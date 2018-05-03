// ----------------------------------------------------------------------
// This file contains the main code that bootstraps the application and
// performs site navigation.
// ----------------------------------------------------------------------

(function () {
    "use strict";

    // Declare a few global variables
    var theSession = null;

    var websocketUrl =
        "ws://"
        + websocketConfig.hostname
        + ":"
        + websocketConfig.port;
    var theWebSocket = new WebSocket(websocketUrl);

    $(document).ready(function()
    {
        // Initially hide everything until it becomes clear whether we can
        // resume a previous session or must login.
        // TODO: This is executed too late, the user sees the containers
        // containers for a very short moment before they are hidden.
        $("#" + ID_CONTAINER_LOGIN_FORM).hide();
        $("#" + ID_CONTAINER_REGISTRATION_FORM).hide();
        $("#" + ID_CONTAINER_MAIN_APP).hide();
        $("#" + ID_ALERT_LOGIN).hide();

        $("#" + ID_LOGIN_FORM).on("submit", onLogin);
        $("#" + ID_REGISTRATION_FORM).on("submit", onRegister);

        $("#" + ID_BUTTON_GOTO_REGISTRATION).on("click", onGotoRegistration);
        $("#" + ID_BUTTON_CANCEL_REGISTRATION).on("click", onCancelRegistration);

        $("#" + ID_BUTTON_GAME_REQUESTS).on("click", onGameRequests);
        $("#" + ID_BUTTON_GAMES_IN_PROGRESS).on("click", onGamesInProgress);
        $("#" + ID_BUTTON_FINISHED_GAMES).on("click", onFinishedGames);
        $("#" + ID_BUTTON_HGIH_SCORES).on("click", onHighScores);
        $("#" + ID_BUTTON_LOGOUT).on("click", onLogout);

        $("#" + ID_BUTTON_NEW_GAME_REQUEST_MODAL_SUBMIT).on("click", onSubmitNewGameRequest);
        $("#" + ID_BUTTON_CONFIRM_GAME_REQUEST_PAIRING_MODAL_START_GAME).on("click", onConfirmGameRequestPairing);

        theWebSocket.addEventListener("message", function(event) {
            handleWebSocketMessage(event);
        });

        theWebSocket.addEventListener("open", function(event) {
            // We can create the Session object only after the document is
            // ready because the validationComplete event handler needs to
            // show or hide elements in the DOM.
            theSession = new Session(theWebSocket, onSessionValidationComplete);
        });

        theWebSocket.addEventListener("error", function(event) {
            // TODO: Add better error message. The current error message
            // only makes sense to a developer.
            alert("WebSocket error! Please check if the server is running. Reload the page after restarting the server.");
        });
    });

    function onLogin(event)
    {
        // We don't want form submission to take place.
        // We want to handle the login process ourselves.
        event.preventDefault();

        var emailAddress = $("#" + ID_INPUT_LOGIN_EMAIL_ADDRESS).val();
        var password = $("#" + ID_INPUT_LOGIN_PASSWORD).val();
        // TODO: Add a checkbox to the login form and query its value
        var persistSession = true;

        // Triggers onSessionValidationComplete
        theSession.login(emailAddress, password, persistSession);
    }

    // This callback is invoked after a login (both successful and
    // unsuccessful) and after a logout (in which case the session
    // is invalidated).
    function onSessionValidationComplete(session, errorMessage)
    {
        // TODO: This is executed too late, the user sees the
        // main app container for a very short moment before it's hidden.
        if (session.isValid())
        {
            // Main containers
            $("#" + ID_CONTAINER_LOGIN_FORM).hide();
            $("#" + ID_CONTAINER_MAIN_APP).show();

            $("#" + ID_SESSION_DISPLAY_NAME).html(theSession.userInfo.displayName);

            // App containers
            // TODO Make the initial selection dynamic: If the user has games
            // in progress then show this section. In addition, if the user
            // has only one game in progress, then immediately show the play
            // area. If the user has no games in progress then show the game
            // requests section - even if that section is empty, because then
            // at least the user can immediately submit a new game request.
            makeAppContainerVisible(ID_CONTAINER_GAME_REQUESTS);
            makeNavItemActive(ID_BUTTON_GAME_REQUESTS);
            updateGameRequestsData();
        }
        else
        {
            $("#" + ID_INPUT_LOGIN_EMAIL_ADDRESS).focus();

            // This exists to show the login form after a page reload,
            // when the Session object completes its initial session
            // validation with failure (either there was no stored
            // session key, or the session key was no longer valid)
            $("#" + ID_CONTAINER_LOGIN_FORM).show();

            if (errorMessage !== undefined)
                $("#" + ID_ALERT_LOGIN).text(errorMessage).show();
        }
    }

    function onGotoRegistration(event)
    {
        $("#" + ID_REGISTRATION_FORM)[0].reset();
        $("#" + ID_ALERT_REGISTRATION).hide();

        $("#" + ID_INPUT_REGISTRATION_EMAIL_ADDRESS).focus();

        $("#" + ID_CONTAINER_LOGIN_FORM).hide();
        $("#" + ID_CONTAINER_REGISTRATION_FORM).show();
    }

    function onCancelRegistration(event)
    {
        $("#" + ID_LOGIN_FORM)[0].reset();
        $("#" + ID_ALERT_LOGIN).hide();

        $("#" + ID_INPUT_LOGIN_EMAIL_ADDRESS).focus();

        $("#" + ID_CONTAINER_REGISTRATION_FORM).hide();
        $("#" + ID_CONTAINER_LOGIN_FORM).show();
    }

    function onRegister(event)
    {
        // We don't want form submission to take place.
        // We want to handle the registration process ourselves.
        event.preventDefault();

        var emailAddress = $("#" + ID_INPUT_REGISTRATION_EMAIL_ADDRESS).val();
        var displayName = $("#" + ID_INPUT_REGISTRATION_DISPLAY_NAME).val();
        var password = $("#" + ID_INPUT_REGISTRATION_PASSWORD).val();

        var messageData =
            {
                emailAddress: emailAddress,
                displayName: displayName,
                password: password
            };
        // Triggers onRegistrationComplete
        sendWebSocketMessage(theWebSocket, WEBSOCKET_REQUEST_TYPE_REGISTERACCOUNT, messageData);

        // TODO: Display some sort of progress overlay in case registration
        // takes longer than expected. This also prevents the user from
        // fiddling with the form data that onRegistrationComplete() needs
        // to perform the auto-login.
    }

    // This callback is invoked after registration (both successful and
    // unsuccessful).
    function onRegistrationComplete(success, errorMessage)
    {
        if (success)
        {
            $("#" + ID_CONTAINER_REGISTRATION_FORM).hide();

            // TODO: Don't abuse the form to hold our data - the
            // onRegister() function should store the values it retrieves
            // in some variables. If the registration process takes a long
            // time, the user could in theory fiddle with the form data.
            var emailAddress = $("#" + ID_INPUT_REGISTRATION_EMAIL_ADDRESS).val();
            var password = $("#" + ID_INPUT_REGISTRATION_PASSWORD).val();

            // Triggers onSessionValidationComplete
            // TODO: Remove/change this code when email address verification
            // is implemented. Also note: If the login attempt fails,
            // onSessionValidationComplete will route the user back to the
            // login form - this will feel very weird to the user!
            var persistSession = false;
            theSession.login(emailAddress, password, persistSession);
        }
        else
        {
            // TODO: The focus should be set on the input control
            // that contains the erroneous data
            $("#" + ID_INPUT_REGISTRATION_EMAIL_ADDRESS).focus();

            // TODO: The error message should appear below the input control
            // that contains the erroneous data
            if (errorMessage !== undefined)
                $("#" + ID_ALERT_REGISTRATION).text(errorMessage).show();
        }
    }

    function onGameRequests(event)
    {
        // We don't want the anchor click to take place.
        // We want to handle the logout process ourselves.
        event.preventDefault();

        updateGameRequestsData();
        activateTab(TAB_NAME_GAME_REQUESTS);
    }

    function onGamesInProgress(event)
    {
        // We don't want the anchor click to take place.
        // We want to handle the logout process ourselves.
        event.preventDefault();

        updateGamesInProgressData();
        activateTab(TAB_NAME_GAMES_IN_PROGRESS);
    }

    function onFinishedGames(event)
    {
        // We don't want the anchor click to take place.
        // We want to handle the logout process ourselves.
        event.preventDefault();

        updateFinishedGamesData();
        activateTab(TAB_NAME_FINISHED_GAMES);
    }

    function onHighScores(event)
    {
        // We don't want the anchor click to take place.
        // We want to handle the logout process ourselves.
        event.preventDefault();

        activateTab(TAB_NAME_HIGH_SCORES);
    }

    function onLogout(event)
    {
        // We don't want the anchor click to take place.
        // We want to handle the logout process ourselves.
        event.preventDefault();

        $("#" + ID_LOGIN_FORM)[0].reset();
        $("#" + ID_ALERT_LOGIN).hide();

        $("#" + ID_CONTAINER_MAIN_APP).hide();
        $("#" + ID_CONTAINER_LOGIN_FORM).show();

        // Triggers onSessionValidationComplete
        theSession.invalidate();
    }

    function onCancelGameRequest(dataItemAction)
    {
        var gameRequest = dataItemAction.dataItem;

        var messageData =
            {
                gameRequestID: gameRequest.gameRequestID
            };
        // Triggers onCancelGameRequestComplete
        sendWebSocketMessage(theWebSocket, WEBSOCKET_REQUEST_TYPE_CANCELGAMEREQUEST, messageData);
    }

    function onCancelGameRequestComplete(success, gameRequestsJsonObjects, errorMessage)
    {
        if (success)
        {
            updateGameRequestsDataTableWithJsonData(gameRequestsJsonObjects);
        }
        else
        {
            // TODO: Add error handling
        }
    }

    function onConfirmGameRequest(dataItemAction)
    {
        var gameRequest = dataItemAction.dataItem;

        var messageData =
            {
                gameRequestID: gameRequest.gameRequestID
            };
        // Triggers onConfirmGameRequestComplete
        sendWebSocketMessage(theWebSocket, WEBSOCKET_REQUEST_TYPE_GETGAMEREQUESTPAIRING, messageData);
    }

    function onConfirmGameRequestComplete(success, gameRequestPairing, errorMessage)
    {
        if (success)
        {
            showConfirmGameRequestPairingModal(gameRequestPairing);
        }
        else
        {
            // TODO: Add error handling
        }
    }

    function onResumeGameInProgress(dataItemAction)
    {
        var gameInProgress = dataItemAction.dataItem;

        showBoard();

        // TODO: Actually show data for the game in progress.
    }

    function onViewFinishedGame(dataItemAction)
    {
        var finishedGame = dataItemAction.dataItem;

        showBoard();

        // TODO: Actually show data for the finished game.
    }

    function activateTab(tabName)
    {
        makeNavItemActive(PREFIX_ID_BUTTON + tabName);
        makeAppContainerVisible(PREFIX_ID_CONTAINER + tabName);
    }

    function showBoard()
    {
        makeAppContainerVisible(ID_CONTAINER_PLAY);
        makeNavItemActive(ID_BUTTON_GAMES_IN_PROGRESS);

        // Start drawing the board AFTER the board container has been
        // made visible, otherwise the container has width/height 0.
        var containerBoard = $("#" + ID_CONTAINER_BOARD);
        drawGoBoard(containerBoard);
    }

    function makeNavItemActive(navItemID)
    {
        deactivateAllNavItems();
        $("#" + navItemID).addClass(BOOTSTRAP_CLASS_ACTIVE);
    }

    function deactivateAllNavItems()
    {
        $("." + BOOTSTRAP_CLASS_NAV_ITEM + "." + BOOTSTRAP_CLASS_ACTIVE).removeClass(BOOTSTRAP_CLASS_ACTIVE);
    }

    function makeAppContainerVisible(appContainerID)
    {
        hideAllAppContainers();
        $("#" + appContainerID).show();
    }

    function hideAllAppContainers()
    {
        // Use the direct child selector for better performance
        $("#container-main-app > .container-fluid").hide();
    }

    function updateGameRequestsData()
    {
        var appContainerID = ID_CONTAINER_GAME_REQUESTS;
        var numberOfColumns = NUMBER_OF_COLUMNS_GAME_REQUEST_TABLE;
        clearDataTableAndAddDataRetrievalPlaceholderMessage(appContainerID, numberOfColumns);

        var messageData = { };
        // Triggers onGetGameRequestsComplete
        sendWebSocketMessage(theWebSocket, WEBSOCKET_REQUEST_TYPE_GETGAMEREQUESTS, messageData);
    }

    function onGetGameRequestsComplete(success, gameRequestsJsonObjects, errorMessage)
    {
        if (success)
        {
            updateGameRequestsDataTableWithJsonData(gameRequestsJsonObjects);
        }
        else
        {
            // TODO: Add error handling
        }
    }

    function updateGameRequestsDataTableWithJsonData(gameRequestsJsonObjects)
    {
        var gameRequests = [];
        gameRequestsJsonObjects.forEach(function(gameRequestJsonObject) {
            var gameRequest = new GameRequest(gameRequestJsonObject);
            gameRequests.push(gameRequest);
        });

        var appContainerID = ID_CONTAINER_GAME_REQUESTS;
        var numberOfColumns = NUMBER_OF_COLUMNS_GAME_REQUEST_TABLE;
        var noDataPlaceholderMessage = "You have no game requests.";
        updateDataTable(appContainerID, gameRequests, numberOfColumns, noDataPlaceholderMessage);
    }

    function updateGamesInProgressData()
    {
        var appContainerID = ID_CONTAINER_GAMES_IN_PROGRESS;
        var numberOfColumns = NUMBER_OF_COLUMNS_GAMES_IN_PROGRESS_TABLE;
        var dataRetrievalFunction = createGamesInProgress;
        updateDataTableWithFakeData(appContainerID, numberOfColumns, dataRetrievalFunction);
    }

    function updateFinishedGamesData()
    {
        var appContainerID = ID_CONTAINER_FINISHED_GAMES;
        var numberOfColumns = NUMBER_OF_COLUMNS_FINISHED_GAMES_TABLE;
        var dataRetrievalFunction = createFinishedGames;
        updateDataTableWithFakeData(appContainerID, numberOfColumns, dataRetrievalFunction);
    }

    // TODO Remove if no longer needed
    function updateDataTableWithFakeData(appContainerID, numberOfColumns, dataRetrievalFunction)
    {
        clearDataTableAndAddDataRetrievalPlaceholderMessage(appContainerID, numberOfColumns);

        // We fake the asynchronous data retrieval process by generating an
        // artificial delay. Then we generate static fake data.
        var timeoutInMilliseconds = 1000;
        setTimeout(function() {
            var dataItems = dataRetrievalFunction();
            updateDataTable(appContainerID, dataItems, numberOfColumns);
        }, timeoutInMilliseconds);
    }

    function updateDataTable(appContainerID, dataItems, numberOfColumns, noDataPlaceholderMessage)
    {
        removePlaceholderMessageFromDataTable(appContainerID);

        if (dataItems.length === 0)
        {
            addPlaceholderMessageToDataTable(appContainerID, numberOfColumns, noDataPlaceholderMessage);
            return;
        }

        // Rebuild the table with the supplied data
        var tableBody = $("#" + appContainerID + " tbody");
        dataItems.forEach(function(dataItem) {
            var dataRow = createNewRow(tableBody);

            dataItem.getDataTableValues().forEach(function(dataValue) {
                var dataCell = createNewCell(dataRow);
                fillCell(dataCell, dataValue);
            });

            var actionsCell = createNewCell(dataRow);
            dataItem.getDataItemActions ().forEach(function(dataItemAction) {
                var dataItemActionEventHandler = eventHandlerForOperationType(dataItemAction.operationType);
                if (undefined === dataItemActionEventHandler)
                {
                    addActionToCell(actionsCell, dataItemAction.actionTitle, dataItemAction.actionType);
                }
                else
                {
                    addActionToCell(actionsCell, dataItemAction.actionTitle, dataItemAction.actionType, function() {
                        dataItemActionEventHandler(dataItemAction);
                    });
                }
            });
        })
    }

    function clearDataTableAndAddDataRetrievalPlaceholderMessage(appContainerID, numberOfColumns)
    {
        clearDataTable(appContainerID);
        addPlaceholderMessageToDataTable(appContainerID, numberOfColumns, "Retrieving data ...");
    }

    // Removes all rows from the data table that is located inside the
    // app container with the specified ID.
    function clearDataTable(appContainerID)
    {
        var tableBody = $("#" + appContainerID + " tbody");
        tableBody.empty();
    }

    // Adds the specified placeholder message to the data table that is
    // located inside the app container with the specified ID.
    //
    // This function expects that the data table contains no other data.
    function addPlaceholderMessageToDataTable(appContainerID, numberOfColumns, placeholderMessage)
    {
        var tableBody = $("#" + appContainerID + " tbody");

        var placerHolderRow = createNewRow(tableBody);
        var placeHolderCell = createNewCell(placerHolderRow);

        placeHolderCell.addClass(CLASS_DATA_PLACEHOLDER);
        placeHolderCell.attr("colspan", numberOfColumns);
        fillCell(placeHolderCell, placeholderMessage);
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
    function addActionToCell(tableCell, actionText, actionType, eventHandler)
    {
        var newActionElement = document.createElement("button");

        // append() returns the container, not the new child, so the
        // return value is useless to us
        tableCell.append(newActionElement);

        // We need a jQuery object
        var newAction = tableCell.children().last()

        newAction.html(actionText);

        newAction.addClass(BOOTSTRAP_CLASS_BUTTON);
        newAction.addClass(BOOTSTRAP_CLASS_BUTTON_SMALL);
        newAction.addClass(BOOTSTRAP_CLASS_BUTTON_BLOCKLEVEL);
        var bootstrapButtonStyleClass = actionType2BootstrapButtonClass(actionType);
        newAction.addClass(bootstrapButtonStyleClass);

        if (eventHandler === undefined)
        {
            newAction.attr(BOOTSTRAP_ATTRIBUTE_DATA_TOGGLE, BOOTSTRAP_ATTRIBUTE_VALUE_MODAL);
            newAction.attr(BOOTSTRAP_ATTRIBUTE_DATA_TARGET, "#" + ID_MODAL_NOT_YET_IMPLEMENTED);
        }
        else
        {
            newAction.on("click", eventHandler);
        }

        return newAction;
    }

    function eventHandlerForOperationType(operationType)
    {
        switch (operationType)
        {
            case OPERATION_TYPE_GAME_REQUEST_CANCEL:
                return onCancelGameRequest;
            case OPERATION_TYPE_GAME_REQUEST_CONFIRM:
                return onConfirmGameRequest;
            case OPERATION_TYPE_GAME_IN_PROGRESS_RESUME:
                return onResumeGameInProgress;
            case OPERATION_TYPE_FINISHED_GAME_VIEW:
                return onViewFinishedGame;
            case OPERATION_TYPE_GAME_IN_PROGRESS_RESIGN:
            case OPERATION_TYPE_FINISHED_GAME_EMAIL_RESULT:
            case OPERATION_TYPE_FINISHED_GAME_DELETE:
                // Returning undefined causes the "not yet implemented" dialog
                // to pop up when the user attempts the operation.
                return undefined;
            default:
                throw new Error("Unsupported operation type: " + operationType);
        }
    }

    function onSubmitNewGameRequest(event)
    {
        var requestedBoardSize = $("#" + ID_INPUT_NEW_GAME_REQUEST_MODAL_BOARD_SIZE).val();
        var requestedStoneColor = $("#" + ID_INPUT_NEW_GAME_REQUEST_MODAL_STONE_COLOR).val();
        var requestedHandicap = $("#" + ID_INPUT_NEW_GAME_REQUEST_MODAL_HANDICAP).val();
        var requestedKomi = $("#" + ID_INPUT_NEW_GAME_REQUEST_MODAL_KOMI).val();
        var requestedKoRule = $("#" + ID_INPUT_NEW_GAME_REQUEST_MODAL_KO_RULE).val();
        var requestedScoringSystem = $("#" + ID_INPUT_NEW_GAME_REQUEST_MODAL_SCORING_SYSTEM).val();

        $("#" + ID_NEW_GAME_REQUEST_MODAL_FORM)[0].reset();
        $("#" + ID_NEW_GAME_REQUEST_MODAL).modal('hide');

        var appContainerID = ID_CONTAINER_GAME_REQUESTS;
        var numberOfColumns = NUMBER_OF_COLUMNS_GAME_REQUEST_TABLE;
        clearDataTableAndAddDataRetrievalPlaceholderMessage(appContainerID, numberOfColumns);

        var messageData =
            {
                requestedBoardSize: requestedBoardSize,
                requestedStoneColor: requestedStoneColor,
                requestedHandicap: requestedHandicap,
                requestedKomi: requestedKomi,
                requestedKoRule: requestedKoRule,
                requestedScoringSystem: requestedScoringSystem
            };
        // Triggers onSubmitNewGameRequestComplete
        sendWebSocketMessage(theWebSocket, WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEREQUEST, messageData);
    }

    function onSubmitNewGameRequestComplete(success, gameRequestPairing, errorMessage)
    {
        updateGameRequestsData();

        if (success)
        {
            if (gameRequestPairing !== undefined)
                showConfirmGameRequestPairingModal(gameRequestPairing);
        }
        else
        {
            // TODO: Show error message while data is updated in the background
        }
    }

    function showConfirmGameRequestPairingModal(gameRequestPairing)
    {
        var opponentDisplayName;
        var stoneColor;
        if (gameRequestPairing.blackPlayer.userID === theSession.userInfo.userID)
        {
            opponentDisplayName = gameRequestPairing.whitePlayer.displayName;
            stoneColor = colorToString(COLOR_BLACK).toLowerCase();
        }
        else
        {
            opponentDisplayName = gameRequestPairing.blackPlayer.displayName;
            stoneColor = colorToString(COLOR_WHITE).toLocaleLowerCase();
        }
        var boardSize = boardSizeToString(gameRequestPairing.boardSize);
        var handicap = handicapToString(gameRequestPairing.handicap);
        var komi = komiToString(gameRequestPairing.komi);
        var koRule = koRuleToString(gameRequestPairing.koRule);
        var scoringSystem = scoringSystemToString(gameRequestPairing.scoringSystem);

        $("#" + ID_CONFIRM_GAME_REQUEST_PAIRING_MODAL_OPPONENT_NAME).html(opponentDisplayName);
        $("#" + ID_CONFIRM_GAME_REQUEST_PAIRING_MODAL_STONE_COLOR).html(stoneColor);
        $("#" + ID_CONFIRM_GAME_REQUEST_PAIRING_MODAL_BOARD_SIZE).html(boardSize);
        $("#" + ID_CONFIRM_GAME_REQUEST_PAIRING_MODAL_HANDICAP).html(handicap);
        $("#" + ID_CONFIRM_GAME_REQUEST_PAIRING_MODAL_KOMI).html(komi);
        $("#" + ID_CONFIRM_GAME_REQUEST_PAIRING_MODAL_KO_RULE).html(koRule);
        $("#" + ID_CONFIRM_GAME_REQUEST_PAIRING_MODAL_SCORING_SYSTEM).html(scoringSystem);

        $("#" + ID_CONFIRM_GAME_REQUEST_PAIRING_MODAL).modal()
    }

    function onConfirmGameRequestPairing(event)
    {
        // TODO: send message to server, server updates game request state
    }

    function handleWebSocketMessage(event)
    {
        var webSocketMessage = JSON.parse(event.data);

        switch (webSocketMessage.messageType)
        {
            case WEBSOCKET_RESPONSE_TYPE_REGISTERACCOUNT:
                onRegistrationComplete(
                    webSocketMessage.data.success,
                    webSocketMessage.data.errorMessage);
                break;

            case WEBSOCKET_RESPONSE_TYPE_SUBMITNEWGAMEREQUEST:
                onSubmitNewGameRequestComplete(
                    webSocketMessage.data.success,
                    webSocketMessage.data.gameRequestPairing,
                    webSocketMessage.data.errorMessage);
                break;

            case WEBSOCKET_RESPONSE_TYPE_GETGAMEREQUESTS:
                onGetGameRequestsComplete(
                    webSocketMessage.data.success,
                    webSocketMessage.data.gameRequests,
                    webSocketMessage.data.errorMessage);
                break;

            case WEBSOCKET_RESPONSE_TYPE_CANCELGAMEREQUEST:
                onCancelGameRequestComplete(
                    webSocketMessage.data.success,
                    webSocketMessage.data.gameRequests,
                    webSocketMessage.data.errorMessage);
                break;

            case WEBSOCKET_RESPONSE_TYPE_GETGAMEREQUESTPAIRING:
                onConfirmGameRequestComplete(
                    webSocketMessage.data.success,
                    webSocketMessage.data.gameRequestPairing,
                    webSocketMessage.data.errorMessage);
                break;

            default:
                // Ignore all messages that we don't handle here
                break;
        }
    }
})();
