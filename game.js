const playerColors = ['#ff9999', '#99ff99', '#9999ff', '#ffcc99']; // Colors for players
let peer;
let connections = [];
let isHost = false;
let conn;

const cardIdDelim = '/';

const jobMetadata = {
   "scientist": {
      initResources: 1,
      initTechCards: 2,
   },
   "spiritual-leader": {
      initResources: 1,
      initTechCards: 1,
   },
   "engineer": {
      initResources: 1,
      initTechCards: 2,
   },
   "hacker": {
      initResources: 2,
      initTechCards: 1,
   },
   "politician": {
      initResources: 1,
      initTechCards: 1,
   },
}

const STEP = {
  'roll': 0,
  'choose': 1,
  'build': 2,
  'play': 3,
}

const initPlayer = {
    peerId: null,
    connected: false,
    cards: 0,
    population: 20,
    name: '-',
    job: '-',
    jobLevel: 1,
    color: null,
    decks: {
      tech: [],
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
        rollHistory: [],
        cardInfos: {},
        currentStep: STEP['roll'],
        stationsToWin: 0,
    },
    player: {
        ...initPlayer
    }
};

// Initialize the players array after defining the state
state.shared.players = [
    { ...initPlayer, id: 'player1', color: playerColors[0], resources: 0, stations: 0 },
    { ...initPlayer, id: 'player2', color: playerColors[1], resources: 0, stations: 0 },
    { ...initPlayer, id: 'player3', color: playerColors[2], resources: 0, stations: 0 },
    { ...initPlayer, id: 'player4', color: playerColors[3], resources: 0, stations: 0 },
];

function findCurrentPlayer() {
    return state.shared.players.find(p => p?.peerId === peer?.id);
}

