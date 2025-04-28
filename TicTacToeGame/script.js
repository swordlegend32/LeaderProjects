// --- Tic Tac Toe with Q-Learning AI and Rule-Based AI ---

// Grid setup
let Grid = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
];

// Style settings for players
let Style = {
    "X": 'color: red;',
    "O": "color: blue;",
};

// Game state variables
let currentPlayer = "X";
let startingPlayer = "X"; // Starting player for the game
let gameOver = false;
let moves = 0;

// --- Q-Learning AI Class ---
class TicTacToeAI {
    constructor(player) {
        this.player = player;
        this.qTable = {}; // Stores state-action values
        this.learningRate = 0.4;
        this.discountFactor = 0.7;
        this.explorationRate = 0.4;
    }

    getState(grid) {
        return grid.flat().join("");
    }

    getBestAction(state) {
        if (!this.qTable[state]) {
            this.qTable[state] = {};
        }

        const actions = this.qTable[state];
        let bestAction = null;
        let bestValue = -Infinity;

        for (const [action, value] of Object.entries(actions)) {
            if (value > bestValue) {
                bestValue = value;
                bestAction = action;
            }
        }

        return bestAction;
    }

    chooseAction(grid) {
        const state = this.getState(grid);
    
        const validMoves = this.getValidMoves(grid);
    
        // Explore random move
        if (Math.random() < this.explorationRate && validMoves.length > 0) {
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }
    
        // Exploit best known move
        const bestAction = this.getBestAction(state);
        if (bestAction) {
            const [row, col] = bestAction.split(",").map(Number);
            // Make sure the spot is still empty
            if (grid[row][col] === "") {
                return { row, col };
            }
        }
    
        // Fallback random move if best action is occupied
        if (validMoves.length > 0) {
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }
    
        return null; // No moves available
    }
    

    getValidMoves(grid) {
        const validMoves = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (grid[row][col] === "") {
                    validMoves.push({ row, col });
                }
            }
        }
        return validMoves;
    }

    updateQTable(prevState, action, reward, nextState) {
        const actionKey = `${action.row},${action.col}`;

        if (!this.qTable[prevState]) this.qTable[prevState] = {};
        if (!this.qTable[prevState][actionKey]) this.qTable[prevState][actionKey] = 0;

        const oldValue = this.qTable[prevState][actionKey];
        const nextBestValue = this.qTable[nextState]
            ? Math.max(...Object.values(this.qTable[nextState] || {}), 0)
            : 0;

        this.qTable[prevState][actionKey] =
            oldValue + this.learningRate * (reward + this.discountFactor * nextBestValue - oldValue);
    }
}

// --- Rule-Based AI Class ---
class RuleBasedAI {
    constructor(player) {
        this.player = player;
    }

    // Checks if a move can win or block win
    canWin(grid, player) {
        for (let i = 0; i < 3; i++) {
            // Rows
            if (grid[i][0] === player && grid[i][1] === player && grid[i][2] === "") return { row: i, col: 2 };
            if (grid[i][0] === player && grid[i][2] === player && grid[i][1] === "") return { row: i, col: 1 };
            if (grid[i][1] === player && grid[i][2] === player && grid[i][0] === "") return { row: i, col: 0 };

            // Columns
            if (grid[0][i] === player && grid[1][i] === player && grid[2][i] === "") return { row: 2, col: i };
            if (grid[0][i] === player && grid[2][i] === player && grid[1][i] === "") return { row: 1, col: i };
            if (grid[1][i] === player && grid[2][i] === player && grid[0][i] === "") return { row: 0, col: i };
        }

        // Diagonals
        if (grid[0][0] === player && grid[1][1] === player && grid[2][2] === "") return { row: 2, col: 2 };
        if (grid[0][0] === player && grid[2][2] === player && grid[1][1] === "") return { row: 1, col: 1 };
        if (grid[1][1] === player && grid[2][2] === player && grid[0][0] === "") return { row: 0, col: 0 };

        if (grid[0][2] === player && grid[1][1] === player && grid[2][0] === "") return { row: 2, col: 0 };
        if (grid[0][2] === player && grid[2][0] === player && grid[1][1] === "") return { row: 1, col: 1 };
        if (grid[1][1] === player && grid[2][0] === player && grid[0][2] === "") return { row: 0, col: 2 };

        return null;
    }

