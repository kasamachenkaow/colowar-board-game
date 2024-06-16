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
    const playerSlot = document.getElementById(player.id);

    playerSlot.outerHTML = getPlayerContent(player);
}

function getSkillTextForJob(job, level) {
   if (!job) {
     return '-';
   }

   const playersCount = getTotalPlayersCount();
   return jobMetadata[job].skill(level, playersCount);
}

function updateUIFromState() {
    console.log('Updating UI from state:', state.shared);

    if (isHost) {
      document.getElementById('startGame').style.display = state.shared.isGameStarted ? 'none' : 'block';
      // document.getElementById('stopGame').style.display = state.shared.isGameStarted ? 'block' : 'none';
      //
    }


    document.getElementById('game-info-card').style.display = state.shared.isGameStarted ? 'block' : 'none';
    document.getElementById('peerUrl').style.display = connectedPeerId ? 'none' : 'block';
    document.getElementById('hostIdDisplay').style.display = state.shared.isGameStarted ? 'none' : 'block';

    setBoardState(state.shared.board);

    renderPlayersUI();

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

    const pinnedEvents = state.shared.eventsHistory.filter(e => e.pinned).filter(e => !!e.values);
    const allEvents = state.shared.eventsHistory.filter(e => !!e.values);

    const pinnedMessages = pinnedEvents.map(event => getEventMessageItem(event, true)).join('');
    const allMessage = allEvents.map(event => getEventMessageItem(event)).join('');

    pinnedEventContainer.innerHTML = pinnedMessages;
    eventConainer.innerHTML = allMessage;
}

function getEventMessageItem(event, isPinned) {
    return `
        <div class="event${isPinned ? ' pinned-event' : ''}" onclick="${isPinned ? 'unpinEvent' : 'pinEvent'}('${event.eventId}')">
            <span class="player-color-box" style="background-color: ${event.playerColor}"></span>
            <span class="player-name">${event.playerName}:</span>
            <span class="event-message">${event.type.includes('dice') ? `${emojis.Dice} Rolled ${Array.isArray(event.values) ? `(${event.values[0]}, ${event.values[1]})` : `(${event.values})`}` : `${event.values}`}</span>
        </div>
    `;
}

function pinEvent(eventId) {
    const player = findCurrentPlayer();

    const pinnedEvent = buildEventHistory({
      player,
      eventName: 'event-pinned',
      eventPayload: { eventId },
      values: '', type: 'event' });

    publishEventsHistory([pinnedEvent]);
}

