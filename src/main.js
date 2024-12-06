const boardSize = 10; // Adjust size of the board
const numCards = 8; // Number of unique cards
const numDecks = 2;   // How many times each card repeats

const cellSize = 42;
const cellMargin = 2;
const cellBorder = 1;
const suiteColors = ['#FF63474D', '#3CB3714D', '#FFD7004D', '#4682B44D', '#8A2BE24D', '#FF45004D', '#32CD324D', '#6A5A3D4D']
const cardSize = 40;
const numPlayers = 2;

function addBoardPadding(board, cellBorder, cellMargin) {
    padding = cellMargin / 2;
    board.style.paddingRight = `${cellBorder + padding}px`;
    board.style.paddingBottom = `${cellBorder + padding}px`;
    board.style.paddingTop = `${padding}px`;
    board.style.paddingLeft = `${padding}px`;
}

class ConfigSelectionBox {
    constructor({ options, defaultOption, labelText }) {
        const container = document.createElement('div');
        container.classList.add('setting-picker-item');

        // Create label
        if (labelText) {
            const label = document.createElement('label');
            label.textContent = labelText;
            label.classList.add('setting-picker-item-label');
            container.appendChild(label);
        }

        // Create slider element
        this.select = document.createElement('select');
        let idx = 0;
        this.currentSelection = options[0];
        options.forEach(option => {
            const optionTag = document.createElement('option');
            if (idx == defaultOption) {
                optionTag.setAttribute('selected', 'selected');
                this.currentSelection = option;
            }
            optionTag.value = option;
            optionTag.textContent = option;
            this.select.appendChild(optionTag);
            idx++;
        })
        container.appendChild(this.select);

        // Add event listener to update value
        this.select.addEventListener('change', e => {
            this.currentSelection = e.target.value;
        });

        this.container = container;
    }

    getValue() { return this.currentSelection; }
    getElement() { return this.container; }
}

class ConfigSlider {
    constructor({ min, max, defaultValue, step, labelText }) {
        const container = document.createElement('div');
        container.classList.add('setting-picker-item');

        // Create label
        if (labelText) {
            const label = document.createElement('label');
            label.textContent = labelText;
            label.classList.add('setting-picker-item-label');
            container.appendChild(label);
        }

        const innerContainer = document.createElement('div');
        innerContainer.classList.add('setting-picker-item-input-container');
        container.appendChild(innerContainer);
        // Create slider element
        this.slider = document.createElement('input');
        this.slider.type = 'range';
        this.slider.classList.add('setting-picker-item-input');
        this.slider.classList.add('setting-picker-item-input-int-range');
        this.slider.setAttribute('type', 'range');
        this.slider.setAttribute('min', `${min}`);
        this.slider.setAttribute('max', `${max}`);
        this.slider.value = defaultValue;
        innerContainer.appendChild(this.slider);

        // Create value display
        this.valueDisplay = document.createElement('div');
        this.valueDisplay.classList.add('setting-picker-item-input-value');
        this.valueDisplay.textContent = this.slider.value;
        innerContainer.appendChild(this.valueDisplay);

        // Add event listener to update value
        this.slider.addEventListener('input', () => {
            this.valueDisplay.textContent = this.slider.value;
        });
        this.container = container;
    }

    // Method to get the current value
    getValue() {
        return this.slider.value;
    }

    // Method to set a new value
    setValue(newValue) {
        this.slider.value = newValue;
        this.valueDisplay.textContent = newValue;
    }

    getElement() { return this.container; }
}

class TextBox {
    constructor({ defaultText, labelText }) {
        this.defaultText = defaultText;
        const container = document.createElement('div');
        container.classList.add('setting-picker-item');

        // Create label
        if (labelText) {
            const label = document.createElement('label');
            label.textContent = labelText;
            label.classList.add('setting-picker-item-label');
            container.appendChild(label);
        }

        const textBox = document.createElement('input');
        textBox.setAttribute('type', 'text');
        textBox.classList.add('setting-picker-item-input');
        textBox.classList.add('setting-picker-item-input-string');
        textBox.placeholder = defaultText;
        textBox.addEventListener('change', e => {
            this.value = e.target.value;
        })
        container.appendChild(textBox);
        this.container = container;
    }

