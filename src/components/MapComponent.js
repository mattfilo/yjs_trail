import React, { useEffect, useRef } from 'react';
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
import { v4 as uuid } from 'uuid';
import Modify from 'ol/interaction/Modify';

function MapComponent(props) {
    const mapRef = useRef();
    const mapInstance = useRef(null); // To store the OpenLayers map instance

    const geojsonData = new GeoJSON();
    const yGeoJsonMap = props.ydoc.getMap('geojsonMap');

    const drawSource = new VectorSource();
    const drawLayer = new VectorLayer({
        source: drawSource
    });


    useEffect(() => {
    mapInstance.current = new Map({
        target: mapRef.current, // Target the div element
        layers: [
            new TileLayer( {source: new OSM()} ), // Use OpenStreetMap as a base layer
            drawLayer,
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
        observeEvents(yGeoJsonMap, drawSource, geojsonData);
        console.log('Oberserver was called')
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
            <button onClick={() => addDrawInteraction(mapInstance.current, geojsonData, yGeoJsonMap, drawSource)} style={{ position: 'absolute', zIndex: 1, top: 10, left: 10 }}>
                {'Start Drawing'}
            </button>
            <button onClick={() => addModifyInteraction(mapInstance.current, geojsonData, yGeoJsonMap, drawSource)} style={{ position: 'absolute', zIndex: 1, top: 30, left: 10 }}>
                {'Start Modifying'}
            </button>
            <button onClick={() => {drawLayer.getSource().clear(); yGeoJsonMap.clear();}} style={{ position: 'absolute', zIndex: 1, top: 50, left: 10 }}>
                {'Clear Polygons'}
            </button>
        </div>
    );
}

function addDrawInteraction(map, geojsonData, ydoc, drawSource) {
    const drawInteraction = new Draw({
        source: drawSource,
        type: 'Polygon',
        geometryFunction: null,
        freehand: false,
    });

    map.addInteraction(drawInteraction);

    drawInteraction.on('drawend', function (event) {
        const feature = event.feature;
        const id = uuid()
        feature.setId(id);
        const geojsonFeature = geojsonData.writeFeatureObject(feature);
        ydoc.set(id, geojsonFeature); // This (should) trigger the observer function

        drawInteraction.setActive(false);
        console.log('Polygon drawn:', event.feature.getGeometry().getCoordinates());
    });

    
}

function addModifyInteraction(map, geojsonData, ydoc, drawSource) {
    const modifyInteraction = new Modify({source: drawSource});

    map.addInteraction(modifyInteraction);
    
    modifyInteraction.on('modifyend', function (event) { // modifications only get listened to on other client after clicking start drawing button then refreshing
        const modifiedFeatures = event.features.getArray();
        modifiedFeatures.forEach(function(feature) {
            const id = feature.getId();
            const geojsonFeature = geojsonData.writeFeatureObject(feature);
            ydoc.set(id, geojsonFeature); // Update the feature in Yjs

            modifyInteraction.setActive(false);
            console.log('Polygon modified:', feature.getGeometry().getCoordinates());
        });
    });
}


function observeEvents(ydoc, drawSource, geojsonData) {
    ydoc.observe((event) => {
    event.changes.keys.forEach((change, key) => {
        if (change.action === "add" || change.action === "update") {
        const geojson = ydoc.get(key);

        // Prevent duplicates if we already added this feature
        if (!drawSource.getFeatureById(key)) {
            const feature = geojsonData.readFeature(geojson);
            feature.setId(key);
            drawSource.addFeature(feature);
            console.log("Added/Updated feature with id: ", key);
        }
        else if (change.action === "update" && drawSource.getFeatureById(key)) {
            const newGeom = geojsonData.readGeometry(geojson.geometry);
            drawSource.getFeatureById(key).setGeometry(newGeom);
            console.log("Updated feature with id: ", key);
        }
    }

        if (change.action === "delete") {
            const feature = drawSource.getFeatureById(key);
            if (feature) {
                drawSource.removeFeature(feature);
                console.log("Deleted feature with id: ", key);
            }}
    })
    });
}

export default MapComponent;