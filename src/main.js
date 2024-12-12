
const boardSize = 5; // Adjust size of the board
const numCards = 5; // Number of unique cards
const numDecks = 3;   // How many times each card repeats

let cellSize = 42;
const cellMargin = 2;
const cellBorder = 1;
const suiteColors = ['#FF63474D', '#3CB3714D', '#FFD7004D', '#4682B44D', '#8A2BE24D', '#FF45004D', '#32CD324D', '#6A5A3D4D']
let cardSize = 40;
let borderRadius = 8;
const borderRadiusScale = 8 / 40;
const numPlayers = 2;
const cardCellSizeDif = 2;
let cardMargin = 10;
const cardMarginScale = 8 / 40;

function adjustScalingFactor(boardSize, numDecks, numCards) {
    const targetHeight = window.innerHeight
        - boardSize * (cellMargin + cardCellSizeDif);
    const targetWidth = window.innerWidth;
    const cellSizeH = Math.floor(targetWidth / (numCards + (numCards + 3) * cardMarginScale));
    cellSize = Math.floor(targetHeight / (boardSize * (1 + cardMarginScale) + numDecks));
    cellSize = Math.min(cellSize, cellSizeH);
    cardSize = cellSize - cardCellSizeDif;
    borderRadius = Math.round(borderRadiusScale * cardSize);
    cardMargin = Math.floor(cardSize * cardMarginScale);
    console.log(cardMargin);
    console.log(borderRadius);
}

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

function randInt(a, b) {
    return Math.round(Math.random() * (b - a) + a)
}

// TODO: call initial board config
// const initialBoardConfig = [[2, 2, 1, 2], [4, 4, 0, 3]];
const initialBoardConfig = [[2, 2, 0, 2], [4, 4, 0, 3]];
// TODO: Replace this with actual game logic
class GameState {
    constructor(boardSize, numDecks, numCards, numReps) {
        this.boardSize = boardSize;
        this.numDecks = numDecks;
        this.numCards = numCards;
        this.uniqueCards = Math.floor(this.numCards / numReps);
        this.callbacks = {};
        this.currentPlayer = 0;
        this.cards = Array.from(
            { length: numDecks },
            _ => Array.from({ length: numCards }, _ => true));
        this.board = Array.from(
            { length: boardSize },
            _ => Array.from({ length: boardSize }, _ => [-1, -1]));
        this.gameOver_ = false;
        this.lastPlayedCard = { suiteId: -1, cardNumber: -1 };
        this.scores = [0, 0];
        this.setupRandomValidBoard(this.boardSize);
    }

    setupRandomValidBoard(numOnBoard) {
        for (let i = 0; i < numOnBoard; i++) {
            while (true) {
                const row = randInt(0, this.boardSize - 1);
                const col = randInt(0, this.boardSize - 1);
                const deck = randInt(0, this.numDecks - 1);
                const card = randInt(0, this.numCards - 1);
                if (this.canPlaceCard(row, col, deck, card)) {
                    this.board[row][col] = [deck, card];
                    this.cards[deck][card] = false;
                    break;
                }
            }
        }
    }

    notify() {
        for (const [_, callback] of Object.entries(this.callbacks))
            callback(this);
    }

