import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { zoomByDelta } from 'ol/interaction/Interaction';

function setupAwareness(cursor_provider, setCoordinates) {

  let cursor_map = new Map(); // stores cursor positions for different clients on same webrtc conn

  const awareness = cursor_provider.awareness;
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
  const UPDATES_PER_SEC = 1;
  let currently_waiting = false;

  function updateMapCoords(coords) {
    awareness.setLocalStateField('cursor_moved', {
      x: coords?.x,
      y: coords?.y,
      timestamp: Date.now()
    });
  }
  cursor_provider.updateMapCoords = updateMapCoords;

  awareness.on('change', changes => {
    // From testing: added occurs when a new client joins the signaling server
    // updated occurs when some update to a state happens (like the trigger in
    // our mousedown event. added, updated, removed are all arrays
    const { added, updated, removed } = changes;
    const states = awareness.getStates();

    updated.forEach((clientID) => {
      if(clientID === MY_CID) return; // skip self updates
      const state = states.get(clientID);
      const cursor = state.cursor_moved;
      if(cursor) {
        setCoordinates({
          x: state.cursor.x,
          y: state.cursor.y,
          clientID: clientID
        })
      }
    });
  });
  window.addEventListener('mousemove', (e) => {
    awareness.setLocalStateField('cursor', { x: e.clientX, y: e.clientY });
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