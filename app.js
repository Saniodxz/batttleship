const app = (() => {
  // Gameboard Factory Function
  function Gameboard() {
    const board = Array.from({ length: 10 }, () => Array(10).fill(null));
    const ships = [];
    function canPlaceShip(ship, row, col, isVertical) {
        const length = ship.length;
    
        if (isVertical) {
          if (row + length > 10) {
            return false;
          }
    
          for (let i = 0; i < length; i++) {
            if (board[row + i][col] !== null) {
              return false;
            }
          }
        } else {
          if (col + length > 10) {
            return false;
          }
    
          for (let i = 0; i < length; i++) {
            if (board[row][col + i] !== null) {
              return false;
            }
          }
        }
    
        return true;
      }
      function placeShip(ship, row, col, isVertical) {
        if (!canPlaceShip(ship, row, col, isVertical)) {
          return false;
        }
    
        const length = ship.length;
    
        if (isVertical) {
          for (let i = 0; i < length; i++) {
            board[row + i][col] = ship;
          }
        } else {
          for (let i = 0; i < length; i++) {
            board[row][col + i] = ship;
          }
        }
    
        ships.push(ship);
        return true;
      }

    function receiveAttack(row, col) {
      if (board[row][col] === null) {
        board[row][col] = "miss";
        return "miss";
      }

      const ship = board[row][col];
      ship.hit();
      return "hit";
    }

    function allShipsSunk() {
      return ships.every((ship) => ship.isSunk());
    }


    function clearBoard() {
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 10; col++) {
            board[row][col] = null;
          }
        }
        ships.length = 0;
    }

    return { placeShip, receiveAttack, allShipsSunk,clearBoard, board };
  }

  // Ship Factory Function
  function Ship(length) {
    let hits = Array(length).fill(false);

    function hit() {
      const index = hits.findIndex((hit) => !hit);
      if (index >= 0) {
        hits[index] = true;
      }
    }

    function isSunk() {
      return hits.every((hit) => hit);
    }

    return { length, hit, isSunk };
  }

  // Player Factory Function
  function Player() {
    function makeRandomPlay() {
      const row = Math.floor(Math.random() * 10);
      const col = Math.floor(Math.random() * 10);
      return { row, col };
    }

    return { makeRandomPlay };
  }

  const player1Gameboard = Gameboard();
  const player2Gameboard = Gameboard();

  const player1 = Player();
  const player2 = Player();

  // Place ships on gameboard1 and gameboard2 (for testing purposes)
  const ship1 = Ship(3);
  const ship2 = Ship(4);

  player1Gameboard.placeShip(ship1, 0, 0, false);
  player2Gameboard.placeShip(ship2, 2, 3, true);

  // Helper function to render the gameboards on the webpage
  function renderGameboards() {
    renderGameboard(player1Gameboard, "gameboard1");
    renderGameboard(player2Gameboard, "gameboard2");
  }

  function renderGameboard(gameboard, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const shipCounter = document.createElement("div");
  shipCounter.classList.add("ship-counter");
  shipCounter.innerText = `Ships: ${countShips(gameboard.board)}`;
  container.appendChild(shipCounter);
  const shipCounterPlayer1 = document.getElementById("ship-counter-player1");
  const shipCounterPlayer2 = document.getElementById("ship-counter-player2");

  if (containerId === "gameboard1") {
    shipCounterPlayer1.innerText = `Ships: ${countShips(gameboard.board)}`;
  } else if (containerId === "gameboard2") {
    shipCounterPlayer2.innerText = `Ships: ${countShips(gameboard.board)}`;
  }
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const cell = document.createElement('div');
          cell.classList.add('cell');
          cell.id = `${containerId}-${row}-${col}`;
  
          if (gameboard.board[row][col] === 'miss') {
            cell.classList.add('miss');
          } else if (gameboard.board[row][col] !== null) {
            cell.classList.add('ship');
  
            // Remove ship class from player2's gameboard cells to hide ships
            if (containerId === 'gameboard2') {
              cell.classList.remove('ship');
            }
          }






          cell.addEventListener("click", () => {
            if (containerId === "gameboard2") {
              // Player attacks opponent's gameboard
              if (
                !cell.classList.contains("miss") &&
                !cell.classList.contains("hit")
              ) {
                const result = player2Gameboard.receiveAttack(row, col);
                cell.classList.add(result);
                const shipCounter = document.querySelector(`#${containerId} .ship-counter`);
                shipCounter.innerText = `Ships: ${countShips(player2Gameboard.board)}`;
                checkGameEnd();
              }
            }
          });

        container.appendChild(cell);
      }
    }
  }
  function countShips(board) {
    let count = 0;
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (board[row][col] !== null && board[row][col] !== "miss") {
          count++;
        }
      }
    }
    return count;
  }
  function checkGameEnd() {
    if (player2Gameboard.allShipsSunk()) {
      alert("You win! Game over.");
      document.getElementById("play-again").style.display = "block";
    } else {
      // Computer makes a random play after player's turn
      const { row, col } = player1.makeRandomPlay();
      const result = player1Gameboard.receiveAttack(row, col);
      const cell = document.getElementById(`gameboard1-${row}-${col}`);
      cell.classList.add(result);
      if (player1Gameboard.allShipsSunk()) {
        alert("Computer wins! Game over.");
        document.getElementById("play-again").style.display = "block";
      }
    }
  }
