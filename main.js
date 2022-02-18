const MatrixCellState = {
  NoShip: 0,
  Ship: 1,
  ShootMiss: 3,
  ShootHit: 4,
}

const BoardType = {
  Player: 'PLAYER',
  Computer: 'COMPUTER',
}

const SHIP_CONFIG = {
  FOURTH: [1, 4],
  TRIPLE: [2, 3],
  DOUBLE: [3, 2],
  SINGLE: [4, 1]
};

const MoveOwner = {
  Player: 'Player',
  Computer: 'Computer',
}

class Board {
  static MATRIX_SIZE = 10;
  //Конфиг для кораблей в игре первый элемент - количество кораблей, второй количество палуб
  //количество очков для победы
  static POINTS_TO_WIN = Object.values(SHIP_CONFIG).reduce((acc, elem) =>
      acc + elem[0] * elem[1], 0);
  static generateRandomValue = (value) => Math.floor(Math.random() * (value + 1));

  constructor(fieldElement, boardType) {
      this.boardType = boardType;
      this.fieldElement = fieldElement;
      this.matrix = [];
  }

  getCoordsForDecks(decksCount) {
      // получаем коэффициенты определяющие направление расположения корабля
      // При isVertical == 0 и isHorizontal == 1 корабль расположится горизонтально,
      // isVertical == 1 и isHorizontal == 0 корабль расположится вертикально.
      let isVertical = Board.generateRandomValue(1),
          isHorizontal = (isVertical == 0) ? 1 : 0,
          x, y;
      if (isVertical == 0) {
          x = Board.generateRandomValue(Board.MATRIX_SIZE - 1);
          y = Board.generateRandomValue(Board.MATRIX_SIZE - decksCount);
      } else {
          x = Board.generateRandomValue(Board.MATRIX_SIZE - decksCount);
          y = Board.generateRandomValue(Board.MATRIX_SIZE - 1);
      }

      const shipStartPosition = {
          x,
          y,
          isVertical,
          isHorizontal
      }
      // проверяем можно ли поставить корабль
      // если нет то заново генериуем координаты
      if (!this.canShipSet(shipStartPosition, decksCount)) {
          return this.getCoordsForDecks(decksCount);
      }
      return shipStartPosition;
  }

  generateMatrix() {
      this.matrix = [...Array(Board.MATRIX_SIZE )].map(() => Array(Board.MATRIX_SIZE ).fill(0));
  }

  clearMatrix() {
      this.matrix = [];
  }

  generateRandomShips() {
      for (let shipType in SHIP_CONFIG) {
          let [shipCount, shipDecks] = SHIP_CONFIG[shipType];
          for (let i = 0; i < shipCount; i++) {
              let options = this.getCoordsForDecks(shipDecks);
              options.decks = shipDecks;
              const ship = new Ship(this, options);
              ship.create();
          }
      }
  }

  // Данная функция формирует ограничения по индесам по оси X и Y, 
  // fromX, fromY, toX, toY задают прямоугольный срез который должен быть свободен от кораблей
  canShipSet(shipStartPosition, decksCount) {
      let {
          x,
          y,
          isVertical,
          isHorizontal,
          fromX,
          toX,
          fromY,
          toY
      } = shipStartPosition;
      fromX = (x == 0) ? x : x - 1;

      if (x + isVertical * decksCount == Board.MATRIX_SIZE && isVertical == 1) {
          toX = x + isVertical * decksCount
      } else if (x + isVertical * decksCount < Board.MATRIX_SIZE  && isVertical == 1) {
          toX = x + isVertical * decksCount + 1
      } else if (x == Board.MATRIX_SIZE - 1 && isVertical == 0) {
          toX = x + 1;
      } else if (x < Board.MATRIX_SIZE - 1 && isVertical == 0) {
          toX = x + 2;
      }

      fromY = (y == 0) ? y : y - 1;
      if (y + isHorizontal * decksCount == Board.MATRIX_SIZE  && isHorizontal == 1) {
        toY = y + isHorizontal * decksCount;
      } else if (y + isHorizontal * decksCount < Board.MATRIX_SIZE  && isHorizontal == 1) {
        toY = y + isHorizontal * decksCount + 1
      }
      else if (y == Board.MATRIX_SIZE - 1 && isHorizontal == 0) {
        toY = y + 1
      }
      else if (y < Board.MATRIX_SIZE - 1 && isHorizontal == 0) {
        toY = y + 2
      };

      if (toX === undefined || toY === undefined) return false;

      if (this.matrix.slice(fromX, toX)
          .filter(arr => arr.slice(fromY, toY).includes(1))
          .length > 0) return false;
      return true;
  }
  //рендеринг поля 
  renderBoard() {
      for (let i = 0; i < this.matrix.length; i++) {
          const matrixRow = document.createElement('tr');
          for (let j = 0; j < this.matrix.length; j++) {
              const matrixCell = document.createElement('td');
              matrixCell.classList.add('cell');
              matrixCell.setAttribute('data-x', i);
              matrixCell.setAttribute('data-y', j);
              matrixCell.setAttribute('id', `ship${i}${j}`);
              if (this.matrix[i][j] === 1 && this.boardType === BoardType.Player) {
                  matrixCell.classList.add('cell--ship');
              }
              matrixRow.append(matrixCell);
          }
          this.fieldElement.append(matrixRow);
      }
  }
}