    addNotifyCallback(name, callback) {
        if (this.callbacks[name] != undefined) {
            throw new Error(`Callback '${name} already exists`);
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

    get currentPlayer() { return this.currentPlayer_; }

    getVerticalConnected(row, col, suiteId, cardNumber) {
        let down = [[suiteId, cardNumber]], up = [];
        let i = row + 1;
        while (i < this.boardSize && this.cellHasCard(i, col)) {
            down.push(this.board[i][col]);
            i++;
        }
        i = row - 1;
        while (i >= 0 && this.cellHasCard(i, col)) {
            up.push(this.board[i][col]);
            i--;
        }
        up.reverse();
        return up.concat(down);
    }

    getHorizontalConnected(row, col, suiteId, cardNumber) {
        let right = [[suiteId, cardNumber]], left = [];
        let j = col + 1;
        while (j < this.boardSize && this.cellHasCard(row, j)) {
            right.push(this.board[row][j]);
            j++;
        }
        j = col - 1;
        while (j >= 0 && this.cellHasCard(row, j)) {
            left.push(this.board[row][j]);
            j--;
        }
        left.reverse();
        return left.concat(right);
    }

    getNumConnected(row, col, vis) {
        let count = 1;
        if (row + 1 < this.boardSize && this.cellHasCard(row + 1, col)
            && !vis[row + 1][col]) {
            vis[row + 1][col] = true;
            count += this.getNumConnected(row + 1, col, vis);
        }
        if (row - 1 >= 0 && this.cellHasCard(row - 1, col)
            && !vis[row - 1][col]) {
            vis[row - 1][col] = true;
            count += this.getNumConnected(row - 1, col, vis);
        }
        if (col + 1 < this.boardSize && this.cellHasCard(row, col + 1)
            && !vis[row][col + 1]) {
            vis[row][col + 1] = true;
            count += this.getNumConnected(row, col + 1, vis);
        }
        if (col - 1 >= 0 && this.cellHasCard(row, col - 1)
            && !vis[row][col - 1]) {
            vis[row][col - 1] = true;
            count += this.getNumConnected(row, col - 1, vis);
        }
        return count;
    }

    isArrayAsc(arr) {
        console.log(arr);
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i + 1][1] % this.uniqueCards - arr[i][1] % this.uniqueCards != 1
                || arr[i + 1][0] != arr[i][0])
                return false;
        }
        return true;
    }

    isArrayDsc(arr) {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i][1] % this.uniqueCards - arr[i + 1][1] % this.uniqueCards != 1
                || arr[i + 1][0] != arr[i][0])
                return false;
        }
        return true;
    }

    isArrayRep(arr) {
        let suitesUsed = Array.from({ length: this.numDecks }, _ => false);
        suitesUsed[arr[0][0]] = true;
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i][1] % this.uniqueCards != arr[i + 1][1] % this.uniqueCards
                || suitesUsed[arr[i + 1][0]])
                return false;
            suitesUsed[arr[i + 1][0]] = true;
        }
        return true;
    }

    isArrayConsistent(arr) {
        if (arr.length < 2) return true;
        console.log(this.isArrayAsc(arr));
        console.log(this.isArrayDsc(arr));
        console.log(this.isArrayRep(arr));
        return this.isArrayAsc(arr)
            || this.isArrayDsc(arr)
            || this.isArrayRep(arr);
    }

    isConsistent(row, col, suiteId, cardNumber) {
        const horizontal = this.getHorizontalConnected(row, col, suiteId, cardNumber);
        const vertical = this.getVerticalConnected(row, col, suiteId, cardNumber);
        console.log('isConsistent:');
        console.log(horizontal);
        console.log(vertical);
        return this.isArrayConsistent(horizontal)
            && this.isArrayConsistent(vertical);
    }

    cellHasCard(row, col) {
        return this.board[row][col][0] != -1
            && this.board[row][col][1] != -1;
    }

    canPlaceCard(row, col, suiteId, cardNumber) {
        // console.log(`blocked ${this.isCardBlocked(suiteId, cardNumber)}`);
        // console.log(`in deck ${this.isCardInDeck(suiteId, cardNumber)}`);
        // console.log(`is cons ${this.isConsistent(row, col, suiteId, cardNumber)}`);
        if (this.board[row][col][0] != -1
            || this.board[row][col][1] != -1
            || !this.isCardInDeck(suiteId, cardNumber)
            || this.isCardBlocked(suiteId, cardNumber)) {
            return false;
        }
        return this.isConsistent(row, col, suiteId, cardNumber);
    }

    placeCard(row, col, suiteId, cardNumber) {
        if (!this.canPlaceCard(row, col, suiteId, cardNumber))
            throw new Error("Invalid call, need to check before calling this");
        this.board[row][col] = [suiteId, cardNumber];
        this.cards[suiteId][cardNumber] = false;
        this.scores[this.currentPlayer] += this.getScoreForTurn(row, col, suiteId, cardNumber);
        this.currentPlayer = (this.currentPlayer + 1) % numPlayers;
        this.lastPlayedCard.suiteId = suiteId;
        this.lastPlayedCard.cardNumber = cardNumber;
        this.notify();
    }

    getScoreForTurn(row, col, suiteId, cardNumber) {
        // Works only if the new cards is consistent with the board.
        const hArray = this.getHorizontalConnected(row, col, suiteId, cardNumber);
        const vArray = this.getVerticalConnected(row, col, suiteId, cardNumber);
        if (Math.min(hArray.length, vArray.length) == 1
            && ((hArray[0][0] == suiteId && hArray[0][1] == cardNumber)
                || (hArray[hArray.length - 1][0] == suiteId
                    && hArray[hArray.length - 1][1] == cardNumber)
                || (vArray[0][0] == suiteId && vArray[0][1] == cardNumber)
                || (vArray[vArray.length - 1][0] == suiteId
                    && vArray[vArray.length - 1][1] == cardNumber))) {
            // Does not connect two disjoint arrays
            return Math.max(hArray.length, vArray.length);
        }
        let vis = Array.from({ length: this.boardSize }, _ =>
            Array.from({ length: this.boardSize }, _ => false)
        );
        vis[row][col] = true;
        const score = this.getNumConnected(row, col, vis);
        console.log(vis);
        console.log(this.scores);
        return score;
    }

    isCardInDeck(suiteId, cardNumber) {
        return this.cards[suiteId][cardNumber];
    }

    isCardBlocked(suiteId, cardNumber) {
        return this.isCardInDeck(suiteId, cardNumber)
            && (suiteId == this.lastPlayedCard.suiteId
                || cardNumber % this.uniqueCards
                == this.lastPlayedCard.cardNumber % this.uniqueCards);
    }

    canSelectCard(suiteId, cardNumber) {
        return !this.isCardBlocked(suiteId, cardNumber)
            && this.isCardInDeck(suiteId, cardNumber);
    }

    getScore(playerId) { return this.scores[playerId]; }
    getScores() { return this.scores; }
    getBoardState() { return this.board; }
    getDeckState() { return this.cards; }

    canPlaceAny() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                for (let i = 0; i < this.numDecks; i++) {
                    for (let j = 0; j < this.numCards; j++) {
                        if (this.canPlaceCard(row, col, i, j)) return true;
                    }
                }
            }
        }
        return false;
    }

    isGameOver() {
        return !this.canPlaceAny();
    }

    get gameOver() { return this.gameOver_; }

}
let gameState = null;

