findPlayerByPeerId = (state, playerPeerId) => {
  return state.shared.players.find(player => player.peerId === playerPeerId);
}

const eventReducer = (state, event) => {
  switch (event.eventName) {
    'card-added-to-hands': {
      const {} = event.payload;

      const affectedPlayer = findPlayerById(state, playerId);
      affectedPlayer.cards++;
    } break;
    'station': {

    } break;
  }
}

