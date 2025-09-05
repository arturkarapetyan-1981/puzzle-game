const homePage = document.getElementById("homePage");
const gamePage = document.getElementById("gamePage");
const startBtn = document.getElementById("startBtn");
const rulesBtn = document.getElementById("rulesBtn");
const backHome = document.getElementById("backHome");

const rulesModal = document.getElementById("rulesModal");
const closeRules = document.getElementById("closeRules");

const winModal = document.getElementById("winModal");
const modalText = document.getElementById("modalText");
const closeModal = document.getElementById("closeModal");

const puzzle = document.getElementById("puzzle");
const gridSelect = document.getElementById("gridSize");
const randomBtn = document.getElementById("randomBtn");
const upload = document.getElementById("upload");
const statusEl = document.getElementById("status");

let dragged = null;
let touched = null;
let moveCount = 0;

// === Navigation ===
startBtn.addEventListener("click", () => {
  homePage.classList.remove("active");
  gamePage.classList.add("active");
  randomBtn.click();
});

backHome.addEventListener("click", () => {
  gamePage.classList.remove("active");
  homePage.classList.add("active");
});

rulesBtn.addEventListener("click", () => {
  rulesModal.classList.add("show");
});
closeRules.addEventListener("click", () => {
  rulesModal.classList.remove("show");
});

closeModal.addEventListener("click", () => {
  winModal.classList.remove("show");
});

// === Game Logic ===
randomBtn.addEventListener("click", () => {
  const url = `https://picsum.photos/900/900?random=${Date.now()}`;
  startGame(url, parseInt(gridSelect.value, 10));
});

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      startGame(ev.target.result, parseInt(gridSelect.value, 10));
    };
    reader.readAsDataURL(file);
  }
});

function startGame(imgUrl, gridSize) {
  moveCount = 0;
  updateStatus();

  puzzle.innerHTML = "";
  puzzle.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  puzzle.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

  const pieces = [];
  const denom = gridSize - 1;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const piece = document.createElement("div");
      piece.className = "piece";
      piece.style.backgroundImage = `url(${imgUrl})`;
      piece.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
      piece.style.backgroundPosition = `${(col / denom) * 100}% ${(row / denom) * 100}%`;
      piece.dataset.correct = row * gridSize + col;
      pieces.push(piece);
    }
  }

  shuffle(pieces);

  pieces.forEach((piece, i) => {
    piece.dataset.index = i;
    piece.draggable = true;
    puzzle.appendChild(piece);

    // === Desktop Events ===
    piece.addEventListener("dragstart", dragStart);
    piece.addEventListener("dragend", dragEnd);
    piece.addEventListener("dragover", dragOver);
    piece.addEventListener("dragenter", dragEnter);
    piece.addEventListener("dragleave", dragLeave);
    piece.addEventListener("drop", drop);

    // === Mobile Touch Events ===
    piece.addEventListener("touchstart", touchStart, { passive: true });
    piece.addEventListener("touchend", touchEnd);
  });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function updateStatus() {
  statusEl.textContent = `Moves: ${moveCount}`;
}

// === Desktop drag & drop ===
function dragStart(e) {
  dragged = this;
  this.classList.add("dragging");
  e.dataTransfer.setData("text/plain", "");
}
function dragEnd() {
  this.classList.remove("dragging");
  document.querySelectorAll(".piece.over").forEach((p) => p.classList.remove("over"));
}
function dragOver(e) {
  e.preventDefault();
}
function dragEnter(e) {
  if (this !== dragged) this.classList.add("over");
}
function dragLeave() {
  this.classList.remove("over");
}
function drop(e) {
  e.preventDefault();
  if (this === dragged) return;
  swapNodes(dragged, this);
  refreshIndices();
  moveCount++;
  updateStatus();
  checkWin();
}

// === Mobile touch support ===
function touchStart(e) {
  touched = this;
}

function touchEnd(e) {
  const target = document.elementFromPoint(
    e.changedTouches[0].clientX,
    e.changedTouches[0].clientY
  );
  if (target && target.classList.contains("piece") && target !== touched) {
    swapNodes(touched, target);
    refreshIndices();
    moveCount++;
    updateStatus();
    checkWin();
  }
  touched = null;
}

// === Helpers ===
function swapNodes(a, b) {
  const parent = a.parentNode,
    an = a.nextSibling;
  if (b === an) parent.insertBefore(b, a);
  else parent.insertBefore(a, b);
  parent.insertBefore(b, an);
}

function refreshIndices() {
  [...puzzle.children].forEach((piece, i) => (piece.dataset.index = i));
}

function checkWin() {
  const children = [...puzzle.children];
  const solved = children.every((p, i) => parseInt(p.dataset.correct) === i);
  if (solved) {
    setTimeout(() => {
      modalText.textContent = `Solved in ${moveCount} moves!`;
      winModal.classList.add("show");
    }, 150);
  }
}




