// AI Class
class TicTacToeAI {
    constructor() {
        this.X = "X";
        this.O = "O";
        this.EMPTY = null;
    }

    currentPlayer(board) {
        let xCount = board.flat().filter(cell => cell === this.X).length;
        let oCount = board.flat().filter(cell => cell === this.O).length;
        return xCount > oCount ? this.O : this.X;
    }

    availableActions(board) {
        let possibleActions = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === this.EMPTY) {
                    possibleActions.push([i, j]);
                }
            }
        }
        return possibleActions;
    }

    boardResult(board, action) {
        let newBoard = board.map(row => row.slice());
        newBoard[action[0]][action[1]] = this.currentPlayer(board);
        return newBoard;
    }

    findWinner(board) {
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

        for (let line of lines) {
            if (line.every(cell => cell === this.X)) return this.X;
            if (line.every(cell => cell === this.O)) return this.O;
        }
        return null;
    }

    isTerminal(board) {
        return this.findWinner(board) !== null || board.flat().every(cell => cell !== this.EMPTY);
    }

    evaluateUtility(board) {
        let win = this.findWinner(board);
        if (win === this.X) return 1;
        if (win === this.O) return -1;
        return 0;
    }

    minimax(board, alpha = -Infinity, beta = Infinity) {
        if (this.isTerminal(board)) {
            return { score: this.evaluateUtility(board) };
        }

        let turn = this.currentPlayer(board);
        let isMaximizing = turn === this.X;
        let bestScore = isMaximizing ? -Infinity : Infinity;
        let bestAction = null;

        for (let action of this.availableActions(board)) {
            let newBoard = this.boardResult(board, action);
            let minimaxResult = this.minimax(newBoard, alpha, beta);
            let score = minimaxResult.score;

            if (isMaximizing) {
                if (score > bestScore) {
                    bestScore = score;
                    bestAction = action;
                }
                alpha = Math.max(alpha, bestScore);
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestAction = action;
                }
                beta = Math.min(beta, bestScore);
            }

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
        this.SIZE = 3;
        this.EMPTY = "&nbsp;";
        this.turn = "X";
        this.squares = [];
        this.gameMode = "multiplayer"; // Game mode: multiplayer or singleplayer
        this.ai = new TicTacToeAI(); // Initialize AI class
        this.init();
    }

    init() {
        this.createBoard();
        this.startNewGame();
        $('#game-modal .close, #game-modal .btn-primary').on('click', this.hideModal);
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.startNewGame();
        // Update button styles
        $("#multiplayer-mode").toggleClass("btn-active", mode === "multiplayer");
        $("#singleplayer-mode").toggleClass("btn-active", mode === "singleplayer");
    }

    createBoard() {
        const board = $("<table border=1 cellspacing=0>");
        let indicator = 1;
        for (let i = 0; i < this.SIZE; i++) {
            const row = $("<tr>");
            board.append(row);
            for (let j = 0; j < this.SIZE; j++) {
                const cell = $("<td height=50 width=50 align=center valign=center></td>");
                cell[0].indicator = indicator;
                cell.click(this.handleCellClick.bind(this));
                row.append(cell);
                this.squares.push(cell);
                indicator <<= 1;
            }
        }
        $('#tictactoe').append(board);
    }

    startNewGame() {
        this.turn = "X";
        this.squares.forEach(square => square.html(this.EMPTY));
    }

    handleCellClick(event) {
        const cell = $(event.currentTarget);
        if (cell.html() !== this.EMPTY) return;

        cell.html(this.turn);
        cell.attr("data-player", this.turn);
        this.checkGameState();

        if (this.gameMode === "singleplayer" && this.turn === "O") {
            this.makeAiMove();
        }
    }

    makeAiMove() {
        setTimeout(() => {
            const boardState = this.convertToBoardState();
            const aiMove = this.ai.minimax(boardState).action;
            if (aiMove) {
                this.squares[aiMove[0] * 3 + aiMove[1]].html("O").attr("data-player", "O");
                this.checkGameState();
                this.turn = "X"; // Switch turn back to currentPlayer
            }
        }, 25);
    }

    convertToBoardState() {
        let boardState = [[], [], []];
        for (let i = 0; i < this.squares.length; i++) {
            let row = Math.floor(i / 3);
            let col = i % 3;
            let cell = this.squares[i].html();
            boardState[row][col] = cell === this.EMPTY ? this.ai.EMPTY : cell;
        }
        return boardState;
    }

    checkGameState() {
        let boardState = this.convertToBoardState();
        if (this.ai.isTerminal(boardState)) {
            let win = this.ai.findWinner(boardState);
            if (win) {
                this.showModal('Game Over', `${win} wins!`);
            } else {
                this.showModal('Game Over', 'It\'s a draw!');
            }
            this.startNewGame();
        } else {
            this.turn = this.turn === "X" ? "O" : "X";
        }
    }

    showModal(title, message) {
        $('#game-modal .modal-title').text(title);
        $('#game-modal .modal-body p').text(message);
        $('#game-modal').modal('show');
    }

    hideModal() {
        $('#game-modal').modal('hide');
    }
}

// Game Initialization
$(() => {
    const game = new TicTacToe();
    game.setGameMode("multiplayer"); // Set default mode
    $("#multiplayer-mode").click(() => game.setGameMode("multiplayer"));
    $("#singleplayer-mode").click(() => game.setGameMode("singleplayer"));
});