class GameView {
    constructor(boardSize, numDecks, numCards) {
        this.selectedCard = null;
        this.numDecks = numDecks;
        this.boardSize = boardSize;
        this.deckViewsDiv = document.getElementById('card-block');
        const cardBlock = document.getElementById('card-block');
        this.deckViews = Array.from(
            { length: numDecks },
            (_, k) => new DeckView(this, k, numCards));
        this.deckViews.forEach(deckView =>
            cardBlock.appendChild(deckView.deckDiv));
        this.boardView = new BoardView(this, boardSize);
    }

    render() {
        this.deckViews.forEach(deck => deck.render());
        this.boardView.render();
    }
}

class DeckView {
    constructor(parentView, suiteId, numCards) {
        this.gameView = parentView;
        this.suiteId = suiteId;
        this.numCards = numCards;
        const deck = document.createElement('div');
        deck.addEventListener('click', e => this.onClick(e));
        this.deckDiv = deck;
        this.render();
        gameState.addNotifyCallback(`deck_${suiteId}`, _ => { this.render(); });
    }

    render() {
        const deck = this.deckDiv;
        deck.innerHTML = '';
        deck.classList.add('card-deck');
        // deck.style.gap = `${cardMargin}px`;
        deck.style.gap = `${cardMargin}px`;
        deck.style.margin = `${cardMargin}px`;
        this.cardViews = []
        for (let i = 0; i < this.numCards; i++) {
            const fixedPos = document.createElement('div');
            fixedPos.style.width = `${cellSize}px`;
            fixedPos.style.height = `${cellSize}px`;
            if (gameState.getDeckState()[this.suiteId][i]) {
                const cardView = new CardView(this, this.suiteId, i);
                this.cardViews.push(cardView);
                fixedPos.appendChild(cardView.cardDiv);
            }
            deck.appendChild(fixedPos);
        }
    }