    getElement() { return this.container; }

    getValue() { return this.value; }
}

// TODO: call initial board config
// [x,y,color,num]
const initialBoardConfig = [];
// const initialBoardConfig = [[2, 2, 0, 2], [4, 4, 0, 3]];
// TODO: Replace this with actual game logic
class GameState {
    constructor(boardSize, numDecks, numCards) {
        this.callbacks = {};
        this.currentPlayer = 0;
        this.cards = Array.from(
            { length: numDecks },
            _ => Array.from({ length: numCards }, _ => true)
        );
        this.board = Array.from(
            { length: boardSize },
            _ => Array.from({ length: boardSize }, _ => [-1, -1] )
        );
        this.gameOver_ = false;
        this.scores = Array(numPlayers).fill(0);
    }
    calculateScore(playerId) {
        let score = 0;
        // Example scoring logic: count the number of cards the player has placed
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j][0] != -1 && this.board[i][j][0] === playerId) {
                    score += 10;  // Award 10 points for each card placed
                }
            }
        }
        this.scores[playerId] = score;
    }

    getScore(playerId) {
        return this.scores[playerId];
    }

    getScores() {
        return this.scores;
    }
    
    notify() {
        for (const [_, callback] of Object.entries(this.callbacks))
            callback(this);
    }

    addNotifyCallback(name, callback) {
        if (this.callbacks[name] != undefined) {
            throw new Error(`callback for '${name}' already exists`);
        }
        this.callbacks[name] = callback;
    }

    removeNotifyCallback(name) {
        if (this.callbacks[name] == undefined) {
            throw new Error(`callback '${name}' doesn't exist`);
        }
        delete this.callbacks[name];
    }

    set currentPlayer(value) {
        this.currentPlayer_ = value;
        this.notify();
    }

    get currentPlayer() { 
        return this.currentPlayer_; 
    }

    canPlaceCard(row, col, suiteId, cardNumber) {
        if (this.board[row][col][0] != -1
            || this.board[row][col][1] != -1
            || !this.cards[suiteId][cardNumber]) {
            return false;
        }
        return true;
    }
    
    placeCard(row, col, suiteId, cardNumber) {
        if (!this.canPlaceCard(row, col, suiteId, cardNumber))
            throw new Error("Invalid call, need to check before calling this");

        this.board[row][col] = [suiteId, cardNumber];
        this.cards[suiteId][cardNumber] = false;

        if (this.cards.every(cards => cards.every(c => !c))) {
            this.gameOver_ = true;
        }

        // this.currentPlayer = (this.currentPlayer + 1) % numPlayers;
        this.notify();
    }
    
    
    isCardValid(x, y) {
        const suiteId    = this.board[x][y][0];
        const cardNumber = this.board[x][y][1];

        // Check for same suite in all 4 directions
        let count = 1;
        let dis_from_origin = 1;

        while (x - dis_from_origin >= 0 && this.board[x - dis_from_origin][y][1] === cardNumber) {
            count++;
            dis_from_origin++;
        }
        dis_from_origin = 1;

        while (x + dis_from_origin < this.board.length && this.board[x + dis_from_origin][y][1] === cardNumber) {
            count++;
            dis_from_origin++;
        }
        if (count >= 3) return true;
        
        count = 1;
        dis_from_origin = 1;
        while (y - dis_from_origin >= 0 && this.board[x][y - dis_from_origin][1] === cardNumber) {
            count++;
            dis_from_origin++;
        }
        dis_from_origin = 1;
        while (y + dis_from_origin < this.board.length && this.board[x][y + dis_from_origin][1] === cardNumber) {
            count++;
            dis_from_origin++;
        }
        if (count >= 3) return true;


        // Check for consecutive numbers in all 4 directions
        // check left half for decreasing numbers
        count = 1;
        dis_from_origin = 1;
        while (x - dis_from_origin >= 0 && this.board[x - dis_from_origin][y][1] === cardNumber - dis_from_origin) {
            count++;
            dis_from_origin++;
        }
        dis_from_origin = 1;

        // Check right half for increasing numbers
        while (x + dis_from_origin < this.board.length && this.board[x + dis_from_origin][y][1] === cardNumber + dis_from_origin) {
            count++;
            dis_from_origin++;
        }
        if (count >= 3) return true;

        count = 1;
        dis_from_origin = 1;
        // check left half for increasing numbers
        while ( x- dis_from_origin >= 0 && this.board[x - dis_from_origin][y][1] === cardNumber + dis_from_origin) {
            count++;
            dis_from_origin++;
        }
        dis_from_origin = 1;
        // check right half for decreasing numbers
        while (x + dis_from_origin < this.board.length && this.board[x + dis_from_origin][y][1] === cardNumber - dis_from_origin) {
            count++;
            dis_from_origin++;
        }
        if (count >= 3) return true;

        count = 1;
        dis_from_origin = 1;
        // check top half for decreasing numbers
        while (y - dis_from_origin >= 0 && this.board[x][y - dis_from_origin][1] === cardNumber - dis_from_origin) {
            count++;
            dis_from_origin++;
        }
        dis_from_origin = 1;
        // check bottom half for increasing numbers
        while (y + dis_from_origin < this.board.length && this.board[x][y + dis_from_origin][1] === cardNumber + dis_from_origin) {
            count++;
            dis_from_origin++;
        }
        if (count >= 3) return true;

        count = 1;
        dis_from_origin = 1;
        // check top half for increasing numbers
        while (y - dis_from_origin >= 0 && this.board[x][y - dis_from_origin][1] === cardNumber + dis_from_origin) {
            count++;
            dis_from_origin++;
        }
        dis_from_origin = 1;
        // check bottom half for decreasing numbers
        while (y + dis_from_origin < this.board.length && this.board[x][y + dis_from_origin][1] === cardNumber - dis_from_origin) {
            count++;
            dis_from_origin++;
        }
        if (count >= 3) return true;

        return false;
    }

    isBoardValid(){
        // board is valid if all placed cards are valid
        for(let i = 0; i < this.board.length; i++){
            for(let j = 0; j < this.board.length; j++){
                if(this.board[i][j][0] == -1) continue;
                if(!this.isCardValid(i, j)){
                    console.log("Invalid card at ", i, j);
                    return false;
                }
                
            }
        }
        return true;
    }

    // getScore(playerId) { 
    //     return (playerId + 1) * 100; 
    // }
    // getScores() {
    //     return [100, 200]; 
    // }

    get gameOver() { return this.gameOver_; }
}
let gameState = null;

