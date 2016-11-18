;
var game;
(function (game) {
    // Global variables are cleared when getting updateUI.
    // I export all variables to make it easy to debug in the browser by
    // simply typing in the console, e.g.,
    // game.currentUpdateUI
    game.currentUpdateUI = null;
    game.didMakeMove = false; // You can only make one move per updateUI
    game.animationEndedTimeout = null;
    game.state = null;
    game.boardSize = gameLogic.ROWS;
    game.gameSpeed = 1000;
    game.action = null;
    game.snakeOneMove = null;
    game.snakeTwoMove = null;
    game.snakeThreeMove = null;
    function init() {
        resizeGameAreaService.setWidthToHeight(1);
        moveService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 3,
            updateUI: updateUI,
            gotMessageFromPlatform: null,
        });
        game.action = $interval(move, 500);
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
            if (isMyTurn())
                makeMove(gameLogic.createInitialMove());
        }
        else {
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            game.animationEndedTimeout = $timeout(animationEndedCallback, 500);
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
    function yourPlayerIndex() {
        return game.currentUpdateUI.yourPlayerIndex;
    }
    function isComputer() {
        return game.currentUpdateUI.playersInfo[game.currentUpdateUI.yourPlayerIndex].playerId === '';
    }
    function isComputerTurn() {
        return isMyTurn() && isComputer();
    }
    function isHumanTurn() {
        return isMyTurn() && !isComputer();
    }
    function isMyTurn() {
        return !game.didMakeMove &&
            game.currentUpdateUI.move.turnIndexAfterMove >= 0 &&
            game.currentUpdateUI.yourPlayerIndex === game.currentUpdateUI.move.turnIndexAfterMove; // it's my turn
    }
    function move() {
        if (!isHumanTurn())
            return;
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        var nextMove = null;
        try {
            nextMove = gameLogic.createMove(game.state, [angular.copy(game.snakeOneMove), angular.copy(game.snakeTwoMove)], 100000, game.currentUpdateUI.move.turnIndexAfterMove);
            game.snakeOneMove = null;
            game.snakeTwoMove = null;
            game.snakeThreeMove = null;
        }
        catch (e) {
            $interval.cancel(game.action);
            log.info("Game ended");
            return;
        }
        // Move is legal, make it!
        makeMove(nextMove);
    }
    game.move = move;
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
    function shouldSlowlyAppear(row, col) {
        return game.state.delta &&
            game.state.delta.row === row && game.state.delta.col === col;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
    function getNumber() {
        var res = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            res.push(i);
        }
        return res;
    }
    game.getNumber = getNumber;
    function keyDown(keyCode) {
        // up arrow
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
        // y
        if (keyCode == 89) {
            if (game.snakeThreeMove == null) {
                game.snakeThreeMove = { shiftX: -1, shiftY: 0 };
            }
        }
        // h
        if (keyCode == 72) {
            if (game.snakeThreeMove == null) {
                game.snakeThreeMove = { shiftX: 1, shiftY: 0 };
            }
        }
        // g
        if (keyCode == 71) {
            if (game.snakeThreeMove == null) {
                game.snakeThreeMove = { shiftX: 0, shiftY: -1 };
            }
        }
        // j
        if (keyCode == 74) {
            if (game.snakeThreeMove == null) {
                game.snakeThreeMove = { shiftX: 0, shiftY: 1 };
            }
        }
        if (game.snakeOneMove != null) {
            var oldDirection = game.currentUpdateUI.stateBeforeMove.boardWithSnakes.snakes[0].currentDirection;
            if ((oldDirection.shiftX) == (game.snakeOneMove.shiftX) &&
                (oldDirection.shiftY) == (game.snakeOneMove.shiftY)) {
                game.snakeOneMove = null;
            }
        }
        if (game.snakeTwoMove != null) {
            var oldDirection = game.currentUpdateUI.stateBeforeMove.boardWithSnakes.snakes[1].currentDirection;
            if ((oldDirection.shiftX) == (game.snakeTwoMove.shiftX) &&
                (oldDirection.shiftY) == (game.snakeTwoMove.shiftY)) {
                game.snakeTwoMove = null;
            }
        }
        if (game.snakeThreeMove != null && game.currentUpdateUI.stateBeforeMove.boardWithSnakes.snakes.length == 3) {
            var oldDirection = game.currentUpdateUI.stateBeforeMove.boardWithSnakes.snakes[2].currentDirection;
            if ((oldDirection.shiftX) == (game.snakeThreeMove.shiftX) &&
                (oldDirection.shiftY) == (game.snakeThreeMove.shiftY)) {
                game.snakeThreeMove = null;
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