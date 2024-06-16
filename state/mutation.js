const broadcastTimeouts = {};

function broadcast(data) {
    if (broadcastTimeouts[data.type]) {
        clearTimeout(broadcastTimeouts[data.type]);
    }

    // Boucing the broadcast if multiple broadcasts are happening for the same type
    broadcastTimeouts[data.type] = setTimeout(() => {
      console.log('Broadcasting data:', data);
      console.log('Connections:', connections);
      connections.forEach(connection => connection.send(data));
    }, 100);
}

const sendToHostTimeouts = {};
function sendToHost(data, deboucingTimeout = 0) {
    if (isHost) {
      throw new Error('Only client can send data to host');
    }

    if (sendToHostTimeouts[data.type]) {
        if (data.type === 'add-events') {
           data.events = sendToHostTimeouts[data.type].data.events.concat(data.events);
        }
        clearTimeout(sendToHostTimeouts[data.type].to);
    }

    if(deboucingTimeout == 0) {
       console.log('Sending data to host', data);
       conn.send(data);

       return;
    }

    // Deboucing the sending to host if multiple sendings are happening for the same type
    const to = setTimeout(() => {
       console.log('[debouced] Sending data to host', data);
       conn.send(data);
       sendToHostTimeouts[data.type] = null;
    }, deboucingTimeout);

    sendToHostTimeouts[data.type] = { to, data };
}

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

function broadcastState() {
    if (isHost) {
       broadcast({ type: 'broadcastState', sharedState: state.shared });
    } else {
       throw new Error('Only host can broadcast')
    }
}

