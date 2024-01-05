// AI Class
class TicTacToeAI {
    constructor() {
        this.X = "X";
        this.O = "O";
        this.EMPTY = null;
    }

    player(board) {
        let xCount = board.flat().filter(cell => cell === this.X).length;
        let oCount = board.flat().filter(cell => cell === this.O).length;
        return xCount > oCount ? this.O : this.X;
    }

    actions(board) {
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

    result(board, action) {
        let newBoard = board.map(row => row.slice());
        newBoard[action[0]][action[1]] = this.player(board);
        return newBoard;
    }

    winner(board) {
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

    terminal(board) {
        return this.winner(board) !== null || board.flat().every(cell => cell !== this.EMPTY);
    }

    utility(board) {
        let win = this.winner(board);
        if (win === this.X) return 1;
        if (win === this.O) return -1;
        return 0;
    }

    minimax(board, alpha = -Infinity, beta = Infinity) {
        if (this.terminal(board)) {
            return { score: this.utility(board) };
        }

        let turn = this.player(board);
        let isMaximizing = turn === this.X;
        let bestScore = isMaximizing ? -Infinity : Infinity;
        let bestAction = null;

        for (let action of this.actions(board)) {
            let newBoard = this.result(board, action);
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
class tic_tac_toe {
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
        this.create_board();
        this.start_new_game();
        $('#game-modal .close, #game-modal .btn-primary').on('click', this.hide_modal);
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.start_new_game();
        // Update button styles
        $("#multiplayer-mode").toggleClass("btn-active", mode === "multiplayer");
        $("#singleplayer-mode").toggleClass("btn-active", mode === "singleplayer");
    }

    create_board() {
        const board = $("<table border=1 cellspacing=0>");
        let indicator = 1;
        for (let i = 0; i < this.SIZE; i++) {
            const row = $("<tr>");
            board.append(row);
            for (let j = 0; j < this.SIZE; j++) {
                const cell = $("<td height=50 width=50 align=center valign=center></td>");
                cell[0].indicator = indicator;
                cell.click(this.handle_cell_click.bind(this));
                row.append(cell);
                this.squares.push(cell);
                indicator <<= 1;
            }
        }
        $('#tictactoe').append(board);
    }

    start_new_game() {
        this.turn = "X";
        this.squares.forEach(square => square.html(this.EMPTY));
    }

    handle_cell_click(event) {
        const cell = $(event.currentTarget);
        if (cell.html() !== this.EMPTY) return;

        cell.html(this.turn);
        cell.attr("data-player", this.turn);
        this.check_game_state();

        if (this.gameMode === "singleplayer" && this.turn === "O") {
            this.make_ai_move();
        }
    }

    make_ai_move() {
        setTimeout(() => {
            const boardState = this.convert_to_board_state();
            const aiMove = this.ai.minimax(boardState).action;
            if (aiMove) {
                this.squares[aiMove[0] * 3 + aiMove[1]].html("O").attr("data-player", "O");
                this.check_game_state();
                this.turn = "X"; // Switch turn back to player
            }
        }, 25);
    }

    convert_to_board_state() {
        let boardState = [[], [], []];
        for (let i = 0; i < this.squares.length; i++) {
            let row = Math.floor(i / 3);
            let col = i % 3;
            let cell = this.squares[i].html();
            boardState[row][col] = cell === this.EMPTY ? this.ai.EMPTY : cell;
        }
        return boardState;
    }

    check_game_state() {
        let boardState = this.convert_to_board_state();
        if (this.ai.terminal(boardState)) {
            let win = this.ai.winner(boardState);
            if (win) {
                this.show_modal('Game Over', `${win} wins!`);
            } else {
                this.show_modal('Game Over', 'It\'s a draw!');
            }
            this.start_new_game();
        } else {
            this.turn = this.turn === "X" ? "O" : "X";
        }
    }

    show_modal(title, message) {
        $('#game-modal .modal-title').text(title);
        $('#game-modal .modal-body p').text(message);
        $('#game-modal').modal('show');
    }

    hide_modal() {
        $('#game-modal').modal('hide');
    }
}

// Game Initialization
$(() => {
    const game = new tic_tac_toe();
    game.setGameMode("multiplayer"); // Set default mode
    $("#multiplayer-mode").click(() => game.setGameMode("multiplayer"));
    $("#singleplayer-mode").click(() => game.setGameMode("singleplayer"));
});
