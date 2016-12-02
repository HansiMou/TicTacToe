var aiService;
(function (aiService) {
    /** Returns the move that the computer player should do for the given state in move. */
    function findComputerMove(computerOrHuman, boardWithSnake) {
        var res = [];
        for (var i = 0; i < computerOrHuman.length; i++) {
            if (computerOrHuman[i] == 1 || boardWithSnake.snakes[i].dead) {
                res.push(null);
            }
            else {
                var board = boardWithSnake.board;
                var snake = boardWithSnake.snakes[i];
                var head = boardWithSnake.snakes[i].headToTail[0];
                var foodDirection = null;
                var count = 0;
                var possibleMoves = [];
                var validMoves = [];
                possibleMoves.push({ shiftX: 1, shiftY: 0 }, { shiftX: -1, shiftY: 0 }, { shiftX: 0, shiftY: 1 }, { shiftX: 0, shiftY: -1 });
                for (var j = 0; j < possibleMoves.length; j++) {
                    var move = possibleMoves[j];
                    if (!isValid(move, board, snake)) {
                        continue;
                    }
                    if (hasFoodThisWay(head, move, board)) {
                        foodDirection = move;
                        console.log('find food');
                        break;
                    }
                    validMoves.push(move);
                }
                if (foodDirection) {
                    res.push(foodDirection);
                }
                else {
                    console.log(validMoves);
                    if (validMoves.length == 0) {
                        res.push(null);
                    }
                    else {
                        res.push(validMoves[0]);
                    }
                }
            }
        }
        return res;
    }
    aiService.findComputerMove = findComputerMove;
    function hasFoodThisWay(head, direction, board) {
        if (gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row + direction.shiftX, head.col + direction.shiftY, board)) {
            return false;
        }
        if (board[head.row + direction.shiftX][head.col + direction.shiftY] === 'FOOD') {
            return true;
        }
        if (gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row + 2 * direction.shiftX, head.col + 2 * direction.shiftY, board)) {
            return false;
        }
        if (board[head.row + 2 * direction.shiftX][head.col + 2 * direction.shiftY] === 'FOOD') {
            return true;
        }
        if (gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row + 3 * direction.shiftX, head.col + 3 * direction.shiftY, board)) {
            return false;
        }
        if (board[head.row + 3 * direction.shiftX][head.col + 3 * direction.shiftY] === 'FOOD') {
            return true;
        }
    }
    function isValid(newDirection, board, snake) {
        var head = snake.headToTail[0];
        var oldDirection = snake.currentDirection;
        return !gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row + newDirection.shiftX, head.col + newDirection.shiftY, board)
            && !(oldDirection.shiftX + newDirection.shiftX == 0 &&
                oldDirection.shiftY + newDirection.shiftY == 0);
    }
    function score(board, cell) {
        if (gameLogic.isBarrierOrBorderOrOpponentOrMySelf(cell.row, cell.col, board)) {
            return 0;
        }
        if (board[cell.row][cell.col] === 'FOOD') {
            return 100;
        }
        var score = 0;
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board.length; j++) {
                if (i == cell.row && j == cell.col) {
                    continue;
                }
            }
        }
    }
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map