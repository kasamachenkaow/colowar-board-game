const playerColors = ['#ff9999', '#99ff99', '#9999ff', '#ffcc99']; // Colors for players
let peer;
let connections = [];
let isHost = false;
let conn;
let stationMode = 'build';
let connectedPeerId;

const cardIdDelim = '/';

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
        eventsHistory: [],
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
    return state.shared.players.find(p => p?.peerId === connectedPeerId);
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

            isSlotOccupied
              ? stationMode === 'build'
                ? recycleStationOnBoard(slotIndex, player)
                : destroyStationOnBoard(slotIndex, player)
              : placeStationOnBoard(slotIndex, player);
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

    if (newSharedState) {
        state.shared = {
          ...newSharedState,
          eventsHistory: state.shared.eventsHistory,
        };
    }

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
        const currPlayerIndex = state.shared.players.findIndex(p => p.peerId === connectedPeerId);
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
        if (connectedPeerId === player.peerId) {
            playerSlot.querySelectorAll('.player-button').forEach(button => button.style.display = 'block');
        } else {
            playerSlot.querySelectorAll('.player-button').forEach(button => button.style.display = 'none');
        }
    } else {
        playerSlot.style.backgroundColor = '#f0f0f0';
        icon.src = "images/no-player.png";
        status.textContent = 'Disconnected';
        cards.textContent = 'Cards: 0';
        population.textContent = `Population: ${initPlayer.population}`;
        skill.textContent = 'Skill: None';
        playerSlot.querySelectorAll('.player-button').forEach(button => button.style.display = 'none');
    }
}

function getSkillTextForJob(job, level) {
   return jobMetadata[job].skill(level);
}

