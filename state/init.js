const playerColors = ['#ff9999', '#99ff99', '#9999ff', '#ffcc99']; // Colors for players
let peer;
let connections = [];
let isHost = false;
let conn;
let stationMode = 'build';
let connectedPeerId;
const stationPopulation = 5;

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
    name: '',
    job: '',
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
        currentStep: STEP['roll'],
        stationsToWin: 0,
    },
    player: {
        ...initPlayer,
        cardInfos: {},
    }
};

// Initialize the players array after defining the state
state.shared.players = [
    { ...initPlayer, id: 'player1', color: playerColors[0], resources: 0, stations: 0 },
    { ...initPlayer, id: 'player2', color: playerColors[1], resources: 0, stations: 0 },
    { ...initPlayer, id: 'player3', color: playerColors[2], resources: 0, stations: 0 },
    { ...initPlayer, id: 'player4', color: playerColors[3], resources: 0, stations: 0 },
];
