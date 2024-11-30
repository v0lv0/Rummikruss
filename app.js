const board = document.getElementById('board');
const gridSize = 15;

// Initialize the board
const cells = [];
for (let i = 0; i < gridSize; i++) {
    cells[i] = [];
    for (let j = 0; j < gridSize; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = i;
        cell.dataset.col = j;
        cells[i][j] = cell;
        board.appendChild(cell);
    }
}

// Connect to WebSocket server
const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', () => {
    console.log('Connected to WebSocket server.');
});

socket.addEventListener('close', () => {
    console.log('Disconnected from WebSocket server.');
});
socket.addEventListener('message', (event) => {
    const command = JSON.parse(event.data);
    console.log('Received from server:', command); // Log received message

    const { action, row, col, value, color } = command;

    if (action === 'place_tile') {
        console.log(`Placing tile: (${row}, ${col}) = ${value}, color = ${color}`);
        const cell = cells[row][col];
        cell.textContent = value;
        cell.className = `cell tile tile-${color}`;
    } else if (action === 'block_cell') {
        console.log(`Blocking cell: (${row}, ${col})`);
        const cell = cells[row][col];
        cell.className = 'cell blocked';
        cell.textContent = '';
    } else if (action === 'clear_cell') {
        console.log(`Clearing cell: (${row}, ${col})`);
        const cell = cells[row][col];
        cell.className = 'cell';
        cell.textContent = '';
    }
});


