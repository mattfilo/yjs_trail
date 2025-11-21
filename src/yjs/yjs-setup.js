import { useEffect } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

export function SetupYjs({ docRef, providerRef, onReady }) {
  const ROOM_NAME = 'ol-room';

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider(ROOM_NAME, ydoc, {
      signaling: ['ws://localhost:5555'],
    });

    docRef.current = ydoc;
    providerRef.current = provider;

    console.log('ydoc is: ', docRef.current);
    console.log('provider is: ', providerRef.current);

    if (onReady) onReady(); // Notify App that Yjs is ready

    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, []);

  return null; // nothing to render
}