class GameView {
    constructor(boardSize, numDecks, numCards, initialBoardConfig) {
        gameState = new GameState(boardSize, numDecks, numCards);
        this.selectedCard = null;
        this.numDecks = numDecks;
        this.boardSize = boardSize;
        const cardBlock = document.getElementById('card-block');
        this.deckViews = Array.from(
            { length: numDecks },
            (_, k) => new DeckView(this, k, numCards));
        this.deckViews.forEach(deckView =>
            cardBlock.appendChild(deckView.deckDiv));
        this.boardView = new BoardView(this, boardSize);

        initialBoardConfig.forEach(x => this.boardView.placeCard(...x));
        gameState.currentPlayer = 0;
    }
}

class DeckView {
    constructor(parentView, suiteId, numCards) {
        this.gameView = parentView;
        const deck = document.createElement('div');
        deck.classList.add('card-deck');
        this.cardViews = Array.from(
            { length: numCards },
            (_, k) => new CardView(this, suiteId, k));
        this.cardViews.forEach(card => {
            const fixedPos = document.createElement('div');
            fixedPos.style.width = `${cellSize}px`;
            fixedPos.style.height = `${cellSize}px`;
            fixedPos.appendChild(card.cardDiv);
            deck.appendChild(fixedPos);
        });
        deck.addEventListener('click', e => this.onClick(e));
        this.deckDiv = deck;
    }

