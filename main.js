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