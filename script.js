// AI Class
class TicTacToeAI {
    constructor() {
        // Constants representing players and empty cells
        this.X = "X";
        this.O = "O";
        this.EMPTY = null;
    }

    // Determine the current player based on the board state
    currentPlayer(board) {
        // Count the number of X and O cells
        let xCount = board.flat().filter(cell => cell === this.X).length;
        let oCount = board.flat().filter(cell => cell === this.O).length;
        // If X has played more or equal times than O, it's O's turn, else X's turn
        return xCount > oCount ? this.O : this.X;
    }

    // Find all available actions (empty cells) on the board
    availableActions(board) {
        let possibleActions = [];
        // Loop through the board to find empty cells
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === this.EMPTY) {
                    possibleActions.push([i, j]);
                }
            }
        }
        return possibleActions;
    }

    // Return a new board state after applying a given action
    boardResult(board, action) {
        // Create a deep copy of the board
        let newBoard = board.map(row => row.slice());
        // Set the action (placing X or O) on the copied board
        newBoard[action[0]][action[1]] = this.currentPlayer(board);
        return newBoard;
    }

    // Determine if there is a winner
    findWinner(board) {
        // Define all possible winning lines (rows, columns, diagonals)
        const lines = [
            [board[0][0], board[0][1], board[0][2]],
            [board[1][0], board[1][1], board[1][2]],
            [board[2][0], board[2][1], board[2][2]],
            [board[0][0], board[1][0], board[2][0]],
            [board[0][1], board[1][1], board[2][1]],
            [board[0][2], board[1][2], board[2][2]],
            [board[0][0], board[1][1], board[2][2]],
            [board[0][2], board[1][1], board[2][0]]
        ];

        // Check each line for a winner
        for (let line of lines) {
            if (line.every(cell => cell === this.X)) return this.X;
            if (line.every(cell => cell === this.O)) return this.O;
        }
        return null;
    }

    // Check if the game has ended
    isTerminal(board) {
        // Game is over if there's a winner or if the board is full
        return this.findWinner(board) !== null || board.flat().every(cell => cell !== this.EMPTY);
    }

    // Evaluate the utility of the board (1 for X win, -1 for O win, 0 for draw)
    evaluateUtility(board) {
        let win = this.findWinner(board);
        if (win === this.X) return 1;
        if (win === this.O) return -1;
        return 0;
    }

    // Minimax algorithm for best move calculation
    minimax(board, alpha = -Infinity, beta = Infinity) {
        // Base case: return utility if the game is at a terminal state
        if (this.isTerminal(board)) {
            return { score: this.evaluateUtility(board) };
        }

        // Determine whose turn it is
        let turn = this.currentPlayer(board);
        let isMaximizing = turn === this.X;
        let bestScore = isMaximizing ? -Infinity : Infinity;
        let bestAction = null;

        // Iterate over all possible actions
        for (let action of this.availableActions(board)) {
            // Calculate score for new board state after applying the action
            let newBoard = this.boardResult(board, action);
            let minimaxResult = this.minimax(newBoard, alpha, beta);
            let score = minimaxResult.score;

            // Update bestScore and bestAction based on the score
            if (isMaximizing) {
                // Maximizing player (X)
                if (score > bestScore) {
                    bestScore = score;
                    bestAction = action;
                }
                alpha = Math.max(alpha, bestScore);
            } else {
                // Minimizing player (O)
                if (score < bestScore) {
                    bestScore = score;
                    bestAction = action;
                }
                beta = Math.min(beta, bestScore);
            }

            // Alpha-beta pruning
            if (beta <= alpha) {
                break;
            }
        }
        return { score: bestScore, action: bestAction };
    }
}

// Tic-Tac-Toe Game Class
class TicTacToe {
    constructor() {
        // Game constants and state variables
        this.SIZE = 3;
        this.EMPTY = "&nbsp;"; // HTML entity for a non-breaking space
        this.turn = "X"; // Starting player
        this.squares = []; // Array to store cell elements
        this.gameMode = "multiplayer"; // Default game mode
        this.ai = new TicTacToeAI(); // Initialize the AI

        this.init(); // Initialize the game
    }

    // Initialize the game setup
    init() {
        this.createBoard(); // Create the game board
        this.startNewGame(); // Start a new game
        // Setup event listeners for modal close and game mode buttons
        $('#game-modal .close, #game-modal .btn-primary').on('click', this.hideModal);
    }

