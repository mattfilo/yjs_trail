import MapComponent from './components/MapComponent';
import './App.css';
import { useState, useRef, useEffect } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import Cursor from './components/Cursor';
import setupAwareness from './components/Awareness';


function App() {
  // MARK: init yjs stuff
  const [loading, setLoading] = useState(false);
  const docRef = useRef(null);
  const providerRef = useRef(null);
  const [coordinates, setCoordinates] = useState({x: 250, y:250});

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

    // setupAwareness(providerRef.current, setCoordinates);


    return () => {
      // Cleanup on unmount
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  if (!loading) return <div>Loading...</div>;

  return (
    <div className="App">
      Yjs OpenLayers Trial
      {/* <Cursor coordinates={coordinates} /> */}
      <MapComponent ydoc={docRef.current} provider={providerRef.current} />
    </div>
  );
}



export default App;
