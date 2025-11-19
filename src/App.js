import MapComponent from './components/MapComponent';
import './App.css';
import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

function App() {
  const docRef = useRef(null);
  const providerRef = useRef(null);

  const ROOM_NAME = 'ol-room';

  if (!docRef.current) {
    const ydoc = new Y.Doc();
    docRef.current = ydoc;
  }
  if (!providerRef.current) {
    const provider = new WebrtcProvider(ROOM_NAME, docRef.current, { signaling: ['ws://localhost:4444'] });
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
