document.addEventListener("DOMContentLoaded", () => {
  const puzzleContainer = document.getElementById("puzzle-container");
  const shuffleBtn = document.getElementById("shuffle-btn");
  const moveCounter = document.getElementById("move-counter");

  let board = [];
  let emptyIndex = 15; // The empty block is at the last position initially
  let moves = 0;
  const size = 3; // 3x3 board

  // Initialize the game
  function initGame() {
    board = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
    board.push(0); // 0 represents the empty space
    emptyIndex = board.indexOf(0);
    updateBoard();
    moves = 0;
    updateMoveCounter();
  }

  // Update the visual representation of the board
  function updateBoard() {
    puzzleContainer.innerHTML = "";
    board.forEach((num, index) => {
      const blk = document.createElement("div");
      const isEmpty = num === 0;
      const isMovable = !isEmpty && isAdjacent(index, emptyIndex);
      blk.className = `blk ${isEmpty ? "empty" : ""} ${
        isMovable ? "movable" : ""
      }`.trim();
      blk.textContent = !isEmpty ? num : "";

      // Accessibility: describe each cell and its state
      blk.setAttribute("role", "gridcell");
      blk.setAttribute(
        "aria-label",
        isEmpty
          ? "Empty space (drop target)"
          : `Blk ${num}${isMovable ? " (movable, draggable)" : ""}`
      );

      // Pointer-based drag: movable blocks can be dragged along the axis toward the empty space.
      if (isMovable) {
        blk.addEventListener("pointerdown", (e) => startDrag(e, index, blk));
        // Also support click-to-move for convenience (suppressed if a drag just happened)
        blk.addEventListener("click", () => {
          if (justDragged) {
            justDragged = false;
            return;
          }
          moveBlk(index);
        });
      }
      puzzleContainer.appendChild(blk);
    });
  }

  // Move a block to the empty space if possible
  function moveBlk(index) {
    // Only allow valid, adjacent moves to reinforce the core rule
    if (isAdjacent(index, emptyIndex)) {
      // Swap the clicked block with the empty space
      [board[index], board[emptyIndex]] = [board[emptyIndex], board[index]];
      emptyIndex = index;
      moves++;
      updateMoveCounter();
      updateBoard();

      if (isSolved()) {
        setTimeout(() => {
          alert(`Congratulations! You solved the puzzle in ${moves} moves!`);
        }, 100);
      }
    }
  }

  // Check if two indices are adjacent (horizontally or vertically)
  function isAdjacent(a, b) {
    const rowA = Math.floor(a / size);
    const colA = a % size;
    const rowB = Math.floor(b / size);
    const colB = b % size;

    return (
      (Math.abs(rowA - rowB) === 1 && colA === colB) ||
      (Math.abs(colA - colB) === 1 && rowA === rowB)
    );
  }

  // Check if the puzzle is solved
  function isSolved() {
    for (let i = 0; i < board.length - 1; i++) {
      if (board[i] !== i + 1) {
        return false;
      }
    }
    return board[board.length - 1] === 0;
  }

  // Shuffle the board
  function shuffleBoard() {
    // Make random moves to shuffle the board
    const shuffleMoves = 1000;
    for (let i = 0; i < shuffleMoves; i++) {
      const possibleMoves = [];
      const row = Math.floor(emptyIndex / size);
      const col = emptyIndex % size;

      // Check all four directions
      if (row > 0) possibleMoves.push(emptyIndex - size); // Up
      if (row < size - 1) possibleMoves.push(emptyIndex + size); // Down
      if (col > 0) possibleMoves.push(emptyIndex - 1); // Left
      if (col < size - 1) possibleMoves.push(emptyIndex + 1); // Right

      // Pick a random adjacent block and swap with empty space
      const randomMove =
        possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      [board[emptyIndex], board[randomMove]] = [
        board[randomMove],
        board[emptyIndex],
      ];
      emptyIndex = randomMove;
    }

    moves = 0;
    updateMoveCounter();
    updateBoard();
  }

  function updateMoveCounter() {
    moveCounter.textContent = `Moves: ${moves}`;
  }

  // Event listeners
  shuffleBtn.addEventListener("click", shuffleBoard);

  // Initialize the game
  initGame();

  // ----- Pointer-drag implementation -----
  let dragState = null; // { fromIndex, blkEl, axis, maxDelta, startX, startY, currentDelta, didMove }
  let justDragged = false; // prevent click after a drag gesture

  function startDrag(e, fromIndex, blkEl) {
    if (!isAdjacent(fromIndex, emptyIndex)) return; // safety
    const blks = puzzleContainer.querySelectorAll(".blk");
    const emptyEl = puzzleContainer.querySelector(".blk.empty");
    if (!emptyEl) return;
    const fromRect = blkEl.getBoundingClientRect();
    const emptyRect = emptyEl.getBoundingClientRect();
    const deltaX = emptyRect.left - fromRect.left;
    const deltaY = emptyRect.top - fromRect.top;
    // Determine axis toward empty space
    let axis, maxDelta;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      axis = "x";
      maxDelta = deltaX; // can be positive or negative
    } else {
      axis = "y";
      maxDelta = deltaY;
    }
    dragState = {
      fromIndex,
      blkEl,
      axis,
      maxDelta,
      startX: e.clientX,
      startY: e.clientY,
      currentDelta: 0,
      didMove: false,
    };
    blkEl.classList.add("dragging");
    blkEl.setPointerCapture(e.pointerId);
    blkEl.addEventListener("pointermove", onPointerMove);
    blkEl.addEventListener("pointerup", onPointerUp);
    blkEl.addEventListener("pointercancel", onPointerUp);
  }

  function onPointerMove(e) {
    if (!dragState) return;
    const { axis, startX, startY, maxDelta, blkEl } = dragState;
    const rawDelta = axis === "x" ? e.clientX - startX : e.clientY - startY;
    // Constrain movement between 0 and maxDelta (only toward the empty cell)
    const min = Math.min(0, maxDelta);
    const max = Math.max(0, maxDelta);
    const clamped = Math.max(min, Math.min(max, rawDelta));
    dragState.currentDelta = clamped;
    if (Math.abs(rawDelta) > 1) dragState.didMove = true; // treat as drag gesture with minimal movement
    // Apply transform along the axis
    if (axis === "x") {
      blkEl.style.transform = `translate(${clamped}px, 0px)`;
    } else {
      blkEl.style.transform = `translate(0px, ${clamped}px)`;
    }
  }

  function onPointerUp(e) {
    if (!dragState) return;
    const { fromIndex, blkEl, axis, maxDelta, currentDelta, didMove } =
      dragState;
    blkEl.removeEventListener("pointermove", onPointerMove);
    blkEl.removeEventListener("pointerup", onPointerUp);
    blkEl.removeEventListener("pointercancel", onPointerUp);
    blkEl.classList.remove("dragging");
    // Decide commit vs snap back (auto-complete if dragged any amount in correct direction)
    const correctDirection =
      maxDelta === 0 ? false : Math.sign(currentDelta) === Math.sign(maxDelta);
    const epsilon = 1; // require only a tiny nudge in the correct direction to auto-complete
    if (didMove && correctDirection && Math.abs(currentDelta) >= epsilon) {
      // Commit the move immediately
      blkEl.style.transform = "";
      moveBlk(fromIndex);
      justDragged = true;
    } else {
      // Snap back
      blkEl.style.transition = "transform 120ms ease";
      blkEl.style.transform = "translate(0px, 0px)";
      blkEl.addEventListener("transitionend", function cleanup() {
        blkEl.style.transition = "";
        blkEl.removeEventListener("transitionend", cleanup);
      });
      justDragged = didMove;
    }
    dragState = null;
  }
});
