const playerColors = ['#ff9999', '#99ff99', '#9999ff', '#ffcc99']; // Colors for players
let peer;
let connections = [];
let isHost = false;
let conn;

const jobMetadata = {
   "Magician": {
      initMarkers: 5,
   },
   "Fortune teller": {
      initMarkers: 9,
   },
   "Soldier": {
      initMarkers: 7,
   },
   "Hacker": {
      initMarkers: 7,
   },
}

const initPlayer = {
    peerId: null,
    connected: false,
    cards: 0,
    lp: 40,
    name: '-',
    job: '-',
    jobLevel: 1,
    color: null,
    decks: {
      skill: [],
    }
}

const state = {
    shared: {
        isGameStarted: false,
        board: new Array(36).fill({ type: null, playerColor: null }),
        players: [], // Initialize as an empty array
        decks: {
            spell: [],
            equipment: []
        },
        playArea: { cardId: null, playerColor: null },
        rollHistory: []
    },
    player: {
        ...initPlayer
    }
};

// Initialize the players array after defining the state
state.shared.players = [
    { ...initPlayer, id: 'player1', color: playerColors[0], markers: 0 },
    { ...initPlayer, id: 'player2', color: playerColors[1], markers: 0 },
    { ...initPlayer, id: 'player3', color: playerColors[2], markers: 0 },
    { ...initPlayer, id: 'player4', color: playerColors[3], markers: 0 }
];

function initSlotsBoard() {
    // Create the 6x6 board
    const board = document.getElementById('board');
    for (let i = 0; i < 36; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.index = i;
        slot.addEventListener('click', (e) => {
            e.preventDefault();

            const slotIndex = slot.dataset.index;
            const player = state.shared.players.find(p => p.peerId === peer.id)

            placeMarkerOnBoard(slotIndex, player);
        });
        board.appendChild(slot);
    }
}

function broadcastState() {
    if (isHost) {
       broadcast({ type: 'broadcastState', sharedState: state.shared });
    } else {
       throw new Error('Only host can broadcast')
    }
}

function updateSharedState(newSharedState) {
    console.log('updateSharedState', newSharedState);

    state.shared = newSharedState ?? state.shared;
    if (isHost) {
        updateUIFromState();
        broadcastState();
    } else if (conn) {
        conn.send({ type: 'updateState', sharedState: state.shared });
    }
}

function updatePlayerState(newPlayerState) {
    state.player = newPlayerState;
    updateUIFromState();
}

function replaceSharedState(newSharedState) {
    state.shared = newSharedState;
    updateUIFromState();
}

function updatePlayerUI(player, index) {
    const playerSlot = document.getElementById(`player${index}`);
    const icon = playerSlot.querySelector('.player-icon');
    const status = playerSlot.querySelector('.player-status');
    const cards = playerSlot.querySelector('.player-cards');
    const lp = playerSlot.querySelector('.player-lp');
    const name = playerSlot.querySelector('.player-name');
    const job = playerSlot.querySelector('.player-job');
    const markers = playerSlot.querySelector('.player-markers');

    name.textContent = `Name: ${player.name}`;
    job.textContent = `Job: ${player.job} (Level ${player.jobLevel})`;
    markers.textContent = `Markers: ${player.markers}`;

    if (player.connected) {
        playerSlot.style.backgroundColor = player.color;
        icon.src = "images/player-icon.png";
        status.textContent = 'Connected';
        cards.textContent = `Cards: ${player.cards}`;
        lp.textContent = `LP: ${player.lp}`;
        if (peer.id === player.peerId) {
            playerSlot.querySelectorAll('.compact-button').forEach(button => button.style.display = 'block');
        } else {
            playerSlot.querySelectorAll('.compact-button').forEach(button => button.style.display = 'none');
        }
    } else {
        playerSlot.style.backgroundColor = '#f0f0f0';
        icon.src = "images/no-player.png";
        status.textContent = 'Disconnected';
        cards.textContent = 'Cards: 0';
        lp.textContent = 'LP: 0';
        playerSlot.querySelectorAll('.compact-button').forEach(button => button.style.display = 'none');
    }
}

