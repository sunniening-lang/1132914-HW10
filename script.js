var board = [];
var currentPlayer = "black"; // "black" | "white" | "done"
var boardDiv;

var cells = []; // 存格子的 DOM

var directions = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1]
];

window.onload = function () {
  boardDiv = document.getElementById("board");
  initBoard();
};

// ===== 建立資料棋盤 =====
function createBoard() {
  board = [];
  for (var i = 0; i < 8; i++) {
    board[i] = [];
    for (var j = 0; j < 8; j++) {
      board[i][j] = null;
    }
  }
}

// ===== 只建立一次 UI 棋盤格子 =====
function buildBoardUI() {
  boardDiv.innerHTML = "";
  cells = [];

  for (var r = 0; r < 8; r++) {
    cells[r] = [];
    for (var c = 0; c < 8; c++) {
      var cell = document.createElement("div");
      cell.className = "cell";

      cell.onclick = (function (row, col) {
        return function () {
          playerMove(row, col);
        };
      })(r, c);

      boardDiv.appendChild(cell);
      cells[r][c] = cell;
    }
  }
}

// ===== 設定某格棋子（可選動畫） =====
function setPiece(r, c, color, animate) {
  var cell = cells[r][c];
  var piece = cell.querySelector(".piece");

  if (!piece) {
    piece = document.createElement("div");
    piece.className = "piece " + color;
    cell.appendChild(piece);
    return;
  }

  if (!animate) {
    piece.className = "piece " + color;
    return;
  }

  piece.classList.add("flipping");

  // 翻到一半換顏色
  setTimeout(function () {
    piece.className = "piece " + color + " flipping";
  }, 180);

  // 動畫結束移除 flipping
  setTimeout(function () {
    piece.classList.remove("flipping");
  }, 360);
}

// ===== 把 board 狀態畫到畫面（不重建格子） =====
function renderBoard() {
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var cell = cells[r][c];
      var piece = cell.querySelector(".piece");

      if (!board[r][c]) {
        if (piece) piece.remove();
      } else {
        if (!piece) {
          piece = document.createElement("div");
          piece.className = "piece " + board[r][c];
          cell.appendChild(piece);
        } else {
          piece.className = "piece " + board[r][c];
        }
      }
    }
  }
}

// ===== 初始化 =====
function initBoard() {
  createBoard();

  if (cells.length === 0) buildBoardUI();

  board[3][3] = "white";
  board[3][4] = "black";
  board[4][3] = "black";
  board[4][4] = "white";

  currentPlayer = "black";
  renderBoard();
  updateStatusText();
  document.getElementById("resultText").textContent = "";
}

// ===== 判斷可翻哪些 =====
function validMove(r, c, player) {
  if (board[r][c]) return [];

  var flips = [];

  for (var i = 0; i < directions.length; i++) {
    var dr = directions[i][0];
    var dc = directions[i][1];
    var x = r + dr;
    var y = c + dc;
    var temp = [];

    while (
      x >= 0 && x < 8 && y >= 0 && y < 8 &&
      board[x][y] && board[x][y] !== player
    ) {
      temp.push([x, y]);
      x += dr;
      y += dc;
    }

    if (
      temp.length &&
      x >= 0 && x < 8 && y >= 0 && y < 8 &&
      board[x][y] === player
    ) {
      flips = flips.concat(temp);
    }
  }

  return flips;
}

// ===== 計分 =====
function countPieces() {
  var black = 0, white = 0;
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      if (board[r][c] === "black") black++;
      else if (board[r][c] === "white") white++;
    }
  }
  return { black: black, white: white };
}

// ===== 是否還有棋可下 =====
function hasAnyValidMove(player) {
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      if (validMove(r, c, player).length) return true;
    }
  }
  return false;
}

function clearHints() {
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var cell = cells[r][c];
      var dot = cell.querySelector(".hint-dot");
      if (dot) dot.remove();
    }
  }
}

