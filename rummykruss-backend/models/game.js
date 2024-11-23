const { v4: uuidv4 } = require('uuid');
const { validatePlacement } = require('../utils/validate');

class Game {
    constructor(playerNames, boardSize = 10, maxTurns = 20) {
        this.id = uuidv4();
        this.board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null)); // Empty grid
        this.tilePool = this.generateTiles();
        this.players = playerNames.map(name => ({
            name,
            tiles: [],
            score: 0,
            lastMove: null,
        }));
        this.currentTurn = 0; // Index of the current player
        this.maxTurns = maxTurns;
        this.turnCount = 0;
        this.endgameTriggered = false;
    }

    generateTiles() {
        const tiles = [];
        for (let num = 1; num <= 9; num++) {
            for (let i = 0; i < 4; i++) tiles.push(num); // Four copies of each number
        }
        return tiles.sort(() => Math.random() - 0.5); // Shuffle
    }

    placeTiles(playerIndex, tiles, positions) {
        const player = this.players[playerIndex];
        const lastOpponentTurn = this.players[(playerIndex + 1) % this.players.length].lastMove;

        // Validate placement
        const connectedSets = validatePlacement(this.board, tiles, positions, lastOpponentTurn);

        // Calculate scoring
        let points = 0;
        positions.forEach(([x, y]) => {
            if (this.isIntersection(x, y)) points += 2; // Intersection bonus
            else points += 1; // Standard placement
        });

        // Update board
        tiles.forEach((tile, idx) => {
            const [x, y] = positions[idx];
            this.board[x][y] = tile;
        });

        // Update player state
        player.score += points;
        player.tiles = player.tiles.filter(t => !tiles.includes(t));
        player.lastMove = { tiles, positions };

        // Check endgame conditions
        this.checkEndgame();

        // Advance turn
        this.currentTurn = (this.currentTurn + 1) % this.players.length;
        this.turnCount++;
    }

    drawTile(playerIndex) {
        if (this.tilePool.length === 0) return null;
        const tile = this.tilePool.pop();
        this.players[playerIndex].tiles.push(tile);
        return tile;
    }
    
    isIntersection(x, y) {
        const directions = [
            [0, 1], [1, 0], [0, -1], [-1, 0],
        ];
        let connections = 0;

        directions.forEach(([dx, dy]) => {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < this.board.length && ny < this.board[0].length) {
                if (this.board[nx][ny] !== null) connections++;
            }
        });

        return connections > 2; // Intersections occur when >2 directions have tiles
    }


    checkEndgame() {
        const allPlayersOutOfMoves = this.players.every(player => player.tiles.length === 0);
        const noMoreTurns = this.turnCount >= this.maxTurns;
        const tilePoolEmpty = this.tilePool.length === 0;

        if (allPlayersOutOfMoves || noMoreTurns || (tilePoolEmpty && this.turnCount > 0)) {
            this.endgameTriggered = true;
        }
    }

    calculateWinner() {
        if (!this.endgameTriggered) throw new Error("Game has not ended yet!");

        const scores = this.players.map(p => ({
            name: p.name,
            score: p.score,
            intersections: p.lastMove ? p.lastMove.positions.length : 0,
            unusedTiles: p.tiles.length,
        }));

        scores.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.intersections !== a.intersections) return b.intersections - a.intersections;
            return a.unusedTiles - b.unusedTiles;
        });

        return scores[0]; // Return the winner
    }


getGameState() {
        return {
            id: this.id,
            board: this.board,
            players: this.players,
            tilePoolSize: this.tilePool.length,
            currentTurn: this.currentTurn,
            turnCount: this.turnCount,
            endgameTriggered: this.endgameTriggered,
        };
    }
}

module.exports = Game;