function updateUIFromState() {
    console.log('Updating UI from state:', state.shared);

    if (isHost) {
      document.getElementById('startGame').style.display = state.shared.isGameStarted ? 'none' : 'block';
      document.getElementById('stopGame').style.display = state.shared.isGameStarted ? 'block' : 'none';
    }

    document.getElementById('dice-type').disabled = !state.shared.isGameStarted;
    document.getElementById('rollDice').disabled = !state.shared.isGameStarted;

    setBoardState(state.shared.board);

    if (peer) {
      const currPlayer = state.shared.players.find(p => p.peerId === peer.id)

      let playerIndex = 1
      updatePlayerUI(currPlayer, playerIndex);

      state.shared.players.forEach((player) => {
          if (player.peerId !== peer.id) {
            playerIndex++;
            updatePlayerUI(player, playerIndex);
          }
      });
    }

    // Update play area
    if (state.shared.playArea) {
        const { cardId, playerColor } = state.shared.playArea;
        if (cardId) {
            playCard(cardId, playerColor);
        }
    }

    // Update roll history
    const rollHistoryDiv = document.getElementById('roll-history');
    rollHistoryDiv.innerHTML = 'Roll History:<br>' + state.shared.rollHistory.map(r => Array.isArray(r) ? `(${r[0]}, ${r[1]})` : `(${r})`).join('<br>');

    const lastRoll = state.shared.rollHistory[0];
    if (Array.isArray(lastRoll)) {
      highlightSlot(lastRoll[0], lastRoll[1]);
    }

    updateDecks();
}

function handleData(data) {
    console.log('Received data:', data);

    if (data.type === 'updateState') {
        updateSharedState(data.sharedState);
    }

    if (data.type === 'broadcastState') {
        replaceSharedState(data.sharedState);
    }

    if (data.type === 'gameStarted') {
        showSnackbar('Game Started');
    }
}

function broadcast(data) {
    console.log('Broadcasting data:', data);
    connections.forEach(connection => connection.send(data));
}

document.getElementById('startHost').addEventListener('click', () => {
    document.getElementById('startHost').style.display = 'none';
    document.getElementById('join-controls').style.display = 'none';

    peer = new Peer();

    peer.on('open', id => {
        console.log('Host ID: ' + id);
        const hostIdDisplay = document.getElementById('hostIdDisplay');
        hostIdDisplay.textContent = 'Game ID: ' + id;
        hostIdDisplay.style.display = 'block';
        isHost = true;
        showModal('host', id);
        // Enable copy game ID
        hostIdDisplay.classList.add('copy-btn');
        hostIdDisplay.addEventListener('click', () => {
            navigator.clipboard.writeText(id).then(() => {
                showSnackbar('Game ID copied to clipboard');
            });
        });
    });

    peer.on('connection', connection => {
        if (!state.shared.isGameStarted && connections.length < 3) {
            console.log('Client connected');
            connections.push(connection);

            connection.on('data', data => {
                handleData(data);
            });

            newPlayer(connection.peer, connection.metadata.name, connection.metadata.job)

            connection.on('open', () => {
                console.log('Connection opened with client');

                if (connections.length > 0) {
                    document.getElementById('startGame').disabled = false;
                    document.getElementById('startGame').style.display = 'block';
                }

                updateSharedState(state.shared);
            });
            connection.on('close', () => {
                console.log('Client disconnected');
                const player = state.shared.players.find(p => p.peerId === connection.peer);
                if (player) {
                    player.connected = false;
                    player.peerId = null;

                    updateSharedState(state.shared);
                    showSnackbar(`Player ${state.shared.players.indexOf(player) + 1} disconnected`);
                }
                connections = connections.filter(conn => conn !== connection);
                if (connections.length < 1) {
                    document.getElementById('startGame').disabled = true;
                }
            });

            updateUIFromState()
        }
    });

    peer.on('error', (err) => {
        console.error('PeerJS error: ', err);
        showSnackbar(`Error: ${err}`);
    });
});