function showHintsFor(player) {
  clearHints();

  // 遊戲結束就不顯示
  if (currentPlayer === "done") return;

  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      if (validMove(r, c, player).length > 0) {
        var dot = document.createElement("div");
        dot.className = "hint-dot " + (player === "black" ? "hint-black" : "hint-white");
        cells[r][c].appendChild(dot);
      }
    }
  }
}


// ===== 更新狀態文字 =====
function updateStatusText() {
  var turnEl = document.getElementById("turnText");
  var scoreEl = document.getElementById("scoreText");

  var cnt = countPieces();
  scoreEl.textContent = "｜黑: " + cnt.black + " 白: " + cnt.white;

  if (currentPlayer === "black") turnEl.textContent = "輪到：黑棋（你）";
  else if (currentPlayer === "white") turnEl.textContent = "輪到：白棋（電腦）";
    
      // ✅ 更新可下提示
  if (currentPlayer === "black" || currentPlayer === "white") {
    showHintsFor(currentPlayer);
  } else {
    clearHints();
  }

}

// ===== 結束判斷（兩邊都不能下） =====
function endGameIfNeeded() {
  var canBlack = hasAnyValidMove("black");
  var canWhite = hasAnyValidMove("white");

  if (!canBlack && !canWhite) {
    var resultEl = document.getElementById("resultText");
    var cnt = countPieces();

    if (cnt.black > cnt.white) resultEl.textContent = "遊戲結束：黑棋獲勝 ";
    else if (cnt.white > cnt.black) resultEl.textContent = "遊戲結束：白棋獲勝 ";
    else resultEl.textContent = "遊戲結束：平手 🤝";

    currentPlayer = "done";
    updateStatusText();
    return true;
  }
  return false;
}

// ===== 玩家下棋 =====
function playerMove(r, c) {
  if (currentPlayer !== "black") return;

  var flips = validMove(r, c, "black");
  if (!flips.length) return;

  board[r][c] = "black";
  setPiece(r, c, "black", false);

  updateStatusText();
  flip(flips, "black");
}

// ===== 翻棋（逐顆翻 + 動畫） =====
function flip(flips, player) {
  var i = 0;
  var timer = setInterval(function () {
    var p = flips[i];

    board[p[0]][p[1]] = player;
    setPiece(p[0], p[1], player, true);

    i++;

    if (i >= flips.length) {
      clearInterval(timer);

      // 翻完更新分數
      updateStatusText();

      // 先檢查是否結束
      if (endGameIfNeeded()) return;

      // 換人
      currentPlayer = (player === "black") ? "white" : "black";
      updateStatusText();

      // ✅ PASS：輪到的人沒得下就跳過
      if (currentPlayer === "black" && !hasAnyValidMove("black")) {
        currentPlayer = "white";
        updateStatusText();
      } else if (currentPlayer === "white" && !hasAnyValidMove("white")) {
        currentPlayer = "black";
        updateStatusText();
      }

      // PASS 後也可能直接結束
      if (endGameIfNeeded()) return;

      // 電腦回合
      if (currentPlayer === "white") {
        setTimeout(computerMove, 500);
      }
    }
  }, 150);
}

// ===== 電腦下棋 =====
function computerMove() {
  if (currentPlayer !== "white") return;

  var level = document.getElementById("level").value;
  var best = null;
  var bestScore = -1;

  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var flips = validMove(r, c, "white");
      if (flips.length) {
        var score = flips.length;

        // hard：角落加分
        if (level === "hard" && ((r === 0 || r === 7) && (c === 0 || c === 7))) {
          score += 10;
        }

        if (score > bestScore) {
          bestScore = score;
          best = { r: r, c: c, flips: flips };
        }
      }
    }
  }

  if (best) {
    board[best.r][best.c] = "white";
    setPiece(best.r, best.c, "white", false);

    updateStatusText();
    flip(best.flips, "white");
  } else {
    // 沒得下就 PASS
    currentPlayer = "black";
    updateStatusText();
    endGameIfNeeded();
  }
}

// ===== 重置 =====
function resetGame() {
  initBoard();
}


