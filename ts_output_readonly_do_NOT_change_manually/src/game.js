;
var game;
(function (game) {
    // Global variables are cleared when getting updateUI.
    // I export all variables to make it easy to debug in the browser by
    // simply typing in the console, e.g.,
    // game.currentUpdateUI
    game.ALLTIME = 120 * 1000;
    game.GameSpeed = 500;
    game.BoardSize = gameLogic.ROWS;
    game.ComputerOrHuman = [1, 1];
    game.NumberOfFood = gameLogic.NumberOfFood;
    game.NumberOfBarrier = gameLogic.NumberOfBarrier;
    game.currentUpdateUI = null;
    game.didMakeMove = false; // You can only make one move per updateUI
    game.animationEndedTimeout = null;
    game.state = null;
    game.action = null;
    game.computerAction = null;
    game.snakeOneMove = null;
    game.snakeTwoMove = null;
    game.snakeThreeMove = null;
    game.RemainingTime = game.ALLTIME;
    function init() {
        resizeGameAreaService.setWidthToHeight(1);
        moveService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 3,
            updateUI: updateUI,
            gotMessageFromPlatform: null,
        });
    }
    game.init = init;
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        game.didMakeMove = false; // Only one move per updateUI
        game.currentUpdateUI = params;
        clearAnimationTimeout();
        game.state = params.move.stateAfterMove;
        if (isFirstMove()) {
            game.state = gameLogic.getInitialState();
        }
    }
    game.updateUI = updateUI;
    function animationEndedCallback() {
        log.info("Animation ended");
        maybeSendComputerMove();
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            $timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    function maybeSendComputerMove() {
        // if (!isComputerTurn()) return;
        // let move = aiService.findComputerMove(currentUpdateUI.move);
        // log.info("Computer move: ", move);
        // makeMove(move);
    }
    function makeMove(move) {
        if (game.didMakeMove) {
            return;
        }
        game.didMakeMove = true;
        moveService.makeMove(move);
    }
    function isFirstMove() {
        return !game.currentUpdateUI.move.stateAfterMove;
    }
    function move() {
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        var nextMove = null;
        try {
            nextMove = gameLogic.createMove(game.state, [angular.copy(game.snakeOneMove), angular.copy(game.snakeTwoMove)], game.RemainingTime -= game.GameSpeed, game.currentUpdateUI.move.turnIndexAfterMove);
            game.snakeOneMove = null;
            game.snakeTwoMove = null;
            game.snakeThreeMove = null;
        }
        catch (e) {
            $interval.cancel(game.action);
            game.currentUpdateUI.end = true;
            log.error(e);
            return;
        }
        // Move is legal, make it!
        makeMove(nextMove);
    }
    game.move = move;
    function computerMove() {
        if (game.currentUpdateUI.move.stateAfterMove) {
            var computerMoves = aiService.findComputerMove(game.ComputerOrHuman, game.currentUpdateUI.move.stateAfterMove.boardWithSnakes);
            if (game.ComputerOrHuman[0] == -1) {
                game.snakeOneMove = computerMoves[0];
            }
            if (game.ComputerOrHuman[1] == -1) {
                game.snakeTwoMove = computerMoves[1];
            }
            if (game.ComputerOrHuman[2] == -1) {
                game.snakeThreeMove = computerMoves[2];
            }
        }
    }
    function resetEverything() {
        $interval.cancel(game.action);
        game.action = null;
        game.RemainingTime = game.ALLTIME;
        game.currentUpdateUI.move.stateAfterMove = null;
        game.currentUpdateUI.end = false;
        updateUI(game.currentUpdateUI);
    }
    function isFood(row, col) {
        return game.state.boardWithSnakes.board[row][col] === 'FOOD';
    }
    game.isFood = isFood;
    function isBarrier(row, col) {
        return game.state.boardWithSnakes.board[row][col] === 'BARRIER';
    }
    game.isBarrier = isBarrier;
    function isSnakeOne(row, col) {
        return game.state.boardWithSnakes.board[row][col] === 'SNAKE1';
    }
    game.isSnakeOne = isSnakeOne;
    function isSnakeTwo(row, col) {
        return game.state.boardWithSnakes.board[row][col] === 'SNAKE2';
    }
    game.isSnakeTwo = isSnakeTwo;
    function isSnakeThree(row, col) {
        return game.state.boardWithSnakes.board[row][col] === 'SNAKE3';
    }
    game.isSnakeThree = isSnakeThree;
    function isDeadSnake(row, col) {
        return game.state.boardWithSnakes.board[row][col] === 'STONE';
    }
    game.isDeadSnake = isDeadSnake;
    function getNumber() {
        var res = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            res.push(i);
        }
        return res;
    }
    game.getNumber = getNumber;
    function getSnakeLength(index) {
        if (isFirstMove()) {
            return 1;
        }
        else {
            return game.currentUpdateUI.move.stateAfterMove.boardWithSnakes.snakes[index].headToTail.length;
        }
    }
    game.getSnakeLength = getSnakeLength;
    function changeFoodNumber() {
        gameLogic.NumberOfFood = game.NumberOfFood;
        resetEverything();
    }
    game.changeFoodNumber = changeFoodNumber;
    function changeBarrierNumber() {
        gameLogic.NumberOfBarrier = game.NumberOfBarrier;
        resetEverything();
    }
    game.changeBarrierNumber = changeBarrierNumber;
    function isDraw() {
        if (game.currentUpdateUI.end == true) {
            return gameLogic.getWinner(game.currentUpdateUI.move.stateAfterMove.boardWithSnakes) === '';
        }
        return false;
    }
    game.isDraw = isDraw;
    function isFinished() {
        return game.currentUpdateUI.end;
    }
    game.isFinished = isFinished;
    function getWinnerColor() {
        var winner = gameLogic.getWinner(game.currentUpdateUI.move.stateAfterMove.boardWithSnakes);
        if (winner === '1') {
            return 'blue';
        }
        else if (winner === '2') {
            return 'red';
        }
        else {
            return 'yellow';
        }
    }
    game.getWinnerColor = getWinnerColor;
    function keyDown(keyCode) {
        // space to start the game or stop the game
        if (keyCode == 32) {
            if (game.currentUpdateUI.end) {
                resetEverything();
            }
            else if (game.action == null) {
                game.action = $interval(move, game.GameSpeed);
                game.computerAction = $interval(computerMove, game.GameSpeed);
            }
            else {
                $interval.cancel(game.action);
                game.action = null;
            }
        }
        // up arrow
        if (game.ComputerOrHuman[0] == 1) {
            if (keyCode == 38) {
                if (game.snakeOneMove == null) {
                    game.snakeOneMove = { shiftX: -1, shiftY: 0 };
                }
            }
            // down arrow
            if (keyCode == 40) {
                if (game.snakeOneMove == null) {
                    game.snakeOneMove = { shiftX: 1, shiftY: 0 };
                }
            }
            // left arrow
            if (keyCode == 37) {
                if (game.snakeOneMove == null) {
                    game.snakeOneMove = { shiftX: 0, shiftY: -1 };
                }
            }
            // right arrow
            if (keyCode == 39) {
                if (game.snakeOneMove == null) {
                    game.snakeOneMove = { shiftX: 0, shiftY: 1 };
                }
            }
        }
        if (game.ComputerOrHuman[1] == 1) {
            // w
            if (keyCode == 87) {
                if (game.snakeTwoMove == null) {
                    game.snakeTwoMove = { shiftX: -1, shiftY: 0 };
                }
            }
            // s
            if (keyCode == 83) {
                if (game.snakeTwoMove == null) {
                    game.snakeTwoMove = { shiftX: 1, shiftY: 0 };
                }
            }
            // a
            if (keyCode == 65) {
                if (game.snakeTwoMove == null) {
                    game.snakeTwoMove = { shiftX: 0, shiftY: -1 };
                }
            }
            // d
            if (keyCode == 68) {
                if (game.snakeTwoMove == null) {
                    game.snakeTwoMove = { shiftX: 0, shiftY: 1 };
                }
            }
        }
        if (game.currentUpdateUI.stateBeforeMove) {
            if (game.ComputerOrHuman[0] == 1 && game.snakeOneMove != null) {
                var oldDirection = game.currentUpdateUI.stateBeforeMove.boardWithSnakes.snakes[0].currentDirection;
                if ((oldDirection.shiftX) == (game.snakeOneMove.shiftX) &&
                    (oldDirection.shiftY) == (game.snakeOneMove.shiftY)) {
                    game.snakeOneMove = null;
                }
            }
            if (game.ComputerOrHuman[1] == 1 && game.snakeTwoMove != null) {
                var oldDirection = game.currentUpdateUI.stateBeforeMove.boardWithSnakes.snakes[1].currentDirection;
                if ((oldDirection.shiftX) == (game.snakeTwoMove.shiftX) &&
                    (oldDirection.shiftY) == (game.snakeTwoMove.shiftY)) {
                    game.snakeTwoMove = null;
                }
            }
        }
    }
    game.keyDown = keyDown;
})(game || (game = {}));
angular.module('myApp', ['gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    game.init();
});
//# sourceMappingURL=game.js.map