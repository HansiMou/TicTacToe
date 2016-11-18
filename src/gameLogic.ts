type Board = string[][];

interface BoardWithSnakes {
  board: string[][];
  snakes: Snake[];
}
interface Direction {
  shiftX: number;
  shiftY: number;
}
interface Snake {
  headToTail: Cell[];
  currentDirection: Direction;
  dead: boolean;
  oldTail: Cell;
}
interface Cell {
  row: number;
  col: number;
}
interface IState {
  boardWithSnakes: BoardWithSnakes;
  newDirections: Direction[];
}

module gameLogic {
  import all = webdriver.promise.all;
  export const ROWS = 30;
  export const COLS = 30;
  export const NumberOfBarrier = 5;
  export const NumberOfPlayer = 2;
  export const NumberOfFood = 30;
  export const RemainingTime = 180*1000;

  function getInitialBoardAndSnakes(): BoardWithSnakes {
    let board: Board = getInitialBoardWithBarriersAndFoods();
    let snakes: Snake[] = [];
    for (let i = 0; i < NumberOfPlayer; i++) {
      snakes[i] = getInitialSnake(board, i+1);
    }
    return {board: board, snakes: snakes};
  }

  function getInitialBoardWithBarriersAndFoods(): Board {
    let board: Board = [];
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = '';
      }
    }
    let curBarriers: number = 0;
    let curFoods: number = 0;
    while (curBarriers < NumberOfBarrier || curFoods < NumberOfFood) {
      let randomX: number = Math.floor((Math.random()*ROWS));
      let randomY: number = Math.floor((Math.random()*COLS));
      if (board[randomX][randomY] == '') {
        if (curBarriers < NumberOfBarrier) {
          board[randomX][randomY] = 'BARRIER';
          curBarriers++;
        } else {
          board[randomX][randomY] = 'FOOD';
          curFoods++;
        }
      }
    }
    return board;
  }

  // side effect: update the board with snake
  function getInitialSnake(board: Board, player: number): Snake {
    let snake: Snake = {headToTail: [], dead: false, oldTail: null, currentDirection: null};
    let found: boolean = false;

    while (!found) {
      let randomX: number = Math.floor((Math.random()*ROWS)+1);
      let randomY: number = Math.floor((Math.random()*COLS)+1);

      if (board[randomX][randomY] === '') {

        snake.headToTail = [{row: randomX, col: randomY}];
        found = true;

        if (isBarrierOrBorderOrOpponentOrMySelf(randomX+1, randomY, board)) {
          snake.currentDirection = {shiftX: 1, shiftY: 0};
        } else if (isBarrierOrBorderOrOpponentOrMySelf(randomX-1, randomY, board)) {
          snake.currentDirection = {shiftX: -1, shiftY: 0};
        } else if (isBarrierOrBorderOrOpponentOrMySelf(randomX, randomY+1, board)) {
          snake.currentDirection = {shiftX: 0, shiftY: 1};
        } else if (isBarrierOrBorderOrOpponentOrMySelf(randomX, randomY-1, board)) {
          snake.currentDirection = {shiftX: 0, shiftY: -1};
        } else {
          found = false;
          snake.headToTail = [];
        }
      }
    }
    board[snake.headToTail[0].row][snake.headToTail[0].col] = "SNAKE"+player;
    return snake;
  }

  function isBarrierOrBorderOrOpponentOrMySelf(x: number, y: number, board: Board): boolean {
    if (x < 0 || x >= ROWS || y < 0 || y >= COLS) {
      return true;
    }
    if (board[x][y] != '' || board[x][y] != 'FOOD') {
      return true;
    }
    return false;
  }

  export function getInitialState(): IState {
    return {boardWithSnakes: getInitialBoardAndSnakes(), newDirections: []};
  }

  // return true if two snakes bump against each other
  // or if time is out and both snake have equal length
  function isTie(boardWithSnakes: BoardWithSnakes, time: number): boolean {
    let allDead: boolean = true;
    for (let snake of boardWithSnakes.snakes) {
      if (!snake.dead) {
        allDead = false;
      }
    }
    if (allDead) {
      return true;
    }
    if (time <= 0) {
      let isTie = true;
      for (let i = 0; i < boardWithSnakes.snakes.length-1; i++) {
        if (boardWithSnakes.snakes[i].headToTail.length != boardWithSnakes.snakes[i+1].headToTail.length) {
          isTie = false;
        }
      }
      return isTie;
    }
    return false;
  }

  // return the only one player that has live snake, '', '1', '2'
  function getWinner(boardWithSnakes: BoardWithSnakes): string {
    let winner: string = '';
    let countOfLiveSnake: number = 0;

    for (let i = 0; i < boardWithSnakes.snakes.length; i++) {
      if (!boardWithSnakes.snakes[i].dead) {
        countOfLiveSnake++;
        winner = i+1+'';
      }
    }
    if (countOfLiveSnake != 1) {
      winner = '';
    }
    return winner;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(
      stateBeforeMove: IState, newDirections: Direction[], leftTime: number, turnIndexBeforeMove: number): IMove {
    let end: boolean = false;
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }
    let boardWithSnakes:BoardWithSnakes = stateBeforeMove.boardWithSnakes;
    if (getWinner(boardWithSnakes) !== '' || isTie(boardWithSnakes, leftTime)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    let boardWithSnakesAfterMove = {board: angular.copy(boardWithSnakes.board), snakes: angular.copy(boardWithSnakes.snakes)};

    // Game over, time out.
    if (leftTime <= 0) {
      end = true;
    } else {
      // still have time
      // update snake body depending on get food or not
      for (let index = 0; index < newDirections.length; index++) {
        // pass dead snake
        if (boardWithSnakesAfterMove.snakes[index].dead) {
          continue;
        }
        let head = boardWithSnakesAfterMove.snakes[index].headToTail[0];
        let newHeadX: number;
        let newHeadY: number;
        let oldDirection = boardWithSnakesAfterMove.snakes[index].currentDirection;
        if (newDirections[index] != null)
          log.info("ddd", oldDirection.shiftX, oldDirection.shiftY, newDirections[index].shiftX, newDirections[index].shiftY)
        if (newDirections[index] == null ||
            (Math.abs(oldDirection.shiftX) == Math.abs(newDirections[index].shiftX) &&
              Math.abs(oldDirection.shiftY) == Math.abs(newDirections[index].shiftY))) {
          // keep moving in the same direction
          newHeadX = head.row + boardWithSnakesAfterMove.snakes[index].currentDirection.shiftX;
          newHeadY = head.col + boardWithSnakesAfterMove.snakes[index].currentDirection.shiftY;
        } else {
          // keep moving in the new direction

          newHeadX = head.row + newDirections[index].shiftX;
          newHeadY = head.col + newDirections[index].shiftY;

          boardWithSnakesAfterMove.snakes[index].currentDirection = newDirections[index];
        }

        // eat food
        boardWithSnakesAfterMove.snakes[index].headToTail.unshift({row: newHeadX, col: newHeadY});
        if (boardWithSnakesAfterMove.board[newHeadX][newHeadY] != 'FOOD') {
          // remove old tail
          boardWithSnakesAfterMove.snakes[index].oldTail = boardWithSnakesAfterMove.snakes[index].headToTail.pop();
        }
      }

      // update dead info if snake bump into border, barrier or itself or other snakes
      for (let index = 0; index < boardWithSnakesAfterMove.snakes.length; index++) {
        let board = boardWithSnakesAfterMove.board;
        let snake = boardWithSnakesAfterMove.snakes[index];
        let head = snake.headToTail[0];
        // bump into border
        if (head.row < 0 || head.row >= ROWS || head.col < 0 || head.col >= COLS) {
          snake.dead = true;
          log.log("dead because bump into border");
          continue;
        }
        // bump into barrier
        if (board[head.row][head.col] === 'BARRIER') {
          snake.dead = true;
          log.log("dead because bump into barrier");
          continue;
        }
        // bump into itself
        for (let i = 1; i < snake.headToTail.length; i++) {
          if (snake.headToTail[i].row == head.row && snake.headToTail[i].col == head.col) {
            snake.dead = true;
            break;
          }
        }
        // bump into others
        outer: for (let secondIndex = 0; secondIndex < boardWithSnakesAfterMove.snakes.length; secondIndex++) {
          if (secondIndex != index) {
            let anotherSnake = boardWithSnakesAfterMove.snakes[secondIndex];
            for (let j = 0; j < anotherSnake.headToTail.length; j++) {
              if (anotherSnake.headToTail[j].row == head.row && anotherSnake.headToTail[j].col == head.col) {
                snake.dead = true;
                break outer;
              }
            }
          }
        }
      }

      updateBoardWithSnakes(boardWithSnakesAfterMove);
      log.info("I'm in after", boardWithSnakesAfterMove.board
          [boardWithSnakesAfterMove.snakes[0].headToTail[0].row]
          [boardWithSnakesAfterMove.snakes[0].headToTail[0].col]);
    }

    let winner = getWinner(boardWithSnakesAfterMove);
    let matchScores: number[] = [];
    if (winner !== '' || isTie(boardWithSnakesAfterMove, leftTime)) {
      for (let snake of boardWithSnakesAfterMove.snakes) {
        matchScores.push(snake.headToTail.length);
      }
      end = true;
    }
    let stateAfterMove: IState = {newDirections: newDirections, boardWithSnakes: boardWithSnakesAfterMove};
    return {matchScores: matchScores, stateAfterMove: stateAfterMove, end: end, turnIndexAfterMove: NumberOfPlayer-1-turnIndexBeforeMove};
  }

  function updateBoardWithSnakes(boardWithSnakes: BoardWithSnakes) {
    let foodEaten: number = 0;
    for (let i = 0; i < boardWithSnakes.snakes.length; i++) {
      let snake: Snake = boardWithSnakes.snakes[i];
      if (!snake.dead) {
        // remove old tail
        if (snake.oldTail != null) {
          log.info("I'm in old tail", snake.oldTail);
          boardWithSnakes.board[snake.oldTail.row][snake.oldTail.col] = '';
        }
        if (boardWithSnakes.board[snake.headToTail[0].row][snake.headToTail[0].col] === 'FOOD') {
          foodEaten++;
        }
        // add new head
        boardWithSnakes.board[snake.headToTail[0].row][snake.headToTail[0].col] = "SNAKE"+(i+1);
        log.info("I'm in new head", snake.headToTail[0].row, snake.headToTail[0].col, boardWithSnakes.board[snake.headToTail[0].row][snake.headToTail[0].col]);
      }
    }
    
    fillBoardWithFood(boardWithSnakes, foodEaten);
  }
  
  function fillBoardWithFood(boardWithSnakes: BoardWithSnakes, foodEaten: number) {
    while (foodEaten > 0) {
      let randomX: number = Math.floor((Math.random()*ROWS)+1);
      let randomY: number = Math.floor((Math.random()*COLS)+1);

      if (boardWithSnakes.board[randomX][randomY] === '') {
        boardWithSnakes.board[randomX][randomY] = 'FOOD';
        foodEaten--;
      }
    }
  }
  
  export function createInitialMove(): IMove {
    return {matchScores: [], stateAfterMove: getInitialState(), end: false, turnIndexAfterMove: 0};
  }

  export function checkMoveOk(stateTransition: IStateTransition): void {
  }

  // export function forSimpleTestHtml() {
  //   var move = gameLogic.createMove(null, 0, 0, 0);
  //   log.log("move=", move);
  //   var params: IStateTransition = {
  //     turnIndexBeforeMove: 0,
  //     stateBeforeMove: null,
  //     move: move,
  //     numberOfPlayers: 2};
  //   gameLogic.checkMoveOk(params);
  // }
}
