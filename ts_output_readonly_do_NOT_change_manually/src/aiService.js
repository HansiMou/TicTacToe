var aiService;
(function (aiService) {
    /** Returns the move that the computer player should do for the given state in move. */
    function findComputerMove(computerOrHuman, boardWithSnake) {
        var res = [];
        for (var i = 0; i < computerOrHuman.length; i++) {
            if (computerOrHuman[i] == 1) {
                res.push(null);
            }
            else {
                var board = boardWithSnake.board;
                var head = boardWithSnake.snakes[i].headToTail[0];
                var tempDirection = { shiftX: 1, shiftY: 0 };
                var count = 0;
                if (head.row + 1 < gameLogic.ROWS) {
                    if (board[head.row + 1][head.col] === 'FOOD') {
                        tempDirection = { shiftX: 1, shiftY: 0 };
                        res.push(tempDirection);
                        continue;
                    }
                    else if (!gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row + 1, head.col, board)) {
                        count++;
                        if (Math.floor(Math.random() * count) == 0) {
                            tempDirection = { shiftX: 1, shiftY: 0 };
                        }
                    }
                }
                if (head.row - 1 >= 0) {
                    if (board[head.row - 1][head.col] === 'FOOD') {
                        tempDirection = { shiftX: -1, shiftY: 0 };
                        res.push(tempDirection);
                        continue;
                    }
                    else if (!gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row - 1, head.col, board)) {
                        count++;
                        if (Math.floor(Math.random() * count) == 0) {
                            tempDirection = { shiftX: -1, shiftY: 0 };
                        }
                    }
                }
                if (head.col + 1 < gameLogic.ROWS) {
                    if (board[head.row][head.col + 1] === 'FOOD') {
                        tempDirection = { shiftX: 0, shiftY: 1 };
                        res.push(tempDirection);
                        continue;
                    }
                    else if (!gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row, head.col + 1, board)) {
                        count++;
                        if (Math.floor(Math.random() * count) == 0) {
                            tempDirection = { shiftX: 0, shiftY: 1 };
                        }
                    }
                }
                if (head.col - 1 >= 0) {
                    if (board[head.row][head.col - 1] === 'FOOD') {
                        tempDirection = { shiftX: 0, shiftY: -1 };
                        res.push(tempDirection);
                        continue;
                    }
                    else if (!gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row, head.col - 1, board)) {
                        count++;
                        if (Math.floor(Math.random() * count) == 0) {
                            tempDirection = { shiftX: 0, shiftY: -1 };
                        }
                    }
                }
                res.push(tempDirection);
            }
        }
        return res;
    }
    aiService.findComputerMove = findComputerMove;
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map