    onClick(e) {
        const target = e.target;
        if (target.classList.contains('card')) {
            if (this.gameView.selectedCard)
                this.gameView.selectedCard.classList.remove('selected');
            this.gameView.selectedCard = target;
            this.gameView.selectedCard.classList.add('selected');
        }
    }
}

class CardView {
    constructor(parentView, suiteId, cardNumber) {
        this.suiteId = suiteId;
        const card = document.createElement('div');
        card.setAttribute('id', `card_${suiteId}_${cardNumber}`)
        card.classList.add('card');
        card.classList.add('card-hover');
        card.style.height = `${cardSize}px`;
        card.style.width = `${cardSize}px`;
        card.style.background = suiteColors[suiteId % suiteColors.length];
        card.textContent = cardNumber;
        card.dataset.cardNumber = cardNumber;
        card.dataset.suiteId = suiteId;
        this.cardDiv = card;
    }
}

class CellView {
    constructor(boardView, row, col) {
        this.boardView = boardView;
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.style.width = `${cellSize}px`
        cell.style.height = `${cellSize}px`
        cell.style.border = `${cellBorder}px solid gray`;
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.setAttribute('id', `cell_${row}_${col}`);
        this.cellDiv = cell;
    }
}

// class BoardView {
//     constructor(parentView, boardSize) {
//         this.gameView = parentView;
//         this.boardSize = boardSize;
//         this.cellViews = [];
//         const board = document.getElementById('board');
//         board.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSize}px)`;
//         board.style.gridTemplateRows = `repeat(${boardSize}, ${cellSize}px)`;
//         board.style.gap = `${cellMargin}px`
//         addBoardPadding(board, 0, cellMargin);
//         for (let i = 0; i < boardSize; i++) {
//             for (let j = 0; j < boardSize; j++) {
//                 const cellView = new CellView(this, i, j);
//                 board.appendChild(cellView.cellDiv);
//                 this.cellViews.push(cellView);
//             }
//         }

//         board.addEventListener('mouseover', e => {
//             const target = e.target;
//             if (target.getAttribute('id').includes('cell') && target.childElementCount == 0) {
//                 if (this.gameView.selectedCard)
//                     target.classList.add('hover');
//             }
//         });
//         board.addEventListener('mouseout', e => {
//             const target = e.target;
//             if (target.getAttribute('id').includes('cell'))
//                 if (target.classList.contains('hover'))
//                     target.classList.remove('hover');
//         });
//         board.addEventListener('click', e => this.onClick(e));

//         this.boardDiv = board;
//     }

//     placeCard(row, col, suiteId, cardNumber) {
//         if (!gameState.canPlaceCard(row, col, suiteId, cardNumber)) {
//             return;
//         }
//         const cellView = this.cellViews[row * this.boardSize + col];
//         const cell = cellView.cellDiv;
//         const selectedCard = this.gameView.deckViews[suiteId]
//             .cardViews[cardNumber].cardDiv;
//         cell.appendChild(selectedCard);
//         // Remove hover over for the selected card:
//         selectedCard.classList.remove('selected');
//         selectedCard.classList.remove('card-hover');

//         this.gameView.selectedCard = null;
//         // Remove hover over for cell
//         cell.classList.remove('hover');
//         cell.classList.add('occupied');
//         gameState.placeCard(row, col, suiteId, cardNumber);
//     }