    chooseAction(grid) {
        let move = this.canWin(grid, this.player);
        if (move) return move;

        const opponent = this.player === "X" ? "O" : "X";
        move = this.canWin(grid, opponent);
        if (move) return move;

        if (grid[1][1] === "") return { row: 1, col: 1 }; // Pick center if available

        const corners = [
            { row: 0, col: 0 },
            { row: 0, col: 2 },
            { row: 2, col: 0 },
            { row: 2, col: 2 },
        ];
        for (const corner of corners) {
            if (grid[corner.row][corner.col] === "") return corner;
        }

        // Pick first empty side
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (grid[row][col] === "") return { row, col };
            }
        }

        return null; // No moves left
    }
}

// --- Game Setup ---
const ai2 = new TicTacToeAI("X");
const ai = new TicTacToeAI("O");



const SpeedSlider = document.getElementById('Speed');

let Speed = SpeedSlider.value; // Default speed

SpeedSlider.addEventListener('change', function() {
    Speed = SpeedSlider.value
});

function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}


function calculateWaitTime(Speed) {
    if (Speed >= 100) {
        return 0;
    }
    if (Speed <= 0) {
        return 2000;
    }

    let maxWaitTime = 500;
    const minWaitTime = 0; 

    maxWaitTime /= 1;

   return Math.floor(lerp(maxWaitTime, minWaitTime, (Speed / 100)));
}

function StartAiGame() {
    if (!gameOver && moves < 9) {
        if (currentPlayer === ai2.player) {
            const aiMove = ai2.chooseAction(Grid);
            makeMove(aiMove.row, aiMove.col);
        } else if (currentPlayer === ai.player) {
            const aiMove = ai.chooseAction(Grid);
            makeMove(aiMove.row, aiMove.col);
        }  
    }
    else {
        console.log("Invalid player turn. Please check the game logic.");
    }
}

function makeMove(row, col) {
    if (Grid[row][col] === "" && !gameOver) {
        const prevState = ai.getState(Grid);

        Grid[row][col] = currentPlayer;
        moves++;
        renderGrid();


        if (checkWin()) {
            console.log(`${currentPlayer} wins!`);
            gameOver = true;

            const reward = currentPlayer === ai.player ? 15 : -15;
            ai.updateQTable(prevState, { row, col }, reward, ai.getState(Grid));
            ai2.updateQTable(prevState, { row, col }, -reward, ai2.getState(Grid));

            setTimeout(resetGame, calculateWaitTime(Speed) * 5);
            return;
        } else if (moves === 9) {
            console.log("It's a draw!");
            gameOver = true;
            ai.updateQTable(prevState, { row, col }, -2, ai.getState(Grid));
            ai2.updateQTable(prevState, { row, col }, 2, ai2.getState(Grid));
            setTimeout(resetGame, calculateWaitTime(Speed) * 5);
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        setTimeout(StartAiGame, calculateWaitTime(Speed));
        
    }
    else {
        console.log("Invalid move. Cell already occupied or game over.");
    }
}

function renderGrid() {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const id = `cell-${row * 3 + col}`;
            const cell = document.getElementById(id);
            if (cell) {
                cell.innerText = Grid[row][col];
                cell.style = Style[Grid[row][col]] || "";
                cell.style.fontSize = Grid[row][col] === "" ? "1em" : "5em";
            }
        }
    }
}

function checkWin() {
    for (let i = 0; i < 3; i++) {
        if (Grid[i][0] === Grid[i][1] && Grid[i][1] === Grid[i][2] && Grid[i][0] !== "") return true;
        if (Grid[0][i] === Grid[1][i] && Grid[1][i] === Grid[2][i] && Grid[0][i] !== "") return true;
    }
    if (Grid[0][0] === Grid[1][1] && Grid[1][1] === Grid[2][2] && Grid[0][0] !== "") return true;
    if (Grid[0][2] === Grid[1][1] && Grid[1][1] === Grid[2][0] && Grid[0][2] !== "") return true;
    return false;
}

function resetGame() {
    Grid = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];
    gameOver = false;
    startingPlayer = startingPlayer === "X" ? "O" : "X";
    currentPlayer = startingPlayer;
    moves = 0;
    renderGrid();
    StartAiGame();
}

// --- Event Listeners ---
for (let i = 0; i < 9; i++) {
    document.getElementById(`cell-${i}`).addEventListener("click", () => makeMove(Math.floor(i / 3), i % 3));
}
document.getElementById("resetbutton").addEventListener("click", resetGame);

// Initialize the first game
resetGame();