document.getElementById('joinGame').addEventListener('click', () => {
    showModal('client');
});

document.getElementById('leaveGame').addEventListener('click', () => {
    location.reload(); // Simple way to leave the game
});

document.getElementById('startGame').addEventListener('click', () => {
    initializeBoard();

    updateSharedState({
        ...state.shared,
        isGameStarted: true
    });

    showSnackbar('Game Started');
    broadcast({ type: 'gameStarted' });
});

document.getElementById('stopGame').addEventListener('click', () => {
    if (isHost) {
        location.reload(); // Simple way to reset the game for the host
    }
});

function rollDice(diceType) {
    console.log('Rolling dice:', diceType)

    const diceResult = document.getElementById('dice-result');
    diceResult.textContent = 'Rolling...';
    let rolls = 0;
    const maxRolls = 20;
    const interval = setInterval(() => {
        if (rolls >= maxRolls) {
            console.log('Rolling done');

            clearInterval(interval);
            let result;
            if (diceType === '2d6') {
                const die1 = Math.floor(Math.random() * 6) + 1;
                const die2 = Math.floor(Math.random() * 6) + 1;
                result = [die1, die2];
                diceResult.textContent = `Result: (${die1}, ${die2})`;
            } else {
                result = Math.floor(Math.random() * diceType) + 1;
                diceResult.textContent = `Result: (${result})`;
            }
            const newRollHistory = [result, ...state.shared.rollHistory];

            console.log('New roll history:', newRollHistory)

            updateSharedState({
                ...state.shared,
                rollHistory: newRollHistory
            });
        } else {
            if (diceType === '2d6') {
                diceResult.textContent = `Rolling... (${Math.floor(Math.random() * 6) + 1}, ${Math.floor(Math.random() * 6) + 1})`;
            } else {
                diceResult.textContent = `Rolling... (${Math.floor(Math.random() * diceType) + 1})`;
            }
            rolls++;
        }
    }, 50);
}

function setBoardState(boardState) {
    const slots = document.querySelectorAll('.slot');
    slots.forEach((slot, index) => {
        slot.innerHTML = '';
        const state = boardState[index];
        if (state) {
            const indicator = document.createElement('div');
            indicator.className = 'slot-indicator';
            indicator.textContent = state.type || '';
            slot.appendChild(indicator);
            if (state.playerColor) {
                slot.style.backgroundColor = state.playerColor;
            }
        }
    });
}

function highlightSlot(row, col) {
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => slot.classList.remove('highlight'));
    const targetIndex = (row - 1) * 6 + (col - 1);
    const targetSlot = slots[targetIndex];
    if (targetSlot) {
        targetSlot.classList.add('highlight');
    }
}

function updateDecks() {
    const sharedDeckIds = Object.keys(state.shared.decks);
    const playerDeckIds = Object.keys(state.player.decks);

    sharedDeckIds.forEach(deckId => updateDeck(deckId, 'shared'));
    playerDeckIds.forEach(deckId => updateDeck(deckId, 'player'));
}

function updateDeck(deckId, type) {
    const deck = document.querySelector(`.deck-card[data-deck-id='${deckId}']`);

    const count = state[type].decks[deckId].length;
    deck.textContent = count;

    if (count === 0) {
        deck.setAttribute('draggable', 'false');
        deck.style.cursor = 'not-allowed';
    } else {
        deck.setAttribute('draggable', 'true');
        deck.style.cursor = 'grab';
    }
}

// Load deck images
function loadDeckImages(deckId) {
    const images = deckImages[deckId];
    shuffle(images); // Shuffle the images to randomize the deck

    if (deckId === 'skill') {
        state.player.decks[deckId] = images;
    } else {
        state.shared.decks[deckId] = images;
    }
}

function loadAllDeckImages() {
    const deckTypes = ['spell', 'equipment', 'skill'];
    deckTypes.forEach(type => loadDeckImages(type));
}

// Roll dice functionality
document.getElementById('rollDice').addEventListener('click', function() {
    if (state.shared.isGameStarted) {
        const diceType = document.getElementById('dice-type').value;
        rollDice(diceType);
    }
});