//     onClick(e) {
//         if (!e.target.getAttribute('id').includes('cell')
//             || e.target.childElementCount != 0)
//             return;
//         if (!this.gameView.selectedCard) return;
//         const selectedCard = this.gameView.selectedCard;
//         const cell = e.target;
//         const row = cell.dataset.row;
//         const col = cell.dataset.col;
//         this.placeCard(parseInt(row), parseInt(col),
//             parseInt(selectedCard.dataset.suiteId),
//             parseInt(selectedCard.dataset.cardNumber));
//     }
// }
class BoardView {
    constructor(parentView, boardSize) {
        this.gameView = parentView;
        this.boardSize = boardSize;
        this.cellViews = [];
        const board = document.getElementById('board');
        board.style.gridTemplateColumns = `repeat(${boardSize}, ${cellSize}px)`;
        board.style.gridTemplateRows = `repeat(${boardSize}, ${cellSize}px)`;
        board.style.gap = `${cellMargin}px`
        addBoardPadding(board, 0, cellMargin);

        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                const cellView = new CellView(this, i, j);
                board.appendChild(cellView.cellDiv);
                this.cellViews.push(cellView);
            }
        }

        board.addEventListener('mouseover', e => {
            const target = e.target;
            if (target.getAttribute('id').includes('cell') && target.childElementCount == 0) {
                if (this.gameView.selectedCard)
                    target.classList.add('hover');
            }
        });

        board.addEventListener('mouseout', e => {
            const target = e.target;
            if (target.getAttribute('id').includes('cell'))
                if (target.classList.contains('hover'))
                    target.classList.remove('hover');
        });

        board.addEventListener('click', e => this.onClick(e));

        board.addEventListener('dblclick', e => this.onDoubleClick(e)); // Add double-click listener

        this.boardDiv = board;
    }

    placeCard(row, col, suiteId, cardNumber) {
        if (!gameState.canPlaceCard(row, col, suiteId, cardNumber)) {
            return;
        }
        const cellView = this.cellViews[row * this.boardSize + col];
        const cell = cellView.cellDiv;
        const selectedCard = this.gameView.deckViews[suiteId]
            .cardViews[cardNumber].cardDiv;
        cell.appendChild(selectedCard);
        // Remove hover over for the selected card:
        selectedCard.classList.remove('selected');
        selectedCard.classList.remove('card-hover');

        this.gameView.selectedCard = null;
        // Remove hover over for cell
        cell.classList.remove('hover');
        cell.classList.add('occupied');
        gameState.placeCard(row, col, suiteId, cardNumber);
    }

    removeCard(row, col) {
        const cellView = this.cellViews[row * this.boardSize + col];
        const cell = cellView.cellDiv;
        const [suiteId, cardNumber] = gameState.board[row][col];
    
        if (suiteId === -1 || cardNumber === -1) return; // No card to remove
    
        // Add the card back to its original position in the deck
        const cardView = this.gameView.deckViews[suiteId].cardViews[cardNumber];
        const card = cardView.cardDiv;
    
        // Restore the card to its exact original slot in the deck
        const deck = this.gameView.deckViews[suiteId].deckDiv;
        const slot = deck.children[cardNumber]; // Access the specific slot for this card
        slot.appendChild(card);
    
        // Update game state
        gameState.board[row][col] = [-1, -1]; // Reset the board cell
        gameState.cards[suiteId][cardNumber] = true; // Mark the card as available
    
        // Update the cell UI
        cell.innerHTML = ''; // Clear the cell content
        cell.classList.remove('occupied'); // Remove 'occupied' class
    
        // Notify game state listeners
        gameState.notify();
    }
    
    onClick(e) {
        if (!e.target.getAttribute('id').includes('cell')
            || e.target.childElementCount != 0)
            return;
        if (!this.gameView.selectedCard) return;
        const selectedCard = this.gameView.selectedCard;
        const cell = e.target;
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        this.placeCard(parseInt(row), parseInt(col),
            parseInt(selectedCard.dataset.suiteId),
            parseInt(selectedCard.dataset.cardNumber));
    }

    onDoubleClick(e) {
        if (!e.target.getAttribute('id').includes('card')) return;

        const cell = e.target.parentElement; // The parent cell of the card
        const row = cell.dataset.row;
        const col = cell.dataset.col;

        if (row !== undefined && col !== undefined) {
            this.removeCard(parseInt(row), parseInt(col));
        }
    }
}


