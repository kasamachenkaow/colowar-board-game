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
