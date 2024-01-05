// Define the Tic-Tac-Toe game class
class tic_tac_toe {
    constructor() {
        // Size of the board (3x3)
        this.SIZE = 3;
        // Representation for an empty square on the board
        this.EMPTY = "&nbsp;";
        // Starting player
        this.turn = "X";
        // Array to hold each cell/square of the board
        this.squares = [];
        // Score object to keep track of each player's moves (represented in binary)
        this.score = { "X": 0, "O": 0 };
        // Counter for the total moves made
        this.moves = 0;
        // Array of binary numbers representing all possible winning combinations
        this.wins = [7, 56, 448, 73, 146, 292, 273, 84];

        // Initialize the game board and set up event listeners
        this.init();
    }

    init() {
        // Create the Tic-Tac-Toe board
        this.create_board();
        // Start a new game session
        this.start_new_game();
        // Attach click event listeners to the modal close button and the primary button
        $('#game-modal .close, #game-modal .btn-primary').on('click', this.hide_modal);
    }

    create_board() {
        // Create a table to represent the game board
        const board = $("<table border=1 cellspacing=0>");
        let indicator = 1;
        for (let i = 0; i < this.SIZE; i += 1) {
            const row = $("<tr>");
            board.append(row);
            for (let j = 0; j < this.SIZE; j += 1) {
                // Create a cell with dimensions and alignment properties
                const cell = $("<td height=50 width=50 align=center valign=center></td>");
                // Assign a binary indicator to each cell to track player moves for win conditions
                cell[0].indicator = indicator;
                // Attach a click event listener to the cell
                cell.click(this.handle_cell_click.bind(this));
                row.append(cell);
                // Add the cell to the squares array
                this.squares.push(cell);
                // Left shift the indicator (doubling its value) for the next cell
                indicator <<= 1;
            }
        }
        // Add the board to the main container
        $('#tictactoe').append(board);
    }

    start_new_game() {
        // Reset game parameters for a new game session
        this.turn = "X";
        this.score = { "X": 0, "O": 0 };
        this.moves = 0;
        // Clear the board cells
        this.squares.forEach(square => square.html(this.EMPTY));
    }

    handle_cell_click(event) {
        // Handle player moves when a cell is clicked
        const cell = $(event.currentTarget);
        // If the cell is not empty, exit the function
        if (cell.html() !== this.EMPTY) return;

        // Mark the cell with the current player's symbol
        cell.html(this.turn);
        cell.attr("data-player", this.turn);
        this.moves += 1;
        // Update the current player's score based on the clicked cell's indicator
        this.score[this.turn] += cell[0].indicator;
        // Check if the current player has won
        if (this.check_win(this.score[this.turn])) {
            // Show the win message and restart the game
            this.show_modal('Congratulations!', `${this.turn} has won the game!`);
            this.start_new_game();
        } else if (this.moves === this.SIZE * this.SIZE) {
            // If all cells are filled and there's no winner, it's a draw
            this.show_modal('It\'s a Draw!', 'No one wins this round. Try again!');
            this.start_new_game();
        } else {
            // Toggle the player turn (from X to O, or O to X)
            this.turn = this.turn === "X" ? "O" : "X";
        }
    }

    check_win(score) {
        // Check if the current player's score matches any winning combinations
        for (let i = 0; i < this.wins.length; i += 1) {
            if ((this.wins[i] & score) === this.wins[i]) {
                return true;
            }
        }
        return false;
    }

    show_modal(title, message) {
        // Display a modal with a given title and message
        $('#game-modal .modal-title').text(title);
        $('#game-modal .modal-body p').text(message);
        $('#game-modal').modal('show');
    }

    hide_modal() {
        // Hide the currently displayed modal
        $('#game-modal').modal('hide');
    }
}

// Once the document is fully loaded, create a new game instance
$(() => {
    new tic_tac_toe();
});