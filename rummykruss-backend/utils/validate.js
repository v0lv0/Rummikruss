function isValidSet(tiles) {
    if (tiles.length < 3) return false;

    const isAscending = tiles.every((t, i) => i === 0 || t === tiles[i - 1] + 1);
    const isDescending = tiles.every((t, i) => i === 0 || t === tiles[i - 1] - 1);
    const isRepeating = tiles.every((t) => t === tiles[0]);

    return isAscending || isDescending || isRepeating;
}

function validatePlacement(board, tiles, positions, lastOpponentTurn) {
    const connectedSets = {};

    // Check positions are within bounds
    const boardSize = board.length;
    positions.forEach(([x, y]) => {
        if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
            throw new Error("Placement out of bounds");
        }
        if (board[x][y] !== null) {
            throw new Error("Cannot place on an occupied tile");
        }
    });

    // Check tiles form valid sets
    positions.forEach(([x, y], idx) => {
        const tile = tiles[idx];

        // Check intersections for valid sets
        const connectedLines = [
            getLine(board, x, y, "row"), // Horizontal line
            getLine(board, x, y, "col"), // Vertical line
        ];

        connectedLines.forEach((line) => {
            if (!line.includes(tile)) line.push(tile);
            line.sort((a, b) => a - b); // Sort for validation
            if (!isValidSet(line)) {
                throw new Error(`Invalid set formed at (${x}, ${y})`);
            }
        });

        // Track sets for scoring
        connectedSets[`${x},${y}`] = connectedLines;
    });

    // Check restricted numbers
    const opponentNumbers = lastOpponentTurn?.tiles || [];
    const forbiddenNumber = opponentNumbers[opponentNumbers.length - 1];
    if (tiles.includes(forbiddenNumber)) {
        throw new Error(`Cannot use number ${forbiddenNumber} (used by opponent last turn)`);
    }

    // Check restricted connections
    const opponentPositions = lastOpponentTurn?.positions || [];
    opponentPositions.forEach(([ox, oy]) => {
        positions.forEach(([x, y]) => {
            if (Math.abs(x - ox) <= 1 && Math.abs(y - oy) <= 1) {
                throw new Error("Cannot connect to opponent's last move");
            }
        });
    });

    return connectedSets;
}

function getLine(board, x, y, direction) {
    const line = [];
    if (direction === "row") {
        for (let i = 0; i < board.length; i++) {
            if (board[x][i] !== null) line.push(board[x][i]);
        }
    } else if (direction === "col") {
        for (let i = 0; i < board.length; i++) {
            if (board[i][y] !== null) line.push(board[i][y]);
        }
    }
    return line;
}

module.exports = { validatePlacement };
