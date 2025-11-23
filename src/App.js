import MapComponent from './components/MapComponent';
import './App.css';
import { useState, useRef, useEffect } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import Cursor from './components/Cursor';
import setupAwareness from './components/Awareness';

function App() {
  const [loading, setLoading] = useState(false);
  const docRef = useRef(null);
  const providerRef = useRef(null);
  const cursorDocRef = useRef(null);
  const cursorProviderRef = useRef(null);

  const [coordinates, setCoordinates] = useState({ x: 250, y: 250 });
  const [mapInstance, setMapInstance] = useState(null);

  const MAIN_ROOM_NAME = 'ol-room';

  useEffect(() => {
    // Main Yjs doc
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(MAIN_ROOM_NAME, ydoc, { signaling: ['ws://localhost:5555'] });

    docRef.current = ydoc;
    providerRef.current = provider;

    // Cursor Yjs doc
    const cursorYdoc = new Y.Doc();
    const cursorProvider = new WebrtcProvider('cursor-room', cursorYdoc, { signaling: ['ws://localhost:7777'] });

    cursorDocRef.current = cursorYdoc;
    cursorProviderRef.current = cursorProvider;

    setLoading(true);

    return () => {
      provider.destroy();
      ydoc.destroy();
      cursorProvider.destroy();
      cursorYdoc.destroy();
    };
  }, []);

  // Initialize awareness once map is ready
  useEffect(() => {
    if (mapInstance && cursorProviderRef.current) {
      setupAwareness(cursorProviderRef.current, setCoordinates, mapInstance);
    }
  }, [mapInstance]);

  // Receive pointer move from MapComponent and send to Awareness
  const handleMapMove = (coords) => {
    if (cursorProviderRef.current?.updateMapCoords) {
      cursorProviderRef.current.updateMapCoords(coords);
    }
  };

  if (!loading) return <div>Loading...</div>;

  return (
    <div className="App">
      Yjs OpenLayers Trial
      <Cursor coordinates={coordinates} />
      <MapComponent
        ydoc={docRef.current}
        provider={providerRef.current}
        onMapMouseMove={handleMapMove}
        onMapReady={setMapInstance}
      />
    </div>
  );
}

export default App;
