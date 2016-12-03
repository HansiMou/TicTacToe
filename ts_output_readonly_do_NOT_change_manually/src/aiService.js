var aiService;
(function (aiService) {
    /** Returns the move that the computer player should do for the given state in move. */
    function findComputerMove(computerOrHuman, boardWithSnake) {
        var current = new Date().getTime();
        var res = [];
        for (var i = 0; i < computerOrHuman.length; i++) {
            if (computerOrHuman[i] == 1 || boardWithSnake.snakes[i].dead) {
                res.push(null);
            }
            else {
                var board = boardWithSnake.board;
                var snake = boardWithSnake.snakes[i];
                var head = boardWithSnake.snakes[i].headToTail[0];
                var possibleMoves = possibleDirections();
                var validMoves = [];
                var foodMove = null;
                for (var j = 0; j < possibleMoves.length; j++) {
                    var move = possibleMoves[j];
                    if (!isValid(move, board, snake)) {
                        continue;
                    }
                    if (hasFoodThisWay(head, move, board)) {
                        foodMove = move;
                        break;
                    }
                    validMoves.push(move);
                }
                if (foodMove) {
                    res.push(foodMove);
                }
                else {
                    var maxScore = -1;
                    var bestMove = null;
                    for (var i_1 = 0; i_1 < validMoves.length; i_1++) {
                        var move = validMoves[i_1];
                        var score = scoreCell(board, head.row + move.shiftX, head.col + move.shiftY);
                        if (score >= maxScore) {
                            maxScore = score;
                            bestMove = move;
                        }
                    }
                    res.push(bestMove);
                }
            }
        }
        //console.log(new Date().getTime() - current);
        return res;
    }
    aiService.findComputerMove = findComputerMove;
    function possibleDirections() {
        var possibleMoves = [];
        possibleMoves.push({ shiftX: 1, shiftY: 0 }, { shiftX: -1, shiftY: 0 }, { shiftX: 0, shiftY: 1 }, { shiftX: 0, shiftY: -1 });
        return possibleMoves;
    }
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
    function haveEnoughSpace(board, row, col) {
        var hasMore = true;
        var current = [];
        for (var i = 0; i < board.length * board.length; i++) {
            current.push(0);
        }
        var N = board.length;
        current[encode(row, col, N)] = 1;
        while (hasMore) {
            hasMore = false;
            for (var i = 0; i < board.length * board.length; i++) {
                if (current[i] == 0) {
                    continue;
                }
                var thisRow = (i - i % N) / N;
                var thisCol = i % N;
                var directions = possibleDirections();
                for (var j = 0; j < directions.length; j++) {
                    var direction = directions[j];
                    if (!gameLogic.isBarrierOrBorderOrOpponentOrMySelf(thisRow + direction.shiftX, thisCol + direction.shiftY, board)) {
                        var code = encode(thisRow + direction.shiftX, thisCol + direction.shiftY, N);
                        if (current[code] == 0) {
                            current[code] = 1;
                            hasMore = true;
                        }
                    }
                }
            }
            if (sizeOf(current) >= 20) {
                return true;
            }
        }
        if (sizeOf(current) < 20) {
            return false;
        }
        return true;
    }
    function sizeOf(x) {
        var count = 0;
        for (var i = 0; i < x.length; i++) {
            if (x[i] == 1) {
                count++;
            }
        }
        return count;
    }
    function encode(row, col, N) {
        return row * N + col;
    }
    function scoreCell(board, row, col) {
        if (gameLogic.isBarrierOrBorderOrOpponentOrMySelf(row, col, board)) {
            return -1;
        }
        if (!haveEnoughSpace(board, row, col)) {
            return 0;
        }
        var score = 0;
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board.length; j++) {
                if (i == row && j == col) {
                    continue;
                }
                if (board[i][j] == 'FOOD') {
                    var gap = 1.0 / (Math.abs(i - row) + Math.abs(j - col));
                    score = score + gap;
                }
            }
        }
        return score;
    }
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map