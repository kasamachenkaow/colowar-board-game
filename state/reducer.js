findPlayerByPeerId = (state, playerPeerId) => {
  return state.shared.players.find(player => player.peerId === playerPeerId);
}

const eventReducer = (state, event) => {
  switch (event.eventName) {
    'card-added-to-hands': {
      const { playerPeerId } = event.payload;

      const affectedPlayer = findPlayerByPeerId(state, playerPeerId);
      affectedPlayer.cards++;
    } break;
    'station': {

    } break;
  }
}

        // state.shared.currentStep = data.events[0].payload.currentStep;
//
    // if (data.type === 'update-event') {
    //     const eventIndex = state.shared.eventsHistory.findIndex(e => e.eventId === data.event.eventId);
    //     state.shared.eventsHistory[eventIndex] = data.event;
    //     updateSharedState();
    // }
