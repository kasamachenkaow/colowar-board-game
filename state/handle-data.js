function handleData(data) {
    console.log('Received data:', data);

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

    if (data.type === 'add-events') {
        state.shared.eventsHistory.unshift(...data.events);

        broadcastState();
    }
}
