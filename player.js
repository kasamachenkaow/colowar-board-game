function getConnectedPlayers() {
    return state.shared.players.filter(p => !!p.peerId);
}

function getTotalPlayersCount() {
    return getConnectedPlayers().length;
}

