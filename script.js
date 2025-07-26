const rows = 10;
const cols = 10;
const mineCount = 10;
const game = document.getElementById("game");
const status = document.getElementById("status");

const timerDisplay = document.getElementById("timer");
const highScoreDisplay = document.getElementById("highScore");
const winsDisplay = document.getElementById("wins");
const lossesDisplay = document.getElementById("losses");

let board = [];
let gameOver = false;
let startTime;
let timerInterval;

let wins = parseInt(localStorage.getItem("wins")) || 0;
let losses = parseInt(localStorage.getItem("losses")) || 0;
let highScore = parseInt(localStorage.getItem("highScore")) || null;

function updateStatsDisplay() {
  winsDisplay.textContent = wins;
  lossesDisplay.textContent = losses;
  highScoreDisplay.textContent = highScore !== null ? highScore : "–";
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = elapsed;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function createBoard() {
  board = [];
  game.innerHTML = "";
  gameOver = false;
  status.textContent = "";
  timerDisplay.textContent = "0";
  stopTimer();

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
      board[r][c] = { mine: false, revealed: false, flagged: false, element: cell, count: 0 };
    }
  }

  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      minesPlaced++;
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) {
            count++;
          }
        }
      }
      board[r][c].count = count;
    }
  }

  updateStatsDisplay();
  startTimer();
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
    status.textContent = "Game Over!";
    losses++;
    localStorage.setItem("losses", losses);
    revealAllMines();
    stopTimer();
    updateStatsDisplay();
    return;
  }

  if (cell.count > 0) {
    cellDiv.textContent = cell.count;
  } else {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
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
    gameOver = true;
    stopTimer();
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    status.textContent = `🎉 You Win! Time: ${timeTaken} sec`;
    wins++;
    localStorage.setItem("wins", wins);

    if (highScore === null || timeTaken < highScore) {
      highScore = timeTaken;
      localStorage.setItem("highScore", highScore);
    }

    updateStatsDisplay();
  }
}

document.getElementById("restartBtn").addEventListener("click", () => {
  createBoard();
});

createBoard();