class Ship {
  constructor(field, {
      x,
      y,
      isVertical,
      isHorizontal,
      decks
  }) {
      this.field = field;
      this.decks = decks;
      this.x = x;
      this.y = y;
      this.isVertical = isVertical;
      this.isHorizontal = isHorizontal;
  }

  create() {
      let {
          decks,
          x,
          y,
          isVertical,
          isHorizontal
      } = this;
      let k = 0;
      while (k < decks) {
          let i = x + k * isVertical,
              j = y + k * isHorizontal;
          this.field.matrix[i][j] = 1;
          k++;
      }
  }
}

class Player {
  constructor(name) {
      this.name = name;
      this.score = 0;
  }

}

class Computer {
  constructor(name) {
      this.name = name;
      this.score = 0;
  }
}


const startGameForm = document.querySelector('.start-game-form');
const playerNameInput = document.querySelector('#player-name');
const computerNameInput = document.querySelector('#computer-name');
const viewStart = document.querySelector('.game__view--start');
const viewProcess = document.querySelector('.game__view--process')
const boardPlayerElement = document.querySelector('.board');
const boardComputerElement = document.querySelector('.board--computer');
const moveText = document.querySelector('.game__title--move');
const boardPlayer = new Board(boardPlayerElement, BoardType.Player);
const boardComputer = new Board(boardComputerElement, BoardType.Computer);
const restartButton = document.querySelector('.message-control__button--restart');
const toStartPageButton = document.querySelector('.message-control__button--start-page'); 
let currentMoveOwner = MoveOwner.Player;
let player = null;
let computer = null;

const initGame = () => {
  boardPlayer.generateMatrix();
  boardPlayer.generateRandomShips();
  boardPlayer.renderBoard();
  boardComputer.generateMatrix();
  boardComputer.generateRandomShips();
  boardComputer.renderBoard();
}

const finishGame = () => {
    boardPlayer.clearMatrix();
    boardComputer.clearMatrix();
    boardComputerElement.innerHTML = '';
    boardPlayerElement.innerHTML = '';
    player.score = 0;
    computer.score = 0;
}



const playerBoardCells = boardPlayerElement.querySelectorAll('.cell');

startGameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  player = new Player(playerNameInput.value);
  computer = new Computer(computerNameInput.value);
  playerNameInput.value = '';
  computerNameInput.value = '';
  viewStart.classList.add('visually-hidden');
  viewProcess.classList.remove('visually-hidden');
  initGame();
  setPlayerMoveOwner();
});


const setComputerMoveOwner = () => {
  moveText.textContent = `${computer.name} ходит`;
  currentMoveOwner = MoveOwner.Computer;
  const x = Board.generateRandomValue(Board.MATRIX_SIZE - 1);
  const y = Board.generateRandomValue(Board.MATRIX_SIZE - 1);
  const cellElement = boardPlayerElement.querySelector(`#ship${x}${y}`);
  const cell = boardPlayer.matrix[x][y];
  switch (cell) {
      case MatrixCellState.NoShip:
          setTimeout(() => {
              boardPlayer.matrix[x][y] = MatrixCellState.ShootMiss;
              cellElement.classList.add('cell--marked');
              setPlayerMoveOwner();
          }, 1000);
          break;
      case MatrixCellState.Ship:
          setTimeout(() => {
              boardPlayer.matrix[x][y] = MatrixCellState.ShootHit;
              cellElement.classList.add('cell--defeated');
              computer.score++;
              if (computer.score === Board.POINTS_TO_WIN) {
                moveText.textContent(`${computer.name} победил`)
                return;
              }
              setComputerMoveOwner();
          }, 1000)
          break;
      case MatrixCellState.ShootMiss:
          setTimeout(() => {
              setComputerMoveOwner();
          }, 1000)
          break;
      case MatrixCellState.ShootHit:
          setTimeout(() => {
              setComputerMoveOwner();
          }, 1000)
          break;
  }

};

const setPlayerMoveOwner = () => {
  moveText.textContent = `${player.name} ходит`;
  currentMoveOwner = MoveOwner.Player;
};

//клик по доске для обработки выстрела игрока, необходимо проверить что игрок не нарушает очередность и не кликает на ячейку пока ходит компьютер
boardComputerElement.addEventListener('click', (e) => {
  if (e.target.tagName === 'TD' && currentMoveOwner !== MoveOwner.Computer) {
      const cell = boardComputer.matrix[e.target.dataset.x][e.target.dataset.y];
      switch (cell) {
          case MatrixCellState.NoShip:
              boardComputer.matrix[e.target.dataset.x][e.target.dataset.y] = MatrixCellState.ShootMiss;
              e.target.classList.add('cell--marked');
              setComputerMoveOwner();
              break;
          case MatrixCellState.Ship:
              player.score++;
              boardComputer.matrix[e.target.dataset.x][e.target.dataset.y] = MatrixCellState.ShootHit;
              e.target.classList.add('cell--defeated');
              if (player.score === Board.POINTS_TO_WIN) {
                moveText.textContent = `${player.name} победил`;
              }
              break;
          case MatrixCellState.ShootMiss:
              alert('Вы уже стреляли сюда и промахнулись');
              break;
          case MatrixCellState.ShootHit:
              alert('Вы уже стреляли сюда и попали');
              break;
      }
  }
});