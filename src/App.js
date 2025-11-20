import MapComponent from './components/MapComponent';
import './App.css';
import { useState, useRef, useEffect } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

function App() {
  const [loading, setLoading] = useState(false);
  const docRef = useRef(null);
  const providerRef = useRef(null);

  const ROOM_NAME = 'ol-room';

  useEffect(() => {
    // Create Y.doc and provider ONCE
    const ydoc = new Y.Doc();
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

  return (
    <div className="App">
      Yjs OpenLayers Trial
      <MapComponent ydoc={docRef.current} provider={providerRef.current} />
    </div>
  );
}

export default App;