// Initialize the decks
const decks = document.querySelectorAll('.deck-card');
decks.forEach(deck => {
    deck.addEventListener('dragstart', (e) => {
        if (state.shared.isGameStarted) {
            e.dataTransfer.setData('text/plain', deck.dataset.deckId);
        }
    });
});

// Handle dropping cards into the hand
const hand = document.getElementById('hand');
hand.addEventListener('dragover', (e) => {
    if (state.shared.isGameStarted) {
        e.preventDefault();
    }
});

hand.addEventListener('drop', (e) => {
    if (state.shared.isGameStarted) {
        e.preventDefault();
        const deckId = e.dataTransfer.getData('text/plain');
        console.log('Dropping card from deck:', deckId);
        const deck = document.querySelector(`.deck-card[data-deck-id='${deckId}']`);
        const count = parseInt(deck.textContent);
        if (count > 0) {
            const cardIndex = deckImages[deckId].length - count; // Get the next card image index
            if (deckId === 'skill') {
                updatePlayerState({
                    ...state.player,
                    decks: {
                        ...state.player.decks,
                        [deckId]: state.player.decks[deckId].slice(0, count - 1)
                    }
                });
            } else {
                updateSharedState({
                    ...state.shared,
                    decks: {
                        ...state.shared.decks,
                        [deckId]: state.shared.decks[deckId].slice(0, count - 1)
                    }
                });
            }

            addCardToHand(deckId, cardIndex);
        }
    }
});

// Create the card element with click event to show details
function createCardElement(deckId, cardIndex) {
    const cardInfo = deckImages[deckId][cardIndex];
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.cardId = `deck${deckId}-${Math.random().toString(36).substr(2, 9)}`;
    const img = document.createElement('img');
    img.src = `./images/${deckId}/${cardInfo.name}`;
    card.appendChild(img);
    card.draggable = true;
    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.dataset.cardId);
    });
    card.addEventListener('click', () => {
        showCardDetails(cardInfo);
    });
    return card;
}

// Add a card to the hand with image
function addCardToHand(deckId, cardIndex) {
    console.log(`Adding card to hand from ${deckId}, card index: ${cardIndex}`);
    const card = createCardElement(deckId, cardIndex);
    hand.appendChild(card);
}

// Place a card on the board
function placeMarkerOnBoard(slotIndex, player) {
    if (player.markers <= 0) {
      return
    }

    console.log(`Placing a marker on board at slot ${slotIndex}, with color ${player.color}`);

    const newBoard = state.shared.board.map((s, i) => i.toString() === slotIndex.toString() ? ({ ...s, playerColor: player.color }) : s)

    player.markers--;

    updateSharedState({
        ...state.shared,
        board: newBoard,
    });
}

// Play a card in the play area
function playCard(cardId, playerColor) {
    console.log(`Playing card ${cardId} in the play area`);
    const card = document.querySelector(`.card[data-card-id='${cardId}']`);
    const playArea = document.getElementById('play-area');
    if (card && playArea) {
        playArea.innerHTML = '';
        card.style.width = '60px';
        card.style.height = '90px';
        playArea.appendChild(card);
        playArea.style.backgroundColor = playerColor;
        card.addEventListener('click', () => {
            const deckId = cardId.split('-')[0].replace('deck', '');
            const cardIndex = deckImages[deckId].findIndex(c => c.name === card.querySelector('img').src.split('/').pop());
            showCardDetails(deckImages[deckId][cardIndex]);
        });
    }
}

// Show card details in a modal
function showCardDetails(cardInfo) {
    const modal = document.getElementById('cardDetailsModal');
    const cardName = document.getElementById('card-name');
    const cardDetailsTable = document.getElementById('card-details-table');

    cardName.textContent = cardInfo.name;
    cardDetailsTable.innerHTML = '';

    for (const key in cardInfo.details) {
        const row = document.createElement('tr');
        const keyCell = document.createElement('td');
        keyCell.textContent = key;
        const valueCell = document.createElement('td');
        valueCell.textContent = cardInfo.details[key];
        row.appendChild(keyCell);
        row.appendChild(valueCell);
        cardDetailsTable.appendChild(row);
    }

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('cardDetailsModal');
    modal.style.display = 'none';
}

