const rows = 10;
const cols = 10;
const mineCount = 10;
const game = document.getElementById("game");
const status = document.getElementById("status");

let board = [];
let gameOver = false;

function createBoard() {
  board = [];
  game.innerHTML = "";
  gameOver = false;
  status.textContent = "";

  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", revealCell);
      cell.addEventListener("contextmenu", toggleFlag);
      game.appendChild(cell);
      board[r][c] = {
        mine: false,
        revealed: false,
        flagged: false,
        element: cell,
        count: 0
      };
    }
  }

  // place mines
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      minesPlaced++;
    }
  }

  // calculate neighbor mine counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            board[nr][nc].mine
          ) {
            count++;
          }
        }
      }
      board[r][c].count = count;
    }
  }
}

function revealCell(e) {
  if (gameOver) return;
  const cellDiv = e.currentTarget;
  const r = parseInt(cellDiv.dataset.row);
  const c = parseInt(cellDiv.dataset.col);
  const cell = board[r][c];

  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;
  cellDiv.classList.add("revealed");

  if (cell.mine) {
    cellDiv.textContent = "💣";
    gameOver = true;
    status.textContent = "💥 Game Over!";
    revealAllMines();
    return;
  }

  if (cell.count > 0) {
    cellDiv.textContent = cell.count;
  } else {
    // flood fill
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (
          nr >= 0 &&
          nr < rows &&
          nc >= 0 &&
          nc < cols &&
          !board[nr][nc].revealed
        ) {
          revealCell({ currentTarget: board[nr][nc].element });
        }
      }
    }
  }

  checkWin();
}

function toggleFlag(e) {
  e.preventDefault();
  if (gameOver) return;
  const cellDiv = e.currentTarget;
  const r = parseInt(cellDiv.dataset.row);
  const c = parseInt(cellDiv.dataset.col);
  const cell = board[r][c];

  if (cell.revealed) return;

  cell.flagged = !cell.flagged;
  cellDiv.classList.toggle("flagged");
  cellDiv.textContent = cell.flagged ? "🚩" : "";
}

function revealAllMines() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) {
        board[r][c].element.textContent = "💣";
        board[r][c].element.classList.add("revealed");
      }
    }
  }
}

function checkWin() {
  let revealedCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].revealed) revealedCount++;
    }
  }
  if (revealedCount === rows * cols - mineCount) {
    status.textContent = "🎉 You Win!";
    gameOver = true;
  }
}

createBoard();
