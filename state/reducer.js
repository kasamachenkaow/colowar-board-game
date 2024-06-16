findPlayerByPeerId = (state, playerPeerId) => {
  return state.shared.players.find(player => player.peerId === playerPeerId);
}

const eventReducer = (state, event) => {
  console.log('eventReducer', event.eventName, event.payload)

  switch (event.eventName) {
    case 'card-added-to-hands': {
      const { playerPeerId } = event.payload;

      const affectedPlayer = findPlayerByPeerId(state, playerPeerId);
      affectedPlayer.cards++;

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

    } break;
    case 'station-recycled': {
      const { playerPeerId, slotIndex } = event.payload;

      const affectedPlayer = findPlayerByPeerId(state, playerPeerId);
      affectedPlayer.resources++;
      affectedPlayer.stations--;

      const slot = state.shared.board[slotIndex];
      slot.playerColor = null;
    } break;
    case 'station-destroyed': {
      const { playerPeerId, slotIndex } = event.payload;

      const affectedPlayer = findPlayerByPeerId(state, playerPeerId);
      affectedPlayer.stations--;

      const slot = state.shared.board[slotIndex];
      slot.playerColor = null;

    } break;
    case 'station-built': {
      const { playerPeerId, slotIndex } = event.payload;

      const affectedPlayer = findPlayerByPeerId(state, playerPeerId);
      affectedPlayer.resources--;
      affectedPlayer.stations++;

      const slot = state.shared.board[slotIndex];
      slot.playerColor = affectedPlayer.color;

      if (state.shared.isGameStarted && state.shared.currentStep === STEP.build) {
         state.shared.currentStep = STEP.play;
      }
    } break;
    case 'card-played': {
      const { playerPeerId, deckId, cardId } = event.payload;

      const affectedPlayer = findPlayerByPeerId(state, playerPeerId);
      affectedPlayer.cards--;

      state.shared.playArea = { deckId, cardId, playerColor: affectedPlayer.color, playerJob: affectedPlayer.job, playerPeerId };
    } break;
    case 'job-level-increased': {
      const { playerPeerId } = event.payload;

      const affectedPlayer = findPlayerByPeerId(state, playerPeerId);
      affectedPlayer.jobLevel++;
    } break;
    case 'population-increased': {
      const { playerPeerId, change } = event.payload;

      const affectedPlayer = findPlayerByPeerId(state, playerPeerId);
      affectedPlayer.population+=change;
    } break;
    case 'population-decreased': {
      const { playerPeerId, change } = event.payload;

      const affectedPlayer = findPlayerByPeerId(state, playerPeerId);
      affectedPlayer.population-=change;
    } break;
    case 'resources-increased': {
      const { playerPeerId, change } = event.payload;

      const affectedPlayer = findPlayerByPeerId(state, playerPeerId);
      affectedPlayer.resources+=change;

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
    } break;
    case 'resources-decreased': {
      const { playerPeerId, change } = event.payload;

      const affectedPlayer = findPlayerByPeerId(state, playerPeerId);
      affectedPlayer.resources-=change;
    } break;
    case 'step-changed': {
      const { step } = event.payload;

      state.shared.currentStep = step;
    } break;
    case 'turn-ended': {
      state.shared.currentStep = STEP.roll;
      state.shared.playArea = null;
    } break;
    case 'slot-dice-rolled': {
        const { die1, die2 } = event.payload;

        if(hasStation(die1, die2)) {
            state.shared.currentStep = STEP.roll;
        } else {
            state.shared.currentStep = STEP.choose;
        }
    } break;
    case 'event-pinned': {
      const { eventId } = event.payload;

      const updatingEvent = state.shared.eventsHistory.find(e => e.eventId === eventId);
      if (updatingEvent) {
        updatingEvent.pinned = true
      }
    } break;
    case 'event-unpinned': {
      const { eventId } = event.payload;

      const updatingEvent = state.shared.eventsHistory.find(e => e.eventId === eventId);
      if (updatingEvent) {
        updatingEvent.pinned = false
      }
    } break;
  }
}