function unpinEvent(eventId) {
    const player = findCurrentPlayer();

    const pinnedEvent = buildEventHistory({
      player,
      eventName: 'event-unpinned',
      eventPayload: { eventId },
      values: '', type: 'event' });

    publishEventsHistory([pinnedEvent]);
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

function fillOtherPlayers(players) {
    const updatingPlayer = players[0];
    const otherPlayers = state.shared.players.filter(p => p.peerId !== updatingPlayer.peerId);
    return [...otherPlayers, updatingPlayer].sort((a, b) => a.id < b.id ? -1 : 1);
}

function sortToPutCurrentPlayerLast(players) {
    const currentPlayer = findCurrentPlayer();
    if (!currentPlayer) {
        return players;
    }

    const otherPlayers = state.shared.players.filter(p => p.id !== currentPlayer.id);
    return [currentPlayer, ...otherPlayers];
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

let maxRetriesPeerServer = 3;
let retriesPeerServer = 0;

document.getElementById('startHost').addEventListener('click', () => {
    isHost = true;

    document.getElementById('startHost').style.display = 'none';
    document.getElementById('join-controls').style.display = 'none';

    const peerUrl = document.getElementById('peerUrl').value;

    peer = initPeer();

    peer.on('open', id => {
        console.log('Host ID: ' + id);
        const hostIdDisplay = document.getElementById('hostIdDisplay');
        hostIdDisplay.textContent = 'Game ID: ' + id + ' 📋';
        hostIdDisplay.style.display = 'block';
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

                updateUIFromState();
                broadcastState();
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

        showSnackbar(`Player ${state.shared.players.indexOf(player) + 1} - ${player.name} disconnected`);

        updateUIFromState();
        broadcastState();
    }
}

document.getElementById('joinGame').addEventListener('click', () => {
    showModal('client');
});

document.getElementById('leaveGame').addEventListener('click', () => {
    location.reload(); // Simple way to leave the game
});



document.getElementById('startGame').addEventListener('click', () => {
  putInitTechCardsToHand();

  const stationsToWin = Math.max(16 - (getTotalPlayersCount() * 2), 10);

  state.shared.stationsToWin = stationsToWin;
  state.shared.isGameStarted = true;

  peer.disconnect();

  showSnackbar('Game Started');
  startGameConfetti();

  const event = buildEventHistory({
    eventName: 'game-started',
    eventPayload: {},
    values: `Game Started! ${emojis.PartyPepper}`,
    type: 'game' });

  publishEventsHistory([event]);

  broadcast({ type: 'game-started' });
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

    if (diceType === '2d6') {
        resetHighlightSlot();;
    }

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

                diceResult.textContent = `Result: (${die1}, ${die2})`;

                result = buildEventHistory({
                  player: currPlayer,
                  eventName: 'slot-dice-rolled',
                  eventPayload: { die1, die2 },
                  values: [die1, die2], type: 'roll-dice' });
            } else {
                const die1 = Math.floor(Math.random() * diceType) + 1;
                result = buildEventHistory({
                  player: currPlayer,
                  eventName: 'dice-rolled',
                  eventPayload: { die1 },
                  values: die1, type: 'dice'});

                diceResult.textContent = `Result: (${die1})`;
            }

            publishEventsHistory([result]);
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

function resetHighlightSlot() {
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => slot.classList.remove('highlight'));
}

function sendChat(msg) {
    const currPlayer = findCurrentPlayer();
    const event = buildEventHistory({
      player: currPlayer,
      eventName: 'chat-sent',
      eventPayload: { playerPeerId: currPlayer.peerId },
      values: msg, type: 'chat' });

    publishEventsHistory([event]);
}

function buildEventHistory({ player, values, type, eventName, eventPayload }) {
    const eventId = generateUID();
    const eventTime = new Date().toLocaleTimeString();
    const payload = { ...eventPayload }
    const playerName = player?.name || 'Host';
    const playerColor = player?.color || '#000';

    return { eventId, eventName, eventTime, playerName, playerColor, values, type, payload };
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

            const coord = document.createElement('div');
            coord.className = 'slot-coord';
            const indicator = document.createElement('div');
            indicator.className = 'slot-indicator';

            const symbol = state.type === 'T' ? emojis.Card : state.type === 'R' ? emojis.Resource : '';
            indicator.textContent = `${symbol}`;
            coord.textContent = `${row}-${col}`;

            slot.appendChild(indicator);
            slot.appendChild(coord);

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
    const playerDeckIds = Object.keys(state.player.decks);

    playerDeckIds.forEach(deckId => updateDeck(deckId, 'player'));
}

function updateDeck(deckId, type) {
    const deck = document.querySelector(`.deck-card[data-deck-id='${deckId}']`);
    const deckCount = document.getElementById(`${deckId}-deck-count`);

    if (!deck) {
        return;
    }

    const count = state[type].decks[deckId].length;
    deckCount.textContent = count;

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
    const currPlayer = findCurrentPlayer();

    if (state.player.decks.tech && state.player.decks.tech.length > 0) {
        console.log('Job deck images already loaded');
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

    console.log('Job deck images loaded');
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

    const deckId = e.dataTransfer.getData('text/plain');
    console.log('Dropping card from deck:', deckId);
    const deckCountNode = document.getElementById(`${deckId}-deck-count`)

    const count = parseInt(deckCountNode.textContent);
    if (count > 0) {
        const deck = state.player.decks[deckId];
        const card = deck.pop();

        addCardToHand(deckId, card.id);

        updatePlayerState({
            ...state.player,
            decks: {
                ...state.player.decks,
                [deckId]: state.player.decks[deckId].slice(0, count - 1)
            }
        });
    }
});

function getCardInfo(deckId, cardId, playerPeerId) {
    console.log(`Getting card info from ${deckId}, card id: ${cardId}, player peer id: ${playerPeerId}`)

    const p = state.shared.players.find(p => p.peerId === playerPeerId);

    const cardInfo = deckImages.tech[p.job].find(card => cardId.includes(card.id))

    console.log('Card info:', cardInfo)

    return cardInfo;
}

function createCardElement(deckId, cardId, playerJob, playerPeerId) {
    const cardInfo = getCardInfo(deckId, cardId, playerPeerId);

    const card = document.createElement('div');
    card.className = 'card';

    console.log('Creating card element:', cardInfo)

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
                    ctx.fillStyle = '#faa';
                    ctx.fillRect(startX + j * boxSize, startY + i * boxSize, boxSize, boxSize);
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(startX + j * boxSize, startY + i * boxSize, boxSize, boxSize);
                    ctx.fillStyle = 'black';
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
    const card = createCardElement(deckId, cardId, currPlayer.job, currPlayer.peerId);
    hand.appendChild(card);

    const event = buildEventHistory({
      player: currPlayer,
      values: `${emojis.Card} Added a [${deckId} card] to hands`,
      type: 'card' ,
      eventName: 'card-added-to-hands',
      eventPayload: { playerPeerId: currPlayer.peerId }
    });

    publishEventsHistory([event]);
}

// Recycle a station on the board
function recycleStationOnBoard(slotIndex, player) {
    console.log(`Recycling station on board at slot ${slotIndex}, with color ${player.color}`);

    const slot = state.shared.board[slotIndex];

    if (slot.playerColor !== player.color) {
        return;
    }

    const [row, col] = getRowColFromSlotIndex(slotIndex);

    const recycledEvent = buildEventHistory({
       player,
       eventName: 'station-recycled',
       eventPayload: { playerPeerId: player.peerId, slotIndex },
       values: `${emojis.Station}♻️ Recycled a station on slot (${row}, ${col})`, type: 'station' });

    const populationDecreasedEvent = buildEventHistory({
      player,
      eventName: 'population-decreased',
      eventPayload: { playerPeerId: player.peerId, change: stationPopulation },
      values: `${emojis.Population} ${emojis.Down} Lost -${stationPopulation} population`, type: 'population' });

    publishEventsHistory([populationDecreasedEvent, recycledEvent]);
}

// Destroy a station on the board
function destroyStationOnBoard(slotIndex, player) {
    console.log(`Destroying station on board at slot ${slotIndex}, with color ${player.color}`);

    const slot = state.shared.board[slotIndex];

    if (slot.playerColor !== player.color) {
        return;
    }

    const [row, col] = getRowColFromSlotIndex(slotIndex);

    const destroyEvent = buildEventHistory({
      player,
      eventName: 'station-destroyed',
      eventPayload: { playerPeerId: player.peerId, slotIndex },
      values: `${emojis.Station}⚠️Destroyed a station on slot (${row}, ${col})`, type: 'station' });
    const populationDecreasedEvent = buildEventHistory({
      player,
      eventName: 'population-decreased',
      eventPayload: { playerPeerId: player.peerId, change: stationPopulation },
      values: `${emojis.Population} ${emojis.Down} Lost -${stationPopulation} population`, type: 'population' });

    publishEventsHistory([populationDecreasedEvent, destroyEvent]);
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

    const slot = state.shared.board[slotIndex];

    if (slot.playerColor) {
      return
    }

    console.log(`Placing a station on board at slot ${slotIndex}, with color ${player.color}`);

    const [row, col] = getRowColFromSlotIndex(slotIndex);

    const buildEvent = buildEventHistory({
      player,
      eventName: 'station-built',
      eventPayload: { playerPeerId: player.peerId, slotIndex },
      values: `${emojis.Station}🛠️  Built a station on slot (${row}, ${col})`, type: 'station' });

    const populationIncreasedEvent = buildEventHistory({
      player,
      eventName: 'population-increased',
      eventPayload: { playerPeerId: player.peerId, change: stationPopulation },
      values: `${emojis.Population} ${emojis.Up} Gained +${stationPopulation} population`, type: 'population' });

    publishEventsHistory([populationIncreasedEvent, buildEvent]);
}

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

            const cardTitle = getCardInfo(deckId, cardId, playerPeerId).title;

            const event = buildEventHistory({
              player,
              eventName: 'card-played',
              eventPayload: { deckId, cardId, playerPeerId },
              values: `${emojis.Card} Played a [${cardTitle}] card`, type: 'play' });
            publishEventsHistory([event]);
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
    renderPlayersUI();
    initSlotsBoard();
    updateUIFromState();
    initTurnSteps();
    initializeBoard();
});

function renderPlayersUI() {
    const playersContainer = document.getElementById('players-container');
    const sortPlayers = sortToPutCurrentPlayerLast(state.shared.players);
    console.log({ sortPlayers })
    const playerContents = sortPlayers.map((player, index) => {
        return getPlayerContent(player);
    });

    playersContainer.innerHTML = playerContents.join('');
}

function getPlayerContent(player) {
    const isCurrentPlayer = connectedPeerId === player.peerId;

    return isCurrentPlayer ? getFullPlayerContent(player) : getCompactPlayerContent(player);
}

function getFullPlayerContent (player) {
    return `
           <div id="${player.id}" class="player-slot">
              <div class="player-header" style="background-color: ${player.color};">
              </div>
              <div class="player-details">
                <div class="player-name">Name: ${player.name || '-'}</div>
                <div class="player-job">Job: ${player.job || '-'} (Level ${player.jobLevel || '0'})</div>
                <div class="player-cards">${emojis.Card} Cards: ${player.cards}</div>
                <div class="player-population">${emojis.Population} Population: ${player.population}</div>
                <div class="player-resources">${emojis.Resource} Resources: ${player.resources}</div>
                <div class="player-stations">${emojis.Station} Stations: ${player.stations}</div>
                <div class="player-skill">Skill:
                    <p class="player-skill-content">${getSkillTextForJob(player.job, player.jobLevel)}</p>
                 </div>
              </div>
              <div class="player-actions" style="display: block;">
                <button class="player-button player-input" onclick="increaseJobLevel('${player.id}')">Increase Job Level</button>
                <input class="player-input" type="number" id="${player.id}-population-change" value="5" />
                <button class="player-button player-input" onclick="increasePopulation('${player.id}')">Increase Population</button>
                <button class="player-button player-input" onclick="decreasePopulation('${player.id}')">Decrease Population</button>
              </div>
            </div>
    `
}

function getCompactPlayerContent (player) {
    return `
        <div id="${player.id}" class="player-slot-compact">
          <div class="player-header-compact" style="background-color: ${player.color};">
            <div class="player-title-compact">
                <div class="player-name-compact">${player.name || '-'}</div>
                <div class="player-job-compact">${player.job || '-'} (Level ${player.jobLevel || '0'})</div>
                <div class="player-skill-compact">${getSkillTextForJob(player.job, player.jobLevel)}</div>
            </div>
            <div class="kick-player-button-compact" style="display: ${isHost ? 'flex' : 'none'};">
              <button class="player-button player-input" onclick="kickPlayer('${player.id}')">Kick</button>
            </div>
          </div>
          <div class="player-details-compact">
            <div class="player-cards-compact">🃏${player.cards}</div>
            <div class="player-population-compact">👥${player.population}</div>
            <div class="player-resources-compact">💰${player.resources}</div>
            <div class="player-stations-compact">🏢${player.stations}</div>
          </div>
        </div>
    `
}

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
        loadPlayerDeckImages(playerJob);

        if (isHost) {
            newPlayer(connectedPeerId, playerName, playerJob)

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
        const event = buildEventHistory({
          player,
          eventName: 'job-level-increased',
          eventPayload: { playerPeerId: player.peerId },
          values: `${emojis.Learn} Increased job level to ${player.jobLevel}`, type: 'job' });
        publishEventsHistory([event]);
    }
}

function increasePopulation(inputPlayer) {
    const player = findCurrentPlayer();
    const populationChange = document.getElementById(`${inputPlayer}-population-change`).value;

    if (player) {
        const change = parseInt(populationChange || '1');

        const event = buildEventHistory({
          player,
          eventName: 'population-increased',
          eventPayload: { playerPeerId: player.peerId, change },
          values: `${emojis.Population} ${emojis.Up} Gained +${change} population`, type: 'population' });
        publishEventsHistory([event]);
    }
}

function decreasePopulation(inputPlayer) {
    const player = findCurrentPlayer();
    const populationChange = document.getElementById(`${inputPlayer}-population-change`).value;

    if (player) {
        const change = parseInt(populationChange || '1');

        const event = buildEventHistory({
          player,
          eventName: 'population-decreased',
          eventPayload: { playerPeerId: player.peerId, change },
          values: `${emojis.Population} ${emojis.Down} Lost -${change} population`, type: 'population' });
        publishEventsHistory([event]);

    }
}

function increaseResource() {
    const player = findCurrentPlayer();
    if (player) {
        const event = buildEventHistory({
          player,
          eventName: 'resources-increased',
          eventPayload: { playerPeerId: player.peerId, change: 1 },
          values: `${emojis.Resource} ${emojis.Up} Gained +1 resource`, type: 'resource' });
        publishEventsHistory([event]);
    }
}

function decreaseResource() {
    const player = findCurrentPlayer();
    if (player) {
        const event = buildEventHistory({
          player,
          eventName: 'resources-decreased',
          eventPayload: { playerPeerId: player.peerId, change: 1 },
          values: `${emojis.Resource} ${emojis.Down} Lost -1 resource`, type: 'resource' });
        publishEventsHistory([event]);
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
           const player = findCurrentPlayer();

           const event = buildEventHistory({
             player,
             eventName: 'step-changed',
             eventPayload: { step: index },
             values: `${emojis.Turn} Changed step to ${index}`, type: 'step' });

           publishEventsHistory([event])
        });
    });

    endTurnButton.addEventListener("click", () => {
        const event = buildEventHistory({
          player: findCurrentPlayer(),
          eventName: 'turn-ended',
          eventPayload: {},
          values: `${emojis.Turn} Ended turn`, type: 'turn' });

        publishEventsHistory([event]);
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