//   const randomizeShipsButton = document.getElementById("randomize-ships");
//   randomizeShipsButton.addEventListener("click", () => {
//     randomizePlayer1Ships();
//   });

  function randomizePlayer1Ships() {
    const shipLengths = [5, 4, 3, 3, 2]; // Lengths of the ships
    player1Gameboard.clearBoard(); // Clear the gameboard before placing ships

    for (const length of shipLengths) {
      let row, col, isVertical;
      do {
        row = Math.floor(Math.random() * 10);
        col = Math.floor(Math.random() * 10);
        isVertical = Math.random() < 0.5;
      } while (
        !player1Gameboard.placeShip(new Ship(length), row, col, isVertical)
      );
    }

    renderGameboard(player1Gameboard, "gameboard1");
  }
  function randomizePlayer2Ships() {
    const shipLengths = [5, 4, 3, 3, 2]; // Lengths of the ships
    player2Gameboard.clearBoard(); // Clear the gameboard before placing ships

    for (const length of shipLengths) {
      let row, col, isVertical;
      do {
        row = Math.floor(Math.random() * 10);
        col = Math.floor(Math.random() * 10);
        isVertical = Math.random() < 0.5;
      } while (
        !player2Gameboard.placeShip(new Ship(length), row, col, isVertical)
      );
    }
  }
  function resetPlayer2Gameboard() {
    player2Gameboard.clearBoard();
    randomizePlayer2Ships(); // Randomize ships for player2
    renderGameboard(player2Gameboard, "gameboard2");
  }

  // Function to start a new game by resetting both gameboards
  function startNewGame() {
    player1Gameboard.clearBoard();
    player2Gameboard.clearBoard();
    randomizePlayer1Ships(); // Randomize ships for player1
    randomizePlayer2Ships(); // Randomize ships for player2
    renderGameboards();
    document.getElementById("play-again").style.display = "none";
  }

  // Add event listeners to buttons
  const randomizeShipsButton = document.getElementById("randomize-ships");
  randomizeShipsButton.addEventListener("click", () => {
    randomizePlayer1Ships();
  });

  const resetPlayer2Button = document.getElementById("reset-player2");
  resetPlayer2Button.addEventListener("click", () => {
    resetPlayer2Gameboard();
  });

  const newGameButton = document.getElementById("new-game");
  newGameButton.addEventListener("click", () => {
    startNewGame();
  });
  // Add event listener to the "Play Again" button
const playAgainButton = document.getElementById("play-again");
playAgainButton.addEventListener("click", () => {
  startNewGame();
  playAgainButton.style.display = "none"; // Hide the "Play Again" button after clicking
});

  
  // Initialize the game
  function init() {
    renderGameboards();

    //   For demonstration, make random plays
    // const { row: row1, col: col1 } = player1.makeRandomPlay();
    // player2Gameboard.receiveAttack(row1, col1);
    // const { row: row2, col: col2 } = player2.makeRandomPlay();
    // player1Gameboard.receiveAttack(row2, col2);

    //   renderGameboards();
  }

  return { init };
})();

app.init();
