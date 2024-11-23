const express = require('express');
const Game = require('../models/game');
const router = express.Router();

let games = {}; // Store games in memory (use a database for production)

// Create a new game
router.post('/new', (req, res) => {
    const { playerNames, boardSize } = req.body;
    const game = new Game(playerNames, boardSize);
    games[game.id] = game;
    res.status(201).json({ gameId: game.id, state: game.getGameState() });
});

// Get game state
router.get('/:gameId', (req, res) => {
    const game = games[req.params.gameId];
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(game.getGameState());
});

// Player draws a tile
router.post('/:gameId/draw', (req, res) => {
    const { playerIndex } = req.body;
    const game = games[req.params.gameId];
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const tile = game.drawTile(playerIndex);
    if (!tile) return res.status(400).json({ error: 'No tiles left in the pool' });

    res.json({ tile, state: game.getGameState() });
});

// Player places tiles
router.post('/:gameId/place', (req, res) => {
    const { playerIndex, tiles, positions } = req.body;
    const game = games[req.params.gameId];
    if (!game) return res.status(404).json({ error: 'Game not found' });

    try {
        game.placeTiles(playerIndex, tiles, positions);
        res.json(game.getGameState());
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// End the game and determine the winner
router.post('/:gameId/end', (req, res) => {
    const game = games[req.params.gameId];
    if (!game) return res.status(404).json({ error: 'Game not found' });

    try {
        const winner = game.calculateWinner();
        res.json({ winner, state: game.getGameState() });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Check game state for endgame
router.get('/:gameId/check-end', (req, res) => {
    const game = games[req.params.gameId];
    if (!game) return res.status(404).json({ error: 'Game not found' });

    res.json({ endgameTriggered: game.endgameTriggered, state: game.getGameState() });
});

module.exports = router;
