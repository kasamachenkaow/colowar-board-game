function broadcastState() {
    if (isHost) {
       broadcast({ type: 'broadcastState', sharedState: state.shared });
    } else {
       throw new Error('Only host can broadcast')
    }
}

function handleData(data) {
    console.log('Received data:', data);

    if (data.type === 'broadcastState') {
        replaceSharedState(data.sharedState);
        const currPlayer = findCurrentPlayer();
        loadPlayerDeckImages(currPlayer.job);
    }

    if (data.type === 'add-events') {
        state.shared.eventsHistory.unshift(...data.events);

        data.events.forEach(event => {
          eventReducer(state, event);
        })

        updateUIFromState();
        broadcastState();
    }

    if (data.type === 'game-started') {
        peer.disconnect();

        showSnackbar('Game Started');
        startGameConfetti();
        putInitTechCardsToHand();
    }
}

