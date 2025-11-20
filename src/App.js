import MapComponent from './components/MapComponent';
import './App.css';
import { useState, useRef, useEffect } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import Cursor from './components/Cursor';

let cursor_map = new Map(); // stores cursor positions for different clients on same webrtc conn

function App() {
  // MARK: init yjs stuff
  const [loading, setLoading] = useState(false);
  const docRef = useRef(null);
  const providerRef = useRef(null);

  const ROOM_NAME = 'ol-room';

  // Create Y.doc and provider ONCE
  useEffect(() => {
    const ydoc = new Y.Doc();
    // Don't forget to start the signaling server if one is not already running:
    // (run) PORT=4444 node ./node_modules/y-webrtc/bin/server.js

    // If a signaling server is running on a different machine make sure that
    // the machine's local ip address is correct in the signaling options below
    const provider = new WebrtcProvider(ROOM_NAME, ydoc, { signaling: ['ws://192.168.1.63:4444'] });

    docRef.current = ydoc;
    providerRef.current = provider;

    setLoading(true);
    console.log('ydoc is: ', docRef.current);
    console.log('provider is: ', providerRef.current);

    return () => {
      // Cleanup on unmount
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  if (!loading) return <div>Loading...</div>;

   // MARK: awareness
  // Testing out awareness
  const awareness = providerRef.current.awareness;
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

  awareness.on('change', changes => {
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
    });
  });

  const coordinates = {
    x: 250,
    y: 500
  };

  return (
    <div className="App">
      Yjs OpenLayers Trial
      <Cursor coordinates={coordinates} />
      <MapComponent ydoc={docRef.current} provider={providerRef.current} />
    </div>
  );
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

export default App;
