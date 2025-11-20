import {useState} from 'react';

function setupAwareness(providerRef, setCoordinates) {

  let cursor_map = new Map(); // stores cursor positions for different clients on same webrtc conn

  // MARK: awareness
  // Testing out awareness
  const awareness = providerRef.awareness;
  console.log('[AWARENESS CRDT]', awareness);

  awareness.setLocalStateField('user', {
    name: `Client ${awareness.clientID}`,
    color: getRandomColor()
  });

  const MY_CID = awareness.clientID;
  console.log('My client id', MY_CID);
  console.log('Client local state', awareness.getLocalState());

  // MARK: cursors
  // Track cursor movements
  const UPDATES_PER_SEC = 0.5;
  let currently_waiting = false;
  document.body.addEventListener('mousemove', (e) => {
    if (!currently_waiting) {
      currently_waiting = true; // lock updates
      const cursorPosition = {
        x: e.clientX,
        y: e.clientY
      };

      // Update cursor_moved object for some client 
      awareness.setLocalStateField('cursor_moved', {
        x: cursorPosition.x,
        y: cursorPosition.y,
        timestamp: Date.now()
      });

      setTimeout(() => {
        currently_waiting = false;
      }, 1000 / UPDATES_PER_SEC);
    }
  });

  awareness.on('update', changes => {
    // From testing: added occurs when a new client joins the signaling server
    // updated occurs when some update to a state happens (like the trigger in
    // our mousedown event. added, updated, removed are all arrays
    const { added, updated, removed } = changes;
    const states = awareness.getStates();

    updated.forEach((clientID) => {
      const fired_user_state = states.get(clientID); // The user that fired the updated event
      const updated_cursor = states.get(clientID).cursor_moved;
      if (fired_user_state.user.name && (cursor_map.get(fired_user_state.user.name) !== updated_cursor)) {
        cursor_map.set(fired_user_state.user.name, updated_cursor);
        console.log('Cursor_map is ', cursor_map);
      }
      if (clientID !== MY_CID && updated_cursor) {
        setCoordinates({x: updated_cursor.x, y: updated_cursor.y});
      }
    });
  });
}

// MARK: helper func
function getRandomColor() {
  // Returns a string representing the hex of a random color
  let hex = '#';
  const potential_chars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];
  for (let i = 0; i < 6; i++) {
    hex += potential_chars[Math.floor(Math.random() * potential_chars.length)];
  }
  return hex;
}

export default setupAwareness;