class ScoreView {
    constructor(playerId, playerName) {
        this.playerName = playerName;
        this.playerId = playerId;

        // Create container for the score view
        const container = document.createElement('div');
        container.classList.add('score-view');

        // Create element for player name
        const nameElem = document.createElement('div');
        nameElem.classList.add('score-view-player');
        nameElem.textContent = `Player ${playerId + 1}: ${playerName}`;
        container.appendChild(nameElem);

        // Create element for displaying player score
        const scoreElem = document.createElement('div');
        scoreElem.classList.add('score-view-score');
        scoreElem.textContent = `Score: ${gameState.getScore(playerId)}`; // Set initial score
        container.appendChild(scoreElem);

        // Register a callback to update the score when the game state changes
        gameState.addNotifyCallback(`score-update-${playerId}`, _ => {
            scoreElem.textContent = `Score: ${gameState.getScore(this.playerId)}`;
        });

        this.container = container;
    }

    // Method to get the DOM element representing the score view
    getElement() { 
        return this.container; 
    }
}


class SettingsPage {
    constructor(onNext) {
        this.onNext = onNext;
        this.configuration = {};
        this.container = this.createView();
    }

    createView() {
        const container = document.getElementById('settings-page');
        const innerContainer = container.querySelector('#settings-picker');
        const playMode = new ConfigSelectionBox({
            options: ["Human vs Human", "Me vs Computer", "Computer vs Me"],
            defaultOption: -1,
            labelText: "Play Mode"
        });
        innerContainer.appendChild(playMode.getElement());
        const boardSliderConfig = { min: 5, max: 20, defaultValue: 10, label: 'board size', step: 1 };
        const boardSizeSlider = new ConfigSlider(boardSliderConfig);
        innerContainer.appendChild(boardSizeSlider.getElement());
        const deckSliderConfig = { min: 1, max: suiteColors.length, defaultValue: 2, label: 'number of decks', step: 1 };
        const deckSizeSlider = new ConfigSlider(deckSliderConfig);
        innerContainer.appendChild(deckSizeSlider.getElement());
        const cardSliderConfig = { min: 5, max: 15, defaultValue: 8, label: 'number of cards', step: 1 };
        const cardSizeSlider = new ConfigSlider(cardSliderConfig);
        innerContainer.appendChild(cardSizeSlider.getElement());
        const player1Name = new TextBox({
            defaultText: "Alice",
            labelText: "Player 1 Name"
        });
        innerContainer.appendChild(player1Name.getElement());
        const player2Name = new TextBox({
            defaultText: "Bob",
            labelText: "Player 2 Name"
        });
        innerContainer.appendChild(player2Name.getElement());
        container.querySelector('#start-game-button').addEventListener('click', () => {
            this.configuration.playMode = playMode.getValue();
            this.configuration.boardSize = boardSizeSlider.getValue();
            this.configuration.numCards = cardSizeSlider.getValue();
            this.configuration.numDecks = deckSizeSlider.getValue();
            this.configuration.player1Name = !player1Name.getValue()
                ? player1Name.defaultText
                : player1Name.getValue();
            this.configuration.player2Name = !player2Name.getValue()
                ? player2Name.defaultText
                : player2Name.getValue();
            this.onNext(this.configuration);
        });
        return container;
    }

    getView() {
        return this.container;
    }
}

