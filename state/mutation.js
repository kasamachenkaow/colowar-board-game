function publishEventsHistory(events) {
    state.shared.eventsHistory.unshift(...events);

    events.forEach(event => {
      eventReducer(state, event);
    })

    updateUIFromState();

    if (isHost) {
       broadcastState();
    } else {
       sendToHost({ type: 'add-events', events }, 200);
    }
}
