// ----------------------------------------------------------------------
// This file contains code that implements an AngularJS service for sending
// requests and asynchronously receiving requests via a WebSocket.
//
// A more elaborate version of a WebSocket service is presented here:
// http://clintberry.com/2013/angular-js-websocket-service/
// ----------------------------------------------------------------------

"use strict";

// The WebSocket service expects a dependency to be injected that provides
// it with the configuration necessary to set up the WebSocket. The
// dependency object must have this structure:
//
// var webSocketConfig = {
//     hostname : "example.com,
//     port : 12345
// };
//
// The service starts its life in the "not ready" state. When the WebSocket
// connection becomes established the service changes its state to the
// "is ready" state. Service consumers can query the service state via the
// isReady() function. Service consumers can add an event listener for the
// "serviceIsReady" event to get notified when the service becomes ready.
//
// The service has at least one dedicated function per WebSocket request
// type. The caller of such a function supplies the information necessary
// for the request as regular function parameters. The caller thus does
// not need to convern itself with WebSocket message types or with crafting
// the WebSocket message data object.
//
// The service allows consumers to register listeners (callback) for incoming
// messages. These can be responses to previously sent requests, or
// "spontaneous" messages sent by the server to notify this client about
// events that occurred in another client (e.g. a new game move was submitted
// by the player in another client). It is possible to have more than one
// listener (callback) per message type.
//
// The service allows a single error handler to be registered. This error
// handler is invoked if any WebSocket communication error occurs. If no
// error handler is registered the service provides its own default error
// handler which displays the error message using a standard alert().
lg4wApp.service(ANGULARNAME_SERVICE_WEBSOCKET, [ANGULARNAME_CONSTANT_WEBSOCKETCONFIG, "$log", function(webSocketConfig, $log) {

    // ----------------------------------------------------------------------
    // Set up the WebSocket
    // ----------------------------------------------------------------------
    var webSocketUrl =
        "ws://"
        + webSocketConfig.hostname
        + ":"
        + webSocketConfig.port;
    var theWebSocket = new WebSocket(webSocketUrl);

    var messageReceiveDelayInMilliseconds = webSocketConfig.messageReceiveDelayInMilliseconds;
    if (messageReceiveDelayInMilliseconds > 0)
    {
        $log.warn("WARNING: Receiving of all WebSocket messages will be delayed by " + messageReceiveDelayInMilliseconds + " milliseconds! Fix the server-side configuration if this is unintentional.");
    }

    theWebSocket.addEventListener("open", function(event) {
        handleServiceIsReady();
    });

    theWebSocket.addEventListener("close", function(event) {
        handleServiceIsNotReady();
    });

    if (messageReceiveDelayInMilliseconds > 0)
    {
        theWebSocket.addEventListener("message", function(event) {
            setTimeout(function() {
                handleWebSocketMessage(event);
            }, messageReceiveDelayInMilliseconds);
        });
    }
    else
    {
        theWebSocket.addEventListener("message", function(event) {
            handleWebSocketMessage(event);
        });
    }

    theWebSocket.addEventListener("error", function(event) {
        handleServiceIsNotReady();

        // TODO: Add better error message. The current error message
        // only makes sense to a developer.
        var errorMessage = ANGULARNAME_SERVICE_WEBSOCKET + ": WebSocket error! Please check if the server is running. Reload the page after restarting the server.";
        $log.error(errorMessage);

        handleError(errorMessage);
    });

    // ----------------------------------------------------------------------
    // Service is ready handling
    // ----------------------------------------------------------------------

    var isServiceReady = false;

    this.isReady = function()
    {
        return isServiceReady;
    };

    function handleServiceIsReady()
    {
        isServiceReady = true;

        $log.debug(ANGULARNAME_SERVICE_WEBSOCKET + ": Service is ready");

        // Iterate over a copy in case the handler wants to remove itself
        var listenersCopy = eventListeners.serviceIsReady.slice(0);
        listenersCopy.forEach(function(listener) {
            listener();
        });
    }

    function handleServiceIsNotReady()
    {
        // This is not necessarily an error - this function is also called
        // when the user reloads the page and the WebSocket shuts down as
        // the last action before the JavaScript code is discarded.
        $log.debug(ANGULARNAME_SERVICE_WEBSOCKET + ": Service is NOT ready");

        isServiceReady = false;
    }

    // ----------------------------------------------------------------------
    // Error handling
    // ----------------------------------------------------------------------

    // The service has a default error handler that simply shows an alert
    // with the error message.
    var defaultErrorHandler = function(errorMessage)
    {
        alert(errorMessage);
    };
    var errorHandler = defaultErrorHandler;

    // Configures the service with a custom error handler. If an error
    // occurs, the service invokes the error handler with an error message
    // as its sole function parameter.
    this.setErrorHandler = function(customErrorHandler) {
        errorHandler = customErrorHandler;
    };

    function handleError(errorMessage)
    {
        console.error(ANGULARNAME_SERVICE_WEBSOCKET + ": " + errorMessage);
        if (errorHandler !== undefined)
            errorHandler(errorMessage);
    }

    // ----------------------------------------------------------------------
    // Event listeners
    // ----------------------------------------------------------------------

    var eventListeners = {
        serviceIsReady: [],
        login: [],
        logout: [],
        registerAccount: [],
        validateSession: [],
        submitNewGameRequest: [],
        getGameRequests: [],
        cancelGameRequest: [],
        getGameRequestPairing: [],
        confirmGameRequestPairing: [],
        getGamesInProgress: [],
        getGame: [],
        submitNewGameMove: [],
        submitNewScoreProposal: [],
        acceptScoreProposal: [],
        getFinishedGames: [],
        resignGame: [],
        gameRequestPairingFound: []
    };

    // The serviceIsReady event is invoked after the WebSocket connection
    // is established. Currently the service has no support for
    // re-establishing a connection that has become dysfunct, so the
    // serviceIsReady event currently occurs exactly once during the
    // lifecycle of the service.
    this.addServiceIsReadyListener = function(listener) {
        eventListeners.serviceIsReady.push(listener);
    };

    this.removeServiceIsReadyListener = function(listener)
    {
        var index = eventListeners.serviceIsReady.indexOf(listener);
        if (-1 !== index)
            eventListeners.serviceIsReady.splice(index, 1);
    };

    this.addLoginListener = function(listener) {
        eventListeners.login.push(listener);
    };

    this.removeLoginListener = function(listener)
    {
        var index = eventListeners.login.indexOf(listener);
        if (-1 !== index)
            eventListeners.login.splice(index, 1);
    };

    this.addLogoutListener = function(listener) {
        eventListeners.logout.push(listener);
    };

    this.removeLogoutListener = function(listener)
    {
        var index = eventListeners.logout.indexOf(listener);
        if (-1 !== index)
            eventListeners.logout.splice(index, 1);
    };

    this.addRegisterAccountListener = function(listener) {
        eventListeners.registerAccount.push(listener);
    };

    this.removeRegisterAccountListener = function(listener)
    {
        var index = eventListeners.registerAccount.indexOf(listener);
        if (-1 !== index)
            eventListeners.registerAccount.splice(index, 1);
    };

    this.addValidateSessionListener = function(listener) {
        eventListeners.validateSession.push(listener);
    };

    this.removeValidateSessionListener = function(listener)
    {
        var index = eventListeners.validateSession.indexOf(listener);
        if (-1 !== index)
            eventListeners.validateSession.splice(index, 1);
    };

    this.addSubmitNewGameRequestListener = function(listener) {
        eventListeners.submitNewGameRequest.push(listener);
    };

    this.removeSubmitNewGameRequestListener = function(listener)
    {
        var index = eventListeners.submitNewGameRequest.indexOf(listener);
        if (-1 !== index)
            eventListeners.submitNewGameRequest.splice(index, 1);
    };

    this.addGetGameRequestsListener = function(listener) {
        eventListeners.getGameRequests.push(listener);
    };

    this.removeGetGameRequestsListener = function(listener)
    {
        var index = eventListeners.getGameRequests.indexOf(listener);
        if (-1 !== index)
            eventListeners.getGameRequests.splice(index, 1);
    };

    this.addCancelGameRequestListener = function(listener) {
        eventListeners.cancelGameRequest.push(listener);
    };

    this.removeCancelGameRequestListener = function(listener)
    {
        var index = eventListeners.cancelGameRequest.indexOf(listener);
        if (-1 !== index)
            eventListeners.cancelGameRequest.splice(index, 1);
    };

    this.addGetGameRequestPairingListener = function(listener) {
        eventListeners.getGameRequestPairing.push(listener);
    };

    this.removeGetGameRequestPairingListener = function(listener)
    {
        var index = eventListeners.getGameRequestPairing.indexOf(listener);
        if (-1 !== index)
            eventListeners.getGameRequestPairing.splice(index, 1);
    };

    this.addConfirmGameRequestPairingListener = function(listener) {
        eventListeners.confirmGameRequestPairing.push(listener);
    };

    this.removeConfirmGameRequestPairingListener = function(listener)
    {
        var index = eventListeners.confirmGameRequestPairing.indexOf(listener);
        if (-1 !== index)
            eventListeners.confirmGameRequestPairing.splice(index, 1);
    };

    this.addGetGamesInProgressListener = function(listener) {
        eventListeners.getGamesInProgress.push(listener);
    };

    this.removeGetGamesInProgressListener = function(listener)
    {
        var index = eventListeners.getGamesInProgress.indexOf(listener);
        if (-1 !== index)
            eventListeners.getGamesInProgress.splice(index, 1);
    };

    this.addGetGameListener = function(listener) {
        eventListeners.getGame.push(listener);
    };

    this.removeGetGameListener = function(listener)
    {
        var index = eventListeners.getGame.indexOf(listener);
        if (-1 !== index)
            eventListeners.getGame.splice(index, 1);
    };

    this.addSubmitNewGameMoveListener = function(listener) {
        eventListeners.submitNewGameMove.push(listener);
    };

    this.removeSubmitNewGameMoveListener = function(listener)
    {
        var index = eventListeners.submitNewGameMove.indexOf(listener);
        if (-1 !== index)
            eventListeners.submitNewGameMove.splice(index, 1);
    };


    this.addSubmitNewScoreProposalListener = function(listener) {
        eventListeners.submitNewScoreProposal.push(listener);
    };

    this.removeSubmitNewScoreProposalListener = function(listener)
    {
        var index = eventListeners.submitNewScoreProposal.indexOf(listener);
        if (-1 !== index)
            eventListeners.submitNewScoreProposal.splice(index, 1);
    };

    this.addAcceptScoreProposalListener = function(listener) {
        eventListeners.acceptScoreProposal.push(listener);
    };

    this.removeAcceptScoreProposalListener = function(listener)
    {
        var index = eventListeners.acceptScoreProposal.indexOf(listener);
        if (-1 !== index)
            eventListeners.acceptScoreProposal.splice(index, 1);
    };

    this.addGetFinishedGamesListener = function(listener) {
        eventListeners.getFinishedGames.push(listener);
    };

    this.removeGetFinishedGamesListener = function(listener)
    {
        var index = eventListeners.getFinishedGames.indexOf(listener);
        if (-1 !== index)
            eventListeners.getFinishedGames.splice(index, 1);
    };

    this.addResignGameListener = function(listener) {
        eventListeners.resignGame.push(listener);
    };

    this.removeResignGameListener = function(listener)
    {
        var index = eventListeners.getFinishedGames.indexOf(listener);
        if (-1 !== index)
            eventListeners.getFinishedGames.splice(index, 1);
    };

    this.addGameRequestPairingFoundListener = function(listener) {
        eventListeners.gameRequestPairingFound.push(listener);
    };

    this.removeGameRequestPairingFoundListener = function(listener)
    {
        var index = eventListeners.gameRequestPairingFound.indexOf(listener);
        if (-1 !== index)
            eventListeners.gameRequestPairingFound.splice(index, 1);
    };

    // ----------------------------------------------------------------------
    // Generic functions for sending messages
    // ----------------------------------------------------------------------

    function generateWebSocketMessage(messageType, messageData)
    {
        var message =
            {
                messageType: messageType,
                data: messageData
            };

        return JSON.stringify(message);
    }

    function sendWebSocketMessage(webSocket, messageType, messageData)
    {
        var message = generateWebSocketMessage(
            messageType,
            messageData);

        webSocket.send(message);
    }

    // ----------------------------------------------------------------------
    // Send messages
    // ----------------------------------------------------------------------

    this.login = function(emailAddress, password) {
        var messageType = WEBSOCKET_REQUEST_TYPE_LOGIN;
        var messageData =
            {
                emailAddress: emailAddress,
                password: password
            };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.logout = function() {
        var messageType = WEBSOCKET_REQUEST_TYPE_LOGOUT;
        var messageData = { };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.registerAccount = function(emailAddress, displayName, password) {
        var messageType = WEBSOCKET_REQUEST_TYPE_REGISTERACCOUNT;
        var messageData =
            {
                emailAddress: emailAddress,
                displayName: displayName,
                password: password
            };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.validateSession = function(sessionKey) {
        var messageType = WEBSOCKET_REQUEST_TYPE_VALIDATESESSION;
        var messageData = { sessionKey: sessionKey };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.submitNewGameRequest = function(
        requestedBoardSize,
        requestedStoneColor,
        requestedHandicap,
        requestedKomi,
        requestedKoRule,
        requestedScoringSystem)
    {
        var messageType = WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEREQUEST;
        var messageData =
            {
                requestedBoardSize: requestedBoardSize,
                requestedStoneColor: requestedStoneColor,
                requestedHandicap: requestedHandicap,
                requestedKomi: requestedKomi,
                requestedKoRule: requestedKoRule,
                requestedScoringSystem: requestedScoringSystem
            };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.getGameRequests = function() {
        var messageType = WEBSOCKET_REQUEST_TYPE_GETGAMEREQUESTS;
        var messageData = { };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.cancelGameRequest = function(gameRequestID) {
        var messageType = WEBSOCKET_REQUEST_TYPE_CANCELGAMEREQUEST;
        var messageData =
            {
                gameRequestID: gameRequestID
            };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.getGameRequestPairing = function(gameRequestID) {
        var messageType = WEBSOCKET_REQUEST_TYPE_GETGAMEREQUESTPAIRING;
        var messageData =
            {
                gameRequestID: gameRequestID
            };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.confirmGameRequestPairing = function(gameRequestID) {
        var messageType = WEBSOCKET_REQUEST_TYPE_CONFIRMGAMEREQUESTPAIRING;
        var messageData =
            {
                gameRequestID: gameRequestID
            };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.getGamesInProgress = function() {
        var messageType = WEBSOCKET_REQUEST_TYPE_GETGAMESINPROGRESS;
        var messageData = { };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.getGame = function(gameID) {
        var messageType = WEBSOCKET_REQUEST_TYPE_GETGAME;
        var messageData =
            {
                gameID: gameID
            };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.submitNewGameMovePlay = function(gameID, moveColor, vertexX, vertexY) {
        var messageType = WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEMOVE;
        var messageData =
            {
                gameID: gameID,
                moveType: GOMOVE_TYPE_PLAY,
                moveColor: moveColor,
                vertexX: vertexX,
                vertexY: vertexY
            };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.submitNewGameMovePass = function(gameID, moveColor) {
        var messageType = WEBSOCKET_REQUEST_TYPE_SUBMITNEWGAMEMOVE;
        var messageData =
            {
                gameID: gameID,
                moveType: GOMOVE_TYPE_PASS,
                moveColor: moveColor
            };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.submitNewScoreProposal = function(gameID, scoreDetails) {
        var messageType = WEBSOCKET_REQUEST_TYPE_SUBMITNEWSCOREPROPOSAL;
        var messageData =
            {
                gameID: gameID,
                scoreDetails: scoreDetails
            };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.acceptScoreProposal = function(gameID, resultType, winningStoneColor, winningPoints) {
        var messageType = WEBSOCKET_REQUEST_TYPE_ACCEPTSCOREPROPOSAL;
        var messageData =
            {
                gameID: gameID,
                resultType: resultType,
                winningStoneColor: winningStoneColor,
                winningPoints: winningPoints
            };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.getFinishedGames = function() {
        var messageType = WEBSOCKET_REQUEST_TYPE_GETFINISHEDGAMES;
        var messageData = { };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    this.resignGame = function(gameID) {
        var messageType = WEBSOCKET_REQUEST_TYPE_RESIGNGAME;
        var messageData =
            {
                gameID: gameID
            };
        sendWebSocketMessage(theWebSocket, messageType, messageData);
    };

    // ----------------------------------------------------------------------
    // Process incoming messages
    // ----------------------------------------------------------------------

    function handleWebSocketMessage(event)
    {
        var webSocketMessage = JSON.parse(event.data);

        switch (webSocketMessage.messageType)
        {
            case WEBSOCKET_RESPONSE_TYPE_LOGIN:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.login.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.sessionKey,
                        webSocketMessage.data.userInfo,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_LOGOUT:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.logout.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_REGISTERACCOUNT:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.registerAccount.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_VALIDATESESSION:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.validateSession.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.sessionKey,
                        webSocketMessage.data.userInfo,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_SUBMITNEWGAMEREQUEST:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.submitNewGameRequest.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.gameRequestPairing,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_GETGAMEREQUESTS:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.getGameRequests.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.gameRequests,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_CANCELGAMEREQUEST:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.cancelGameRequest.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.gameRequests,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_GETGAMEREQUESTPAIRING:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.getGameRequestPairing.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.gameRequestPairing,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_CONFIRMGAMEREQUESTPAIRING:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.confirmGameRequestPairing.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.gameRequests,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_GETGAMESINPROGRESS:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.getGamesInProgress.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.gamesInProgress,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_GETGAME:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.getGame.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.game,
                        webSocketMessage.data.gameMoves,
                        webSocketMessage.data.score,
                        webSocketMessage.data.scoreDetails,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_SUBMITNEWGAMEMOVE:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.submitNewGameMove.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.gameMove,
                        webSocketMessage.data.gameState,
                        webSocketMessage.data.errorMessage);
                });
                break;


            case WEBSOCKET_RESPONSE_TYPE_SUBMITNEWSCOREPROPOSAL:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.submitNewScoreProposal.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.score,
                        webSocketMessage.data.scoreDetails);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_ACCEPTSCOREPROPOSAL:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.acceptScoreProposal.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.gameID,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_GETFINISHEDGAMES:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.getFinishedGames.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.finishedGames,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_RESPONSE_TYPE_RESIGNGAME:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.resignGame.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.game,
                        webSocketMessage.data.errorMessage);
                });
                break;

            case WEBSOCKET_MESSAGE_TYPE_GAMEREQUESTPAIRINGFOUND:
                // Iterate over a copy in case the handler wants to remove itself
                var listenersCopy = eventListeners.gameRequestPairingFound.slice(0);
                listenersCopy.forEach(function(listener) {
                    listener(
                        webSocketMessage.data.success,
                        webSocketMessage.data.gameRequests,
                        webSocketMessage.data.errorMessage);
                });
                break;

            default:
                var errorMessage = "Received unsupported message type from WebSocket: " + webSocketMessage.messageType;
                handleError(errorMessage);
                break;
        }
    }
}]);
