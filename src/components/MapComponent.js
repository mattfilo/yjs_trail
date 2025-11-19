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
import GeoJSON       from 'ol/format/GeoJSON';

function MapComponent() {
    const mapRef = useRef();
    const mapInstance = useRef(null); // To store the OpenLayers map instance
    const [drawing, setDrawing] = useState(false);
    const geojsonData = new GeoJSON();

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
    ReadFromGeoJSON(mapInstance.current);
    // Cleanup function: Destroy the map when the component unmounts
    return () => {
        if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
        }
    };
    }, []); // Empty dependency array ensures it runs once on mount

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <button onClick={() => addDrawInteraction(mapInstance.current, geojsonData)} style={{ position: 'absolute', zIndex: 1, top: 10, left: 10 }}>
                {'Start Drawing'}
            </button>
        <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
        </div>
    );
}

function addDrawInteraction(map, geojsonData) {
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
    map.addInteraction(drawInteraction);
    drawInteraction.on('drawend', function (event) {
        drawInteraction.setActive(false);
        const hello = geojsonData.writeFeatureObject(event.feature);
        // writeToGeoJSON(hello);
        console.log('Polygon drawn:', event.feature.getGeometry().getCoordinates());
    });
}

function ReadFromGeoJSON(map) {
    // console.log(geojsondata);
    fetch('/data.geojson')
        .then(response => response.json())
        .then(geojson => {
            const vectorSource = new VectorSource({
                features: (new GeoJSON()).readFeatures(geojson),
            });

            const vectorLayer = new VectorLayer({ source: vectorSource });
            map.addLayer(vectorLayer);
        })
    .catch((error) => {
        console.error('Error loading GeoJSON:', error);
    });
}

// function writeToGeoJSON(geojsonData) { # Crap code, downloads after every draw
//     const blob = new Blob([JSON.stringify(geojsonData)], { type: 'application/vnd.geo+json' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'data.geojson';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// }

export default MapComponent;