document.querySelector('.close-card-details').addEventListener('click', closeModal);

window.onclick = function(event) {
    const modal = document.getElementById('cardDetailsModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Load decks images after page load
document.addEventListener('DOMContentLoaded', () => {
    initSlotsBoard();
    loadAllDeckImages();
    updateUIFromState();
});

function initializeBoard() {
    const slots = document.querySelectorAll('.slot');
    const types = ['S', 'J', 'E'];
    const slotTypes = Array(12).fill('S').concat(Array(12).fill('J')).concat(Array(12).fill('E'));
    shuffle(slotTypes);

    slots.forEach((slot, index) => {
        slot.innerHTML = '';
        const type = slotTypes[index];
        const indicator = document.createElement('div');
        indicator.className = 'slot-indicator';
        indicator.textContent = type;
        slot.appendChild(indicator);
        state.shared.board[index] = { type, playerColor: null };
    });
}

function getBoardState() {
    return state.shared.board;
}

const modal = document.getElementById('myModal');
const span = document.getElementsByClassName('close')[0];
const joinButton = document.getElementById('joinGameFromModal');

function showModal(role, id) {
    if (role === 'host') {
        document.getElementById('startGame').style.display = 'block';
    }
    modal.style.display = 'block';
}

span.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

function newPlayer(peerId, name, job) {
    const player = state.shared.players.find(p => p.peerId === null);
    if (player) {
        player.name = name;
        player.job = job;
        player.markers = jobMetadata[job].initMarkers;
        player.peerId = peerId
        player.connected = true;
    }
}

joinButton.addEventListener('click', () => {
    const hostId = document.getElementById('peerId').value;
    const playerName = document.getElementById('playerName').value;
    const playerJob = document.getElementById('playerJob').value;

    if (playerName && playerJob) {
        if (isHost) {
            newPlayer(peer.id, playerName, playerJob)

            modal.style.display = 'none';

            updateUIFromState();
        } else {
            if (hostId) {
                peer = new Peer();
                peer.on('open', () => {
                    console.log('Client peer opened');
                    conn = peer.connect(hostId, {
                        metadata: { name: playerName, job: playerJob }
                    });

                    conn.on('open', () => {
                        console.log('Connected to host');
                        showSnackbar('Connected to host');

                        document.getElementById('startHost').style.display = 'none';
                        document.getElementById('join-controls').style.display = 'none';
                        document.getElementById('leaveGame').style.display = 'block';

                        modal.style.display = 'none';
                    });

                    conn.on('data', handleData);

                    conn.on('error', (err) => {
                        console.error('Connection error: ', err);
                        showSnackbar(`Error: ${err}`);
                    });

                    peer.on('error', (err) => {
                        console.error('PeerJS error: ', err);
                        showSnackbar(`Error: ${err}`);
                    });
                });
            } else {
                alert('Please fill in the Game ID.');
            }
        }
    } else {
        alert('Please fill in all details.');
    }
});

// Snackbar for notifications
function showSnackbar(message) {
    const snackbar = document.getElementById('snackbar');
    snackbar.textContent = message;
    snackbar.className = 'show';
    setTimeout(() => {
        snackbar.className = snackbar.className.replace('show', '');
    }, 3000);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function increaseJobLevel() {
    const player = state.shared.players.find(p => p.peerId === peer.id);
    if (player && player.jobLevel < 3) {
        player.jobLevel += 1;
        updateSharedState();
    }
}

function increaseLP() {
    const player = state.shared.players.find(p => p.peerId === peer.id);
    if (player) {
        player.lp += 1;
        updateSharedState();
    }
}

function decreaseLP() {
    const player = state.shared.players.find(p => p.peerId === peer.id);
    if (player) {
        player.lp -= 1;
        updateSharedState();
    }
}

