import MapComponent from './components/MapComponent';
import './App.css';
import { useRef } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

function App() {
  // MARK: init yjs stuff
  const docRef = useRef(null);
  const providerRef = useRef(null);

  const ROOM_NAME = 'ol-room';

  // Initialize ydoc and provider
  if (!docRef.current) {
    const ydoc = new Y.Doc();
    docRef.current = ydoc;
  }
  if (!providerRef.current) {
    // Don't forget to start the signaling server if one is not already running:
    // (run) PORT=4444 node ./node_modules/y-webrtc/bin/server.js

    // If a signaling server is running on a different machine make sure that
    // the machine's local ip address is correct in the signaling options below
    const provider = new WebrtcProvider(ROOM_NAME, docRef.current, { signaling: ['ws://192.168.1.62:4444'] });
    providerRef.current = provider;
  }

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
  document.body.addEventListener('mousemove', (e) => {
    const cursorPosition = {
      x: e.clientX,
      y: e.clientY
    };
    
    // Propogate event to other clients
    awareness.setLocalStateField('cursor_moved', {
      x: cursorPosition.x,
      y: cursorPosition.y,
      message: `Cursor moved (${cursorPosition.x}, ${cursorPosition.y})`,
      timestamp: Date.now()
    });
  });

  // console.log(`MY AWARENESS STATE ${awareness.getState(MY_CID)}`);

  awareness.on('change', changes => {
    // From testing: added occurs when a new client joins the signaling server
    // updated occurs when some update to a state happens (like the trigger in
    // our mousedown event
    const { added, updated, removed } = changes;
    const states = awareness.getStates();

    // MARK: Problem here
    // The issue here is that we are assuming an "updated" event was triggered
    // Even when it is not triggered we try to access an undefined user in a null state
    // [POTENTIAL FIX]: figure out how to "containerize" the code below
    // so it only works when updated is some "real value".
    // Problem with this: updated will be some value without being "real"
    const fired_user = states.get(updated).user; // The user that fired the updated event
    const updated_data = states.get(updated).cursor_moved;
    // MARK: Problem end

    states.forEach((state, clientID) => {
      console.log('state is: ', state);
      console.log('clientID for this state is: ', clientID);

      if (clientID !== updated) {
        const user = state.user; // {name: string, color: string}
        console.log(`[User] ${fired_user.name} moved their cursor.`)
      }
    });
  });

  return (
    <div className="App">
      Yjs OpenLayers Trial
      <MapComponent ydoc={docRef.current} provider={providerRef.current} />
    </div>
  );
}

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