function updateUIFromState() {
    console.log('Updating UI from state:', state.shared);

    if (isHost) {
      document.getElementById('startGame').style.display = state.shared.isGameStarted ? 'none' : 'block';
      document.getElementById('stopGame').style.display = state.shared.isGameStarted ? 'block' : 'none';
    }

    setBoardState(state.shared.board);

    if (connectedPeerId) {
      const currPlayer = findCurrentPlayer();

      let playerIndex = 1
      updatePlayerUI(currPlayer, playerIndex);

      state.shared.players.forEach((player) => {
          if (player.peerId !== connectedPeerId) {
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

    renderHistory();

    const lastRoll = state.shared.eventsHistory[0]?.values;
    if (Array.isArray(lastRoll)) {
      highlightSlot(lastRoll[0], lastRoll[1]);
    }

    updateDecks();
    updateTotalPopulation();
    updateLargestPlayer();
    updateStepsUI();
    updateStationsToWin();

    const winner = getWinner();
    if (winner) {
        showSnackbar('Game Over! ' + winner.name + ' wins!');
        winningConfetti();
    }
}

function getWinner() {
    if (!state.shared.isGameStarted) {
        return;;
    }

    const stationLimitPlayer = state.shared.players.find(p => p.stations >= state.shared.stationsToWin);
    if (stationLimitPlayer) {
       return stationLimitPlayer;
    }

    const totalPopulation = getTotalPopulation();
    const halfPopulation = getHalfPopulation(totalPopulation);

    const populationLimitPlayer = state.shared.players.find(p => p.population >= halfPopulation);
    if (populationLimitPlayer) {
       return populationLimitPlayer;
    }

    const onlyLeftPlayer = state.shared.players.filter(p => p.stations > 0);
    if (onlyLeftPlayer.length === 1) {
       return onlyLeftPlayer[0];
    }
}

function renderHistory() {
    const pinnedEventContainer = document.getElementById('pinned-event-container');
    const eventConainer = document.getElementById('event-container');

    const pinnedEvents = state.shared.eventsHistory.filter(e => e.pinned);
    const allEvents = state.shared.eventsHistory

    const pinnedMessages = pinnedEvents.map(event => getEventMessageItem(event, true)).join('');
    const allMessage = allEvents.map(event => getEventMessageItem(event)).join('');

    pinnedEventContainer.innerHTML = pinnedMessages;
    eventConainer.innerHTML = allMessage;
}

function getEventMessageItem(event, isPinned) {
    return `
        <div class="event${isPinned ? ' pinned-event' : ''}" onclick="${isPinned ? 'unpinEvent' : 'pinEvent'}('${event.eventId}')">
            <span class="player-name">${event.playerName}:</span>
            <span class="event-message">${event.type.includes('dice') ? `${emojis.Dice} Rolled ${Array.isArray(event.values) ? `(${event.values[0]}, ${event.values[1]})` : `(${event.values})`}` : `${event.values}`}</span>
        </div>
    `;
}

function pinEvent(eventId) {
    const event = state.shared.eventsHistory.find(e => e.eventId === eventId);
    if (event) {
        event.pinned = true
    }

    sendToHost({ type: 'update-event', event })
}

function unpinEvent(eventId) {
    const event = state.shared.eventsHistory.find(e => e.eventId === eventId);
    if (event) {
        event.pinned = false
    }

    sendToHost({ type: 'update-event', event })
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

function getTotalPopulation() {
    return state.shared.players.reduce((acc, player) => acc + player.population, 0);
}

function getHalfPopulation(totalPopulation) {
    return Math.ceil(totalPopulation / 2);
}

function updateTotalPopulation() {
    const totalPopulation = getTotalPopulation();
    const halfPopulation = getHalfPopulation(totalPopulation);

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
        startGameConfetti();
        replaceSharedState(data.sharedState);
        putInitTechCardsToHand();
        peer.disconnect();
    }

    if (data.type === 'add-event') {
        state.shared.eventsHistory.unshift(data.event);
        state.shared.currentStep = data.event.payload.currentStep;
        updateSharedState();
    }

    if (data.type === 'update-event') {
        const eventIndex = state.shared.eventsHistory.findIndex(e => e.eventId === data.event.eventId);
        state.shared.eventsHistory[eventIndex] = data.event;
        updateSharedState();
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
    const reducedSharedState = {
        ...state.shared,
        players: state.shared.players.filter(p => p.peerId === connectedPeerId),
        eventsHistory: [],
    };

    sendToHost({ type: 'updateState', sharedState: reducedSharedState });
}

const sendToHostTimeouts = {};
function sendToHost(data) {
    updateUIFromState();

    if (isHost) {
      updateSharedState();
      return;
    }

    if (sendToHostTimeouts[data.type]) {
        clearTimeout(sendToHostTimeouts[data.type]);
    }

    // Deboucing the sending to host if multiple sendings are happening for the same type
    sendSharedStateToHost[data.type] = setTimeout(() => {
      console.log('Sending data to host', data);
      conn.send(data);
    }, 50);
}

let maxRetriesPeerServer = 3;
let retriesPeerServer = 0;

document.getElementById('startHost').addEventListener('click', () => {
    document.getElementById('startHost').style.display = 'none';
    document.getElementById('join-controls').style.display = 'none';

    const kickPlayerButtons = document.querySelectorAll('.kick-player-button');
    kickPlayerButtons.forEach(button => button.style.display = 'flex');

    const peerUrl = document.getElementById('peerUrl').value;

    peer = initPeer();

    peer.on('open', id => {
        console.log('Host ID: ' + id);
        const hostIdDisplay = document.getElementById('hostIdDisplay');
        hostIdDisplay.textContent = 'Game ID: ' + id + ' 📋';
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

                removePlayer(connection.peer);

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
        console.log('Peer server disconnected');

        if (!state.shared.isGameStarted) {
            setTimeout(() => {
               showSnackbar('Reconnecting peer server...');
               retriesPeerServer++;

               if (retriesPeerServer <= maxRetriesPeerServer) {
                   peer.reconnect();
               }
            }, (retriesPeerServer + 1) * 2 * 1000);
        }
    });
});

function removePlayer(peerId) {
    const player = state.shared.players.find(p => p.peerId === peerId);
    if (player) {
        player.connected = false;
        player.peerId = null;
        updateSharedState(state.shared);
        showSnackbar(`Player ${state.shared.players.indexOf(player) + 1} - ${player.name} disconnected`);
    }
}

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

    peer.disconnect();

    const event = buildEventHistory({ playerName: 'Host', values: `Game Started! ${emojis.PartyPepper}`, type: 'game' });
    publishEventHistory(event);

    showSnackbar('Game Started');
    startGameConfetti();
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

                if(hasStation(die1, die2)) {
                    state.shared.currentStep = STEP.roll;
                } else {
                    state.shared.currentStep = STEP.choose;
                }

                diceResult.textContent = `Result: (${die1}, ${die2})`;
                result = buildEventHistory({ playerName: currPlayer.name, values: [die1, die2], type: 'roll-dice' });
            } else {
                const die1 = Math.floor(Math.random() * diceType) + 1;
                result = buildEventHistory({ playerName: currPlayer?.name || 'unknown', values: die1, type: 'dice'});
                diceResult.textContent = `Result: (${die1})`;
            }

            publishEventHistory(result);
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

function sendChat(msg) {
    const currPlayer = findCurrentPlayer();
    const event = buildEventHistory({ playerName: currPlayer?.name || 'unknown', values: msg, type: 'chat' });

    publishEventHistory(event);
}

function buildEventHistory({ playerName, values, type }) {
    const eventId = generateUID();
    const eventTime = new Date().toLocaleTimeString();
    const payload = { currentStep: state.shared.currentStep }
    return { eventId, eventTime, playerName, values, type, payload };
}

function publishEventHistory(event) {
    state.shared.eventsHistory.unshift(event);

    sendToHost({ type: 'add-event', event });
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
    if (state.shared.cardInfos[connectedPeerId]) {
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

    console.log({ peerId: connectedPeerId, cardInfos: state.shared.cardInfos })

    updateSharedState({
        ...state.shared,
        cardInfos: {
          ...state.shared.cardInfos,
          [connectedPeerId]: [...shuffledImages],
        }
    })
}

// also send message when press enter key on chat-message input
document.getElementById('chat-message').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const chatMessage = document.getElementById('chat-message').value;
        sendChat(chatMessage);
        document.getElementById('chat-message').value = '';
    }
});

document.getElementById('send-chat').addEventListener('click', () => {
    const chatMessage = document.getElementById('chat-message').value;
    sendChat(chatMessage);
    document.getElementById('chat-message').value = '';
});

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

                // Draw X
                if (pattern[i][j] === 'X') {
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    // Draw two diagonal lines to form an X
                    ctx.moveTo(startX + j * boxSize, startY + i * boxSize);
                    ctx.lineTo(startX + j * boxSize + boxSize, startY + i * boxSize + boxSize);
                    ctx.moveTo(startX + j * boxSize + boxSize, startY + i * boxSize);
                    ctx.lineTo(startX + j * boxSize, startY + i * boxSize + boxSize);
                    ctx.stroke();
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

    const event = buildEventHistory({ playerName: currPlayer.name, values: `${emojis.Card} Added a [${deckId} card] to hands`, type: 'card' });
    publishEventHistory(event);

    updateSharedState();
}

// Recycle a station on the board
function recycleStationOnBoard(slotIndex, player) {
    console.log(`Recycling station on board at slot ${slotIndex}, with color ${player.color}`);

    const slot = state.shared.board[slotIndex];

    if (slot.playerColor !== player.color) {
        return;
    }

    slot.playerColor = null;

    player.resources++;
    player.stations--;

    const [row, col] = getRowColFromSlotIndex(slotIndex);

    const event = buildEventHistory({ playerName: player.name, values: `${emojis.Station}♻️ Recycled a station on slot (${row}, ${col})`, type: 'station' });
    publishEventHistory(event);

    updateSharedState();
}

// Destroy a station on the board
function destroyStationOnBoard(slotIndex, player) {
    console.log(`Destroying station on board at slot ${slotIndex}, with color ${player.color}`);

    const slot = state.shared.board[slotIndex];

    if (slot.playerColor !== player.color) {
        return;
    }

    slot.playerColor = null;

    player.stations--;

    const [row, col] = getRowColFromSlotIndex(slotIndex);

    const event = buildEventHistory({ playerName: player.name, values: `${emojis.Station}⚠️Destroyed a station on slot (${row}, ${col})`, type: 'station' });

    publishEventHistory(event);
    updateSharedState();
}

function getRowColFromSlotIndex(slotIndex) {
    const row = Math.floor(slotIndex / 6) + 1;
    const col = (slotIndex % 6) + 1;
    return [row, col];
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

    const [row, col] = getRowColFromSlotIndex(slotIndex);

    const event = buildEventHistory({ playerName: player.name, values: `${emojis.Station}🛠️  Built a station on slot (${row}, ${col})`, type: 'station' });
    publishEventHistory(event);

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

            const cardTitle = getCardInfo(deckId, cardId, playerPeerId).title;
            const event = buildEventHistory({ playerName: player.name, values: `${emojis.Card} Played a [${cardTitle}] card`, type: 'play' });
            publishEventHistory(event);

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

function generateUID() {
    // I generate the UID from two parts here
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}

function initPeer() {
    const peerUrl = document.getElementById('peerUrl').value;

    if (!peerUrl) {
       const newPeer = new Peer(generateUID());
       connectedPeerId = newPeer.id;

       return newPeer;
    }

    const [protocol, host, path, port] = getHostInfo(peerUrl);

    console.log('Peer URL:', peerUrl)
    console.log({ protocol, host, path, port })

    const newPeer = new Peer(generateUID(), { host, path, port });

    connectedPeerId = newPeer.id;

    return newPeer;
}

function getHostInfo(peerUrl) {
    const url = new URL(peerUrl);
    return [url.protocol, url.host, url.pathname, url.port];
}

joinButton.addEventListener('click', () => {
    const hostId = document.getElementById('peerId').value;
    const playerName = document.getElementById('playerName').value;
    const playerJob = document.getElementById('playerJob').value;

    if (playerName && playerJob) {
        if (isHost) {
            newPlayer(connectedPeerId, playerName, playerJob)

            loadPlayerDeckImages(playerJob);

            modal.style.display = 'none';

            updateUIFromState();
        } else {
            if (hostId) {
                peer = initPeer();
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
    const player = findCurrentPlayer();

    if (player && player.jobLevel < 3) {
        player.jobLevel += 1;

        const event = buildEventHistory({ playerName: player.name, values: `${emojis.Learn} Increased job level to ${player.jobLevel}`, type: 'job' });
        publishEventHistory(event);

        updateSharedState();
    }
}

function increasePopulation(inputPlayer) {
    const player = findCurrentPlayer();
    const populationChange = document.getElementById(`${inputPlayer}-population-change`).value;

    if (player) {
        const change = parseInt(populationChange || '1');
        player.population += parseInt(change);

        const event = buildEventHistory({ playerName: player.name, values: `${emojis.Population} ${emojis.Up} Gained +${change} population`, type: 'population' });
        publishEventHistory(event);

        updateSharedState();
    }
}

function decreasePopulation(inputPlayer) {
    const player = findCurrentPlayer();
    const populationChange = document.getElementById(`${inputPlayer}-population-change`).value;

    if (player) {
        const change = parseInt(populationChange || '1');
        player.population -= parseInt(change);

        const event = buildEventHistory({ playerName: player.name, values: `${emojis.Population} ${emojis.Down} Lost -${change} population`, type: 'population' });
        publishEventHistory(event);

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

    const player = findCurrentPlayer();
    if (player) {
        player.resources += 1;

        const event = buildEventHistory({ playerName: player.name, values: `${emojis.Resource} ${emojis.Up} Gained +1 resource`, type: 'resource' });
        publishEventHistory(event);

        updateSharedState();
    }
}

function decreaseResource() {
    const player = findCurrentPlayer();
    if (player) {
        player.resources -= 1;

        const event = buildEventHistory({ playerName: player.name, values: `${emojis.Resource} ${emojis.Down} Lost -1 resource`, type: 'resource' });
        publishEventHistory(event);

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

        const event = buildEventHistory({ playerName: findCurrentPlayer().name, values: `${emojis.Turn} Ended turn`, type: 'turn' });
        publishEventHistory(event);

        updateSharedState({
            ...state.shared,
            playArea: {},
        });
    });
}

function kickPlayer(playerId) {
    const player = state.shared.players.find(p => p.id === playerId);
    const playerConnection = connections.find(c => c.peer === player.peerId);

    if (playerConnection) {
        removePlayer(player.peerId);
        playerConnection.close();
    }
}

function winningConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}


function startGameConfetti() {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
  };

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 1.2,
    shapes: ['star']
  });

  confetti({
    ...defaults,
    particleCount: 10,
    scalar: 0.75,
    shapes: ['circle']
  });
}

function toggleMode(element) {
    element.classList.toggle('on');
    const textElement = document.querySelector('.toggle-text');
    if (element.classList.contains('on')) {
        stationMode = 'destroy';
        textElement.textContent = 'Destroy Mode';
        textElement.classList.add('on');
    } else {
        stationMode = 'build';
        textElement.textContent = 'Build Mode';
        textElement.classList.remove('on');
    }
}

const versionNode = document.getElementById('version');
versionNode.textContent = `v${version}`;
