module aiService {
  /** Returns the move that the computer player should do for the given state in move. */
  export function findComputerMove(computerOrHuman: number[], boardWithSnake: BoardWithSnakes): Direction[] {
    let res: Direction[] = [];
    for (let i = 0; i < computerOrHuman.length; i++) {
      if (computerOrHuman[i] == 1) {
        res.push(null);
      }
      else {
        let board: Board = boardWithSnake.board;
        let head: Cell = boardWithSnake.snakes[i].headToTail[0];
        let tempDirection: Direction = {shiftX: 1, shiftY: 0};
        let count: number = 0;

        if (head.row+1 < gameLogic.ROWS) {
          if (board[head.row+1][head.col] === 'FOOD') {
            tempDirection = {shiftX: 1, shiftY: 0};
            res.push(tempDirection);
            continue;
          } else if (!gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row+1, head.col, board)) {
            count++;
            if (Math.floor(Math.random()*count) == 0) {
              tempDirection = {shiftX: 1, shiftY: 0};
            }
          }
        }

        if (head.row-1 >= 0) {
          if (board[head.row-1][head.col] === 'FOOD') {
            tempDirection = {shiftX: -1, shiftY: 0};
            res.push(tempDirection);
            continue;
          } else if (!gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row-1, head.col, board)) {
            count++;
            if (Math.floor(Math.random()*count) == 0) {
              tempDirection = {shiftX: -1, shiftY: 0};
            }
          }
        }

        if (head.col+1 < gameLogic.ROWS) {
          if (board[head.row][head.col+1] === 'FOOD') {
            tempDirection = {shiftX: 0, shiftY: 1};
            res.push(tempDirection);
            continue;
          } else if (!gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row, head.col+1, board)) {
            count++;
            if (Math.floor(Math.random()*count) == 0) {
              tempDirection = {shiftX: 0, shiftY: 1};
            }
          }
        }

        if (head.col-1 >= 0) {
          if (board[head.row][head.col-1] === 'FOOD') {
            tempDirection = {shiftX: 0, shiftY: -1};
            res.push(tempDirection);
            continue;
          } else if (!gameLogic.isBarrierOrBorderOrOpponentOrMySelf(head.row, head.col-1, board)) {
            count++;
            if (Math.floor(Math.random()*count) == 0) {
              tempDirection = {shiftX: 0, shiftY: -1};
            }
          }
        }
        res.push(tempDirection);
      }
    }
    return res;
  }
}