function argMax(arr) {
    if (arr.length == 0) return -1;
    let idx = 0;
    let maxVal = arr[0];
    for (let i = 0; i < arr.length; i++) {
        if (maxVal < arr[i]) {
            maxVal = arr[i];
            idx = i;
        }
    }
    return idx;
}

class GamePage {
    constructor(configuration, onNext) {
        this.onNext = onNext;
        this.configuration = configuration;
        this.container = this.createView();
        this.gameView = new GameView(
            configuration.boardSize,
            configuration.numDecks,
            configuration.numCards,
            initialBoardConfig);
        const gameHeader = document.getElementById('game-header');
        gameState.addNotifyCallback('game-header', _ => {
            const getPlayerName = p => p == 0
                ? this.configuration.player1Name
                : this.configuration.player2Name;
            if (gameState.gameOver) {
                const winner = argMax(gameState.getScores());
                gameHeader.textContent = `${getPlayerName(winner)} Wins!`;
            } else {
                gameHeader.textContent = `Turn: ${getPlayerName(gameState.currentPlayer)}`;
            }
        });
        const scoreContainer = document.getElementById('score-container');
        const player1Score = new ScoreView(0, this.configuration.player1Name);
        const player2Score = new ScoreView(1, this.configuration.player2Name);
        scoreContainer.appendChild(player1Score.getElement());
        scoreContainer.appendChild(player2Score.getElement());
        gameState.notify();

        const endTurnButton = document.createElement('button');
        endTurnButton.id = 'end-turn-button';
        endTurnButton.textContent = 'End Turn';
        endTurnButton.addEventListener('click', () => {
            if (gameState.isBoardValid()) {
                console.log("Turn ended successfully.");
                
                // Update the score of the current player
                gameState.calculateScore(gameState.currentPlayer);
        
                // Notify all views to update (including score views)
                gameState.notify();
        
                // Update the current player
                gameState.currentPlayer = (gameState.currentPlayer + 1) % numPlayers;
            } else {
                alert('Invalid board configuration. Please fix it before ending your turn.');
            }
        });
        scoreContainer.appendChild(endTurnButton);
    }

    createView() {
        const container = document.getElementById('game-page');
        return container;
    }

    getView() {
        return this.container;
    }
}

class ResultsPage {
    constructor(data) {
        this.data = data;
        this.container = this.createView();
    }

    createView() {
        const container = document.createElement('div');
        container.classList.add('page');
        container.innerHTML = `
            <h1>Results Page</h1>
            <p><strong>Name:</strong> ${this.data.name}</p>
            <p><strong>Age:</strong> ${this.data.age}</p>
            <p><strong>Email:</strong> ${this.data.email}</p>
            <p><strong>Phone:</strong> ${this.data.phone}</p>
        `;
        return container;
    }

    getView() {
        return this.container;
    }
}

class App {
    constructor(rootElementId) {
        this.appElement = document.getElementById(rootElementId);
        this.currentPage = null;
        this.data = {};
        this.init();
    }

    init() {
        this.startPage = new SettingsPage((data) => this.goToSecondPage(data));
        // this.startPage = new GamePage((data) => this.goToSecondPage(data));
        this.secondPage = null;
        this.resultsPage = null;

        this.showPage(this.startPage.getView());
    }

    showPage(page) {
        if (this.currentPage) {
            this.currentPage.classList.remove('active');
            this.appElement.removeChild(this.currentPage);
        }
        this.currentPage = page;
        this.currentPage.classList.add('active');
        this.appElement.appendChild(this.currentPage);
    }

    goToSecondPage(data) {
        Object.assign(this.data, data);
        this.secondPage = new GamePage(data, (data) => this.goToResultsPage(data));
        this.showPage(this.secondPage.getView());
    }

    goToResultsPage(data) {
        Object.assign(this.data, data);
        this.resultsPage = new ResultsPage(this.data);
        this.showPage(this.resultsPage.getView());
    }
}
