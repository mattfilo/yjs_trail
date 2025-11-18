import React, { useEffect, useRef, useState } from 'react';
import 'ol';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css'; // Import OpenLayers CSS for styling
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer   from 'ol/layer/Vector';
import Draw          from 'ol/interaction/Draw';

function MapComponent() {
    const mapRef = useRef();
    const mapInstance = useRef(null); // To store the OpenLayers map instance
    const [drawing, setDrawing] = useState(false);

    useEffect(() => {
    mapInstance.current = new Map({
        target: mapRef.current, // Target the div element
        layers: [
        new TileLayer({
            source: new OSM(), // Use OpenStreetMap as a base layer
        }),
        ],
        view: new View({
        center: fromLonLat([-98.5795, 39.8283]), // Initial center coordinates (e.g., longitude, latitude)
        zoom: 5.1, // Initial zoom level
        }),
    });

    // Cleanup function: Destroy the map when the component unmounts
    return () => {
        if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
        }
    };
    }, []); // Empty dependency array ensures it runs once on mount

    useEffect(() => {
        if (mapInstance.current) {
            addDrawInteraction(mapInstance.current, drawing);
        }
    }, [drawing]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <button onClick={() => setDrawing(!drawing)} style={{ position: 'absolute', zIndex: 1, top: 10, left: 10 }}>
                {drawing ? 'Stop Drawing' : 'Start Drawing'}
            </button>
        <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
        </div>
    );
}

function addDrawInteraction(map, drawing) {
    const drawSource = new VectorSource();
    const drawLayer = new VectorLayer({
        source: drawSource
    })
    map.addLayer(drawLayer);

    const drawInteraction = new Draw({
        source: drawSource,
        type: 'Polygon', // Change to desired geometry type
        geometryFunction: null,
        freehand: false,
    });
    if (drawing) {
        map.addInteraction(drawInteraction);
    } else {
        map.removeInteraction(drawInteraction);
    };
}

export default MapComponent;