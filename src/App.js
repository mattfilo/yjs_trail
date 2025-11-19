import MapComponent from './components/MapComponent';
import './App.css';
import { useRef } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

function App() {
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
    const provider = new WebrtcProvider(ROOM_NAME, docRef.current, { signaling: ['ws://192.168.1.62:4444', 'ws://localhost:4444'] });
    providerRef.current = provider;
  }
  
  console.log('ydoc is: ', docRef.current);
  console.log('provider is: ', providerRef.current);

  return (
    <div className="App">
      Yjs OpenLayers Trial
      <MapComponent ydoc={docRef.current} provider={providerRef.current} />
    </div>
  );
}

export default App;