function initSlotsBoard() {
    // Create the 6x6 board
    const board = document.getElementById('board');
    for (let i = 0; i < 36; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.index = i;
        slot.addEventListener('click', (e) => {
            e.preventDefault();


            if (state.shared.isGameStarted && state.shared.currentStep === STEP.build) {
               state.shared.currentStep = STEP.play;
            }

            const slotIndex = slot.dataset.index;
            const player = findCurrentPlayer();

            const isSlotOccupied = state.shared.board[slotIndex].playerColor;

            isSlotOccupied ? recycleStationOnBoard(slotIndex, player) : placeStationOnBoard(slotIndex, player);
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

    updateUIFromState();

    if (isHost) {
        broadcastState();
    } else if (conn) {
        sendSharedStateToHost();
    }
}

function updatePlayerState(newPlayerState) {
    state.player = newPlayerState;
    updateUIFromState();
}

function replaceSharedState(newSharedState) {
    const currPlayer = findCurrentPlayer();

    state.shared = newSharedState;

    // only update the other players' state
    if (currPlayer) {
        const currPlayerIndex = state.shared.players.findIndex(p => p.peerId === peer.id);
        state.shared.players[currPlayerIndex] = currPlayer;
    }

    updateUIFromState();
}

function updatePlayerUI(player, index) {
    const playerSlot = document.getElementById(`player${index}`);
    const icon = playerSlot.querySelector('.player-icon');
    const status = playerSlot.querySelector('.player-status');
    const cards = playerSlot.querySelector('.player-cards');
    const population = playerSlot.querySelector('.player-population');
    const name = playerSlot.querySelector('.player-name');
    const job = playerSlot.querySelector('.player-job');
    const resources = playerSlot.querySelector('.player-resources');
    const skill = playerSlot.querySelector('.player-skill');
    const stations = playerSlot.querySelector('.player-stations');

    name.textContent = `Name: ${player.name}`;
    job.textContent = `Job: ${player.job} (Level ${player.jobLevel})`;
    resources.textContent = `Resources: ${player.resources}`;

    if (player.connected) {
        playerSlot.style.backgroundColor = player.color;
        icon.src = "images/player-icon.png";
        status.textContent = 'Connected';
        cards.textContent = `Cards: ${player.cards}`;
        population.textContent = `Population: ${player.population}`;
        skill.textContent = getSkillTextForJob(player.job, player.jobLevel);
        stations.textContent = `Stations: ${player.stations}`;
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
        population.textContent = `Population: ${initPlayer.population}`;
        skill.textContent = 'Skill: None';
        playerSlot.querySelectorAll('.compact-button').forEach(button => button.style.display = 'none');
    }
}

function getSkillTextForJob(job, level) {
   switch (job) {
     case 'scientist':
       return `Skill: threat ${level} free slot as your station`
     case 'spiritual-leader':
       return `Skill: gain ${level*5} population each turn`
     case 'engineer':
       return `Skill: can use ${level} adjacent station`
     case 'hacker':
       return `Skill: can reroll ${level} once per turn`
     case 'politician':
       return `Skill: choose upto 1 player, you can use ${level} station(s) of them to help playing for 1 Tech card, if you play it this way everyone draws a tech card`
   }
}

function updateUIFromState() {
    console.log('Updating UI from state:', state.shared);

    if (isHost) {
      document.getElementById('startGame').style.display = state.shared.isGameStarted ? 'none' : 'block';
      document.getElementById('stopGame').style.display = state.shared.isGameStarted ? 'block' : 'none';
    }

    setBoardState(state.shared.board);

    if (peer) {
      const currPlayer = findCurrentPlayer();

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
        const { deckId, cardId, playerColor, playerJob, playerPeerId } = state.shared.playArea;
        if (deckId && cardId && playerColor && playerJob && playerPeerId) {
            playCard(deckId, cardId, playerColor, playerJob, playerPeerId);
        } else {
            clearCardFromPlayArea();
        }
    }

    // Update roll history
    const rollHistoryDiv = document.getElementById('roll-history');
    rollHistoryDiv.innerHTML = 'Roll History:<br>' + state.shared.rollHistory.map(r => Array.isArray(r.values) ? `(${r.values[0]}, ${r.values[1]}) by [${r.playerName}]` : `(${r.values}) by [${r.playerName}]`).join('<br>');

    const lastRoll = state.shared.rollHistory[0]?.values;
    if (Array.isArray(lastRoll)) {
      highlightSlot(lastRoll[0], lastRoll[1]);
    }

    updateDecks();
    updateTotalPopulation();
    updateLargestPlayer();
    updateStepsUI();
    updateStationsToWin();
}

function updateStationsToWin() {
    document.getElementById('stations-to-win').textContent = `Stations to win: ${state.shared.stationsToWin}`;
}

function updateLargestPlayer() {
    const mostStationsPlayer = state.shared.players.reduce((acc, player) => {
        return player.stations > acc.stations ? player : acc;
    });

    document.getElementById('largest-player').textContent = `Largest player: ${mostStationsPlayer.stations} stations (${mostStationsPlayer.name})`;
}

function updateTotalPopulation() {
    const totalPopulation = state.shared.players.reduce((acc, player) => acc + player.population, 0);
    const halfPopulation = Math.ceil(totalPopulation / 2);

    document.getElementById('total-population').textContent = `Total Population: ${totalPopulation}`;
    document.getElementById('half-population').textContent = `Half Population: ${halfPopulation}`;
}

function handleData(data) {
    console.log('Received data:', data);

    if (data.type === 'updateState') {
        data.sharedState.players = fillOtherPlayers(data.sharedState.players)
        updateSharedState(data.sharedState);
    }

    if (data.type === 'broadcastState') {
        replaceSharedState(data.sharedState);
        const currPlayer = findCurrentPlayer();
        loadPlayerDeckImages(currPlayer.job);
    }

    if (data.type === 'gameStarted') {
        showSnackbar('Game Started');
        replaceSharedState(data.sharedState);
        putInitTechCardsToHand();
    }
}

function fillOtherPlayers(players) {
    const updatingPlayer = players[0];
    const otherPlayers = state.shared.players.filter(p => p.peerId !== updatingPlayer.peerId);
    return [...otherPlayers, updatingPlayer].sort((a, b) => a.id < b.id ? -1 : 1);
}


function putInitTechCardsToHand() {
    const currPlayer = findCurrentPlayer();
    const initTechCards = jobMetadata[currPlayer.job].initTechCards;
    putCardToHand('tech', initTechCards);
}

function putCardToHand(deckId, count) {
    for (let i = 0; i < count; i++) {
        const card = state.player.decks[deckId].pop();
        addCardToHand(deckId, card.id);
    }
}

const broadcastTimeouts = {};

function broadcast(data) {
    if (broadcastTimeouts[data.type]) {
        clearTimeout(broadcastTimeouts[data.type]);
    }

    // Boucing the broadcast if multiple broadcasts are happening for the same type
    broadcastTimeouts[data.type] = setTimeout(() => {
      console.log('Broadcasting data:', data);
      connections.forEach(connection => connection.send(data));
    }, 100);
}

function sendSharedStateToHost(data) {
    const sharedStateWithoutOtherPlayers = {
        ...state.shared,
        players: state.shared.players.filter(p => p.peerId === peer.id),
    };
    sendToHost({ type: 'updateState', sharedState: sharedStateWithoutOtherPlayers });
}
const sendToHostTimeouts = {};
function sendToHost(data) {
    if (sendToHostTimeouts[data.type]) {
        clearTimeout(sendToHostTimeouts[data.type]);
    }

    // Boucing the sending to host if multiple sendings are happening for the same type
    sendSharedStateToHost[data.type] = setTimeout(() => {
      console.log('Sending data to host', data);
      conn.send(data);
    }, 50);
}

document.getElementById('startHost').addEventListener('click', () => {
    document.getElementById('startHost').style.display = 'none';
    document.getElementById('join-controls').style.display = 'none';

    const kickPlayerButtons = document.querySelectorAll('.kick-player-button');
    kickPlayerButtons.forEach(button => button.style.display = 'flex');

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

    peer.on('disconnected', () => {
        console.log('PeerJS disconnected');
        showSnackbar('PeerJS disconnected, reconnecting...');

        peer.reconnect();
    });
});

document.getElementById('joinGame').addEventListener('click', () => {
    showModal('client');
});

document.getElementById('leaveGame').addEventListener('click', () => {
    location.reload(); // Simple way to leave the game
});

document.getElementById('startGame').addEventListener('click', () => {
    const stationsToWin = 17 - (state.shared.players.filter(p => !!p.peerId).length * 2);

    state.shared.stationsToWin = stationsToWin;
    state.shared.isGameStarted = true;

    showSnackbar('Game Started');
    broadcast({ type: 'gameStarted', sharedState: state.shared });
    putInitTechCardsToHand();
});

document.getElementById('stopGame').addEventListener('click', () => {
    if (isHost) {
        location.reload(); // Simple way to reset the game for the host
    }
});

function hasStation(die1, die2) {
    const slotIndex = (die1 - 1) * 6 + (die2 - 1);
    return state.shared.board[slotIndex].playerColor;
}

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

            const currPlayer = findCurrentPlayer();
            let result;
            if (diceType === '2d6') {
                const die1 = Math.floor(Math.random() * 6) + 1;
                const die2 = Math.floor(Math.random() * 6) + 1;
                result = { playerName: currPlayer.name, values: [die1, die2] };
                diceResult.textContent = `Result: (${die1}, ${die2})`;

                if(hasStation(die1, die2)) {
                    state.shared.currentStep = STEP.roll;
                } else {
                    state.shared.currentStep = STEP.choose;
                }
            } else {
                const die1 = Math.floor(Math.random() * diceType) + 1;
                result = { playerName: currPlayer?.name || 'unknown', values: die1 };
                diceResult.textContent = `Result: (${die1})`;
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

const defaultSlotBackgroundColor = '#f0f0f0';
function setBoardState(boardState) {
    const slots = document.querySelectorAll('.slot');
    slots.forEach((slot, index) => {
        slot.innerHTML = '';
        const state = boardState[index];

        if (state) {
            const row = Math.floor(index / 6) + 1;
            const col = (index % 6) + 1;

            const indicator = document.createElement('div');
            indicator.className = 'slot-indicator';
            indicator.textContent = `${state.type || ''} (${row}, ${col})`;
            slot.appendChild(indicator);
            if (state.playerColor) {
                slot.style.backgroundColor = state.playerColor;
            } else {
                slot.style.backgroundColor = defaultSlotBackgroundColor;
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

    if (!deck) {
        return;
    }

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

function loadSharedDeckImages() {
    const deckTypes = ['spell', 'equipment'];
    deckTypes.forEach(type => {
        const images = deckImages[type];
        const shuffledImages = shuffle([...images]);
        state.shared.decks[type] = shuffledImages;
    });
}

// Load player-specific deck images based on job when joining or becoming a host
function loadPlayerDeckImages(job) {
    if (state.shared.cardInfos[peer.id]) {
        console.log('Player deck images already loaded');
        return;
    }

    const images = deckImages.tech[job];
    console.log({ images })
    const multipleCopies = images.flatMap((card) => {
        return Array(card.copies ?? 1).fill(card).map((copy, i) => ({ ...copy, id: `${copy.id}_${i}` }));
    });
    console.log({ multipleCopies })
    const shuffledImages = shuffle([...multipleCopies]);
    state.player.decks.tech = shuffledImages;

    console.log({ peerId: peer.id, cardInfos: state.shared.cardInfos })

    updateSharedState({
        ...state.shared,
        cardInfos: {
          ...state.shared.cardInfos,
          [peer.id]: [...shuffledImages],
        }
    })
}

// Roll dice functionality
document.getElementById('rollDice').addEventListener('click', function() {
    const diceType = document.getElementById('dice-type').value;

    if (diceType === '2d6' && !state.shared.isGameStarted) {
       return;
    }

    rollDice(diceType);
});

// Initialize the decks
const decks = document.querySelectorAll('.deck-card');
decks.forEach(deck => {
    deck.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', deck.dataset.deckId);
    });
});

// Handle dropping cards into the hand
const hand = document.getElementById('hand');
hand.addEventListener('dragover', (e) => {
    e.preventDefault();
    const deckId = e.dataTransfer.getData('text/plain');
    return !!deckId;
});

function isPlayerDeck(deckId) {
    return deckId === 'tech';
}

hand.addEventListener('drop', (e) => {
    e.preventDefault();

    if (state.shared.isGameStarted) {
      switch(state.shared.currentStep) {
         case STEP.roll:
            state.shared.currentStep = STEP.choose;
            break;
         case STEP.choose:
            state.shared.currentStep = STEP.build;
            break;
      }
    }

    const deckId = e.dataTransfer.getData('text/plain');
    console.log('Dropping card from deck:', deckId);
    const deckNode = document.querySelector(`.deck-card[data-deck-id='${deckId}']`);
    const count = parseInt(deckNode.textContent);
    if (count > 0) {
        const deck = isPlayerDeck(deckId) ? state.player.decks[deckId] : state.shared.decks[deckId];
        const card = deck.pop();
        addCardToHand(deckId, card.id);

        if (isPlayerDeck(deckId)) {
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
    }
});

function getCardInfo(deckId, cardId, playerPeerId) {
    console.log(`Getting card info from ${deckId}, card id: ${cardId}`)

    console.log({ deckId, cardId, playerPeerId })

    const cardInfo = deckId === 'tech'
        ? state.shared.cardInfos[playerPeerId].find(card => card.id === cardId)
        : deckImages[deckId].find(card => card.id === cardId);

    console.log('Card info:', cardInfo)

    return cardInfo;
}

function createCardElement(deckId, cardId, playerJob, playerPeerId) {
    const cardInfo = getCardInfo(deckId, cardId, playerPeerId);

    const card = document.createElement('div');
    card.className = 'card';

    if (cardInfo.pattern) {
        const pattern = cardInfo.pattern;
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        const boxSize = 20; // Size of each box

        const patternWidth = pattern[0].length * boxSize;
        const patternHeight = pattern.length * boxSize;
        const startX = (canvas.width - patternWidth) / 2;
        const startY = (canvas.height - patternHeight) / 2;

        ctx.fillStyle = 'black';
        for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < pattern[i].length; j++) {
                if (pattern[i][j] === 1) {
                    ctx.fillRect(startX + j * boxSize, startY + i * boxSize, boxSize, boxSize);
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(startX + j * boxSize, startY + i * boxSize, boxSize, boxSize);
                }
            }
        }

        card.appendChild(canvas);
    } else {
        const img = document.createElement('img');
        const jobPath = deckId === 'tech' ? `/${playerJob}` : '';
        img.src = `./images/${deckId}${jobPath}/${cardInfo.url}`;
        card.appendChild(img);
    }

    card.draggable = true;
    const deckCardId = getCardNodeId(deckId, cardId, playerPeerId)
    card.dataset.deckCardId = deckCardId;
    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', deckCardId);
    });
    card.addEventListener('click', () => {
        showCardDetails(cardInfo);
    });
    return card;
}

function getCardNodeId(deckId, cardId, playerPeerId) {
    return [deckId, cardId, playerPeerId].join(cardIdDelim);
}

// Add a card to the hand with image
function addCardToHand(deckId, cardId) {
    console.log(`Adding card to hand from ${deckId}, card index: ${cardId}`);
    const currPlayer = findCurrentPlayer();
    currPlayer.cards++;
    const card = createCardElement(deckId, cardId, currPlayer.job, currPlayer.peerId);
    hand.appendChild(card);

    updateSharedState();
}

// Recycle a station on the board
function recycleStationOnBoard(slotIndex, player) {
    console.log(`Recycling station on board at slot ${slotIndex}, with color ${player.color}`);

    const newBoard = state.shared.board.map((s, i) => i.toString() === slotIndex.toString() ? ({ ...s, playerColor: null }) : s)

    player.resources++;
    player.stations--;

    updateSharedState({
        ...state.shared,
        board: newBoard,
    });
}

// Place a card on the board
function placeStationOnBoard(slotIndex, player) {
    if (player.resources <= 0) {
      return
    }

    console.log(`Placing a station on board at slot ${slotIndex}, with color ${player.color}`);

    const newBoard = state.shared.board.map((s, i) => i.toString() === slotIndex.toString() ? ({ ...s, playerColor: player.color }) : s)

    player.resources--;
    player.stations++;

    updateSharedState({
        ...state.shared,
        board: newBoard,
    });
}
// Add these lines in the appropriate place, likely after initializing the board and hand event listeners

const playArea = document.getElementById('play-area');
playArea.addEventListener('dragover', (e) => {
    if (state.shared.isGameStarted) {
        e.preventDefault();
    }
});

playArea.addEventListener('drop', (e) => {
    if (state.shared.isGameStarted) {
        e.preventDefault();

        state.shared.currentStep = STEP.play;

        const deckCardId = e.dataTransfer.getData('text/plain');
        const [deckId, cardId, playerPeerId] = deckCardId.split(cardIdDelim);
        const card = document.querySelector(`.card[data-deck-card-id='${deckCardId}']`);
        if (card) {
            const player = findCurrentPlayer();
            player.cards--;
            updateSharedState({
                ...state.shared,
                playArea: { deckId, cardId, playerColor: player.color, playerJob: player.job, playerPeerId }
            });
        }
    }
});

function putCardInPlayArea(card, playerColor, deckId, cardId, playerPeerId) {
    const playArea = document.getElementById('play-area');

    playArea.innerHTML = '';
    card.style.width = '60px';
    card.style.height = '90px';
    playArea.appendChild(card);
    playArea.style.backgroundColor = playerColor;
    card.addEventListener('click', () => {
        const cardInfo = getCardInfo(deckId, cardId, playerPeerId);
        showCardDetails(cardInfo);
    });
}

function clearCardFromPlayArea() {
    const playArea = document.getElementById('play-area');
    playArea.innerHTML = '';
    playArea.style.backgroundColor = 'transparent';
}

// Play a card in the play area
function playCard(deckId, cardId, playerColor, playerJob, playerPeerId) {
    console.log(`Playing card from ${deckId}, card id: ${cardId}`);

    const card = document.querySelector(`.card[data-deck-card-id='${getCardNodeId(deckId, cardId, playerPeerId)}']`);
    if (card) {
      putCardInPlayArea(card, playerColor, deckId, cardId, playerPeerId);
    } else {
      const otherPlayerCard = createCardElement(deckId, cardId, playerJob, playerPeerId);
      putCardInPlayArea(otherPlayerCard, playerColor, deckId, cardId, playerPeerId);
    }
}

// Show card details in a modal
function showCardDetails(cardInfo) {
    const modal = document.getElementById('cardDetailsModal');
    const cardName = document.getElementById('card-name');
    const cardDetailsTable = document.getElementById('card-details-table');

    cardName.textContent = cardInfo.title;
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
    updateUIFromState();
    initTurnSteps();
    initializeBoard();
});

function initializeBoard() {
    const slots = document.querySelectorAll('.slot');
    const types = ['R', 'T'];
    const slotTypes = Array(18).fill('R').concat(Array(18).fill('T'));
    shuffle(slotTypes);

    slots.forEach((slot, index) => {
        const type = slotTypes[index];
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
        player.resources = jobMetadata[job].initResources;
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

            loadPlayerDeckImages(playerJob);

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

function increasePopulation(inputPlayer) {
    const player = state.shared.players.find(p => p.peerId === peer.id);
    const populationChange = document.getElementById(`${inputPlayer}-population-change`).value;

    if (player) {
        player.population += parseInt(populationChange || '1');
        updateSharedState();
    }
}

function decreasePopulation(inputPlayer) {
    const player = state.shared.players.find(p => p.peerId === peer.id);
    const populationChange = document.getElementById(`${inputPlayer}-population-change`).value;

    if (player) {
        player.population -= parseInt(populationChange || '1');
        updateSharedState();
    }
}

function increaseResource() {
    if (state.shared.isGameStarted) {
      switch (state.shared.currentStep) {
          case STEP.roll:
              state.shared.currentStep = STEP.choose;
              break;
          case STEP.choose:
              state.shared.currentStep = STEP.build;
              break;
      }
    }

    const player = state.shared.players.find(p => p.peerId === peer.id);
    if (player) {
        player.resources += 1;
        updateSharedState();
    }
}

function decreaseResource() {
    const player = state.shared.players.find(p => p.peerId === peer.id);
    if (player) {
        player.resources -= 1;
        updateSharedState();
    }
}

function setActiveStep(stepIndex) {
    const steps = document.querySelectorAll(".step");

    steps.forEach((step, i) => {
        if (i === stepIndex) {
            step.classList.add("active");
        } else {
            step.classList.remove("active");
        }
    });
}

function updateStepsUI() {
    const currentStep = state.shared.currentStep;
    setActiveStep(currentStep);
}

function initTurnSteps() {
    const steps = document.querySelectorAll(".step");
    const endTurnButton = document.getElementById("end-turn");

    steps.forEach((step, index) => {
        step.addEventListener("click", () => {
           state.shared.currentStep = index;
           updateSharedState();
        });
    });

    endTurnButton.addEventListener("click", () => {
        state.shared.currentStep = STEP.roll;

        updateSharedState({
            ...state.shared,
            playArea: {},
        });

        updateSharedState();
    });
}

function kickPlayer(playerId) {
    const player = state.shared.players.find(p => p.id === playerId);
    const playerConnection = connections.find(c => c.peer === player.peerId);

    if (playerConnection) {
        playerConnection.close();
    }
}
