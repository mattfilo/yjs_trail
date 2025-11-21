import MapComponent from './components/MapComponent';
import './App.css';
import { useState, useRef, useEffect } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { SetupYjs } from './yjs/yjs-setup';

function App() {
  const [loading, setLoading] = useState(false);
  const docRef = useRef(null);
  const providerRef = useRef(null);

  return (
    <div className="App">
      Yjs OpenLayers Trial
      <SetupYjs
        docRef={docRef}
        providerRef={providerRef}
        onReady={() => setLoading(true)}
      />
      {loading && (
        <MapComponent ydoc={docRef.current} provider={providerRef.current} />
      )}
      {loading && <div>Loading...</div>}
    </div>
  );
}

export default App;