    // Set the game mode and update the UI accordingly
    setGameMode(mode) {
        this.gameMode = mode;
        this.startNewGame();
        // Update UI elements for the selected mode
        $("#multiplayer-mode").toggleClass("btn-active", mode === "multiplayer");
        $("#singleplayer-mode").toggleClass("btn-active", mode === "singleplayer");
    }

    // Create the game board with HTML table elements
    createBoard() {
        // Create a table for the board
        const board = $("<table border=1 cellspacing=0>");
        let indicator = 1;
        for (let i = 0; i < this.SIZE; i++) {
            // Create rows and cells
            const row = $("<tr>");
            board.append(row);
            for (let j = 0; j < this.SIZE; j++) {
                // Define each cell, assign an indicator, and attach click event
                const cell = $("<td height=50 width=50 align=center valign=center></td>");
                cell[0].indicator = indicator;
                cell.click(this.handleCellClick.bind(this));
                row.append(cell);
                this.squares.push(cell); // Add cell to squares array
                indicator <<= 1;
            }
        }
        // Append the board to the game container
        $('#tictactoe').append(board);
    }

    // Start a new game by resetting the board and turn
    startNewGame() {
        this.turn = "X"; // Reset turn to X
        // Clear all cells
        this.squares.forEach(square => square.html(this.EMPTY));
    }

    // Handle cell click events
    handleCellClick(event) {
        // Prevent action if cell is already filled
        const cell = $(event.currentTarget);
        if (cell.html() !== this.EMPTY) return;

        // Update cell with the current player's symbol
        cell.html(this.turn);
        cell.attr("data-player", this.turn);
        // Check the state of the game
        this.checkGameState();

        // If singleplayer mode and AI's turn, make an AI move
        if (this.gameMode === "singleplayer" && this.turn === "O") {
            this.makeAiMove();
        }
    }

    // AI makes a move
    makeAiMove() {
        setTimeout(() => {
            // Convert the current board state for AI processing
            const boardState = this.convertToBoardState();
            // Get the AI's move and apply it to the board
            const aiMove = this.ai.minimax(boardState).action;
            if (aiMove) {
                this.squares[aiMove[0] * 3 + aiMove[1]].html("O").attr("data-player", "O");
                // Check game state and switch turn
                this.checkGameState();
                this.turn = "X"; // Switch turn back to currentPlayer
            }
        }, 100); // Delay to simulate thinking time
    }

    // Convert HTML board to a 2D array for AI processing
    convertToBoardState() {
        let boardState = [[], [], []];
        // Loop through squares to construct the board state
        for (let i = 0; i < this.squares.length; i++) {
            let row = Math.floor(i / 3);
            let col = i % 3;
            let cell = this.squares[i].html();
            boardState[row][col] = cell === this.EMPTY ? this.ai.EMPTY : cell;
        }
        return boardState;
    }

    // Check if the game has ended and update UI accordingly
    checkGameState() {
        let boardState = this.convertToBoardState();
        // Check for terminal state and show modal with result
        if (this.ai.isTerminal(boardState)) {
            let win = this.ai.findWinner(boardState);
            if (win) {
                // If there is a winner, show a modal with the winner
                this.showModal('Game Over', `${win} wins!`);
            } else {
                // If it's a draw, show a draw message
                this.showModal('Game Over', 'It\'s a draw!');
            }
            // Start a new game after showing the modal
            this.startNewGame();
        } else {
            // If the game is not over, switch the turn
            this.turn = this.turn === "X" ? "O" : "X";
        }
    }

    // Display modal with game result
    showModal(title, message) {
        // Update and show the modal with provided title and message
        $('#game-modal .modal-title').text(title);
        $('#game-modal .modal-body p').text(message);
        $('#game-modal').modal('show');
    }

    // Hide the game modal
    hideModal() {
        // Code to hide the modal
        $('#game-modal').modal('hide');
    }
}

// Game Initialization
$(() => {
    // Create a new game instance and set default game mode
    const game = new TicTacToe();
    game.setGameMode("multiplayer"); // Set default mode

    // Setup click events for game mode buttons
    $("#multiplayer-mode").click(() => game.setGameMode("multiplayer"));
    $("#singleplayer-mode").click(() => game.setGameMode("singleplayer"));
});