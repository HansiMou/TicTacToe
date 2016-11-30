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
                var tempDirection = { shiftX: 1, shiftY: 0 };
                var count = 0;
                var possibleMoves = [];
                possibleMoves.push({ shiftX: 1, shiftY: 0 }, { shiftX: -1, shiftY: 0 }, { shiftX: 0, shiftY: 1 }, { shiftX: 0, shiftY: -1 });
                for (var j = 0; j < possibleMoves.length; j++) {
                    var move = possibleMoves[j];
                    if (!isValid(move, board, snake)) {
                        continue;
                    }
                    if (hasFoodThisWay(head, move, board)) {
                        tempDirection = move;
                        console.log('find food');
                        break;
                    }
                    tempDirection = move;
                }
                console.log(tempDirection);
                res.push(tempDirection);
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
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map