    onClick(e) {
        const target = e.target;
        if (target.getAttribute('id')?.includes('card')
            && gameState.canSelectCard(target.dataset.suiteId,
                target.dataset.cardNumber)) {
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
        this.cardNumber = cardNumber;
        const card = document.createElement('div');
        card.setAttribute('id', `card_${suiteId}_${cardNumber}`)
        card.classList.add('card');
        if (gameState.canSelectCard(suiteId, cardNumber))
            card.classList.add('card-hover');
        card.style.height = `${cardSize}px`;
        card.style.width = `${cardSize}px`;
        card.style.borderRadius = `${borderRadius}px`;
        card.style.background = suiteColors[suiteId % suiteColors.length];
        card.textContent = parseInt(cardNumber % gameState.uniqueCards) + 1;
        card.dataset.cardNumber = cardNumber;
        card.dataset.suiteId = suiteId;


        if (gameState.isCardInDeck(this.suiteId, this.cardNumber)) {
            if (gameState.isCardBlocked(this.suiteId, this.cardNumber)) {
                card.style.background = 'gray';
                card.classList.remove('card-hover');
            }
        } else {
            card.classList.remove('card-hover');
        }

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

class BoardView {
    constructor(parentView, boardSize) {
        this.gameView = parentView;
        this.boardSize = boardSize;
        this.cellViews = [];
        const board = document.getElementById('board');
        board.addEventListener('mouseover', e => {
            const target = e.target;
            if (target.getAttribute('id')?.includes('cell')
                && target.childElementCount == 0) {
                if (this.gameView.selectedCard
                    && gameState.canPlaceCard(parseInt(target.dataset.row),
                        parseInt(target.dataset.col),
                        parseInt(this.gameView.selectedCard.dataset.suiteId),
                        parseInt(this.gameView.selectedCard.dataset.cardNumber)))
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
        this.boardDiv = board;
        this.render();
        gameState.addNotifyCallback('board', _ => { this.render(); });
    }

    render() {
        const board = this.boardDiv;
        board.innerHTML = "";
        board.style.gridTemplateColumns = `repeat(${this.boardSize}, ${cellSize}px)`;
        board.style.gridTemplateRows = `repeat(${this.boardSize}, ${cellSize}px)`;
        board.style.gap = `${cellMargin}px`
        addBoardPadding(board, 0, cellMargin);
        const boardState = gameState.getBoardState();
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cellView = new CellView(this, i, j);
                if (boardState[i][j][0] != -1 && boardState[i][j][1] != -1) {
                    const cardView = new CardView(null, boardState[i][j][0], boardState[i][j][1]);
                    cellView.cellDiv.appendChild(cardView.cardDiv);
                }
                board.appendChild(cellView.cellDiv);
                this.cellViews.push(cellView);
            }
        }
    }

    onClick(e) {
        if (!e.target.getAttribute('id').includes('cell')
            || e.target.childElementCount != 0)
            return;
        if (!this.gameView.selectedCard) return
        const selectedCard = this.gameView.selectedCard;
        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        if (!gameState.canPlaceCard(row, col,
            parseInt(selectedCard.dataset.suiteId),
            parseInt(selectedCard.dataset.cardNumber))) {
            return;
        }
        gameState.placeCard(row, col,
            parseInt(selectedCard.dataset.suiteId),
            parseInt(selectedCard.dataset.cardNumber));
        this.gameView.selectedCard = null;
    }
}

class ScoreView {
    constructor(playerId, playerName) {
        this.playerName = playerName;
        this.playerId = playerId;
        const container = document.createElement('div');
        container.classList.add('score-view');
        const nameElem = document.createElement('div');
        nameElem.classList.add('score-view-player');
        nameElem.textContent = `Player ${playerId + 1}: ${playerName}`;
        container.appendChild(nameElem);
        const scoreElem = document.createElement('div');
        gameState.addNotifyCallback(`score-update-${playerId}`, _ => {
            scoreElem.textContent = `Score: ${gameState.getScore(this.playerId)}`;
        })
        container.appendChild(scoreElem);
        this.container = container;
    }

    getElement() { return this.container; }
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
        // const playMode = new ConfigSelectionBox({
        //     options: ["Human vs Human", "Me vs Computer", "Computer vs Me"],
        //     defaultOption: -1,
        //     labelText: "Play Mode"
        // });
        // innerContainer.appendChild(playMode.getElement());
        const boardSliderConfig = { min: 5, max: 20, defaultValue: 10, labelText: 'board size', step: 1 };
        const boardSizeSlider = new ConfigSlider(boardSliderConfig);
        innerContainer.appendChild(boardSizeSlider.getElement());
        const deckSliderConfig = { min: 1, max: suiteColors.length, defaultValue: 4, labelText: 'number of colors', step: 1 };
        const deckSizeSlider = new ConfigSlider(deckSliderConfig);
        innerContainer.appendChild(deckSizeSlider.getElement());
        const cardSliderConfig = { min: 4, max: 12, defaultValue: 6, labelText: 'number of unique tiles', step: 1 };
        const cardSizeSlider = new ConfigSlider(cardSliderConfig);
        innerContainer.appendChild(cardSizeSlider.getElement());
        const repSliderConfig = { min: 1, max: 6, defaultValue: 2, labelText: 'number of tile repetitions', step: 1 };
        const repSizeSlider = new ConfigSlider(repSliderConfig);
        innerContainer.appendChild(repSizeSlider.getElement());
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
            // this.configuration.playMode = playMode.getValue();
            this.configuration.boardSize = parseInt(boardSizeSlider.getValue());
            this.configuration.numCards = parseInt(cardSizeSlider.getValue()) * parseInt(repSizeSlider.getValue());
            this.configuration.numReps = parseInt(repSizeSlider.getValue());
            this.configuration.numDecks = parseInt(deckSizeSlider.getValue());
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
        gameState = new GameState(
            this.configuration.boardSize,
            this.configuration.numDecks,
            this.configuration.numCards,
            this.configuration.numReps);
        window.addEventListener("resize", () => {
            adjustScalingFactor(this.configuration.boardSize,
                this.configuration.numDecks,
                this.configuration.numCards);
            gameState.notify();
        });
        adjustScalingFactor(this.configuration.boardSize,
            this.configuration.numDecks,
            this.configuration.numCards);
        this.container = this.createView();
        this.gameView = new GameView(
            configuration.boardSize,
            configuration.numDecks,
            configuration.numCards);
        const gameHeader = document.getElementById('game-header');
        gameState.addNotifyCallback('game-header', _ => {
            const getPlayerName = p => p == 0
                ? this.configuration.player1Name
                : this.configuration.player2Name;
            if (gameState.isGameOver()) {
                console.log("Game over");
                const scores = gameState.getScores();
                if (scores[0] == scores[1]) {
                    gameHeader.textContent = `${getPlayerName(0)} and ${getPlayerName(1)} Draw!`;
                } else {
                    const winner = argMax(gameState.getScores());
                    gameHeader.textContent = `${getPlayerName(winner)} Wins!`;
                }
                this.gameView.deckViewsDiv.style.display = 'none';
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
