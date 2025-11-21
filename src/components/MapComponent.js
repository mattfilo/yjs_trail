import { useEffect, useRef } from 'react';
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
import Modify from 'ol/interaction/Modify';
import { YJSMapBindings } from '../yjs/map-binding';

function MapComponent(props) {
    const mapRef = useRef();
    const mapInstance = useRef(null); // To store the OpenLayers map instance

    const geojsonData = new GeoJSON();
    const yGeoJsonMap = props.ydoc.getMap('geojsonMap');

    const drawSource = new VectorSource();
    const drawLayer = new VectorLayer({
        source: drawSource
    });

    const { drawYJSFeature, modifyYJSFeature, yjsObserver } = YJSMapBindings({ydoc: yGeoJsonMap, drawSource, geojsonData});

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
        yjsObserver();
        console.log('Oberserver was called')
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
            <button onClick={() => addDrawInteraction(mapInstance.current, drawYJSFeature, drawSource)} style={{ position: 'absolute', zIndex: 1, top: 10, left: 10 }}>
                {'Start Drawing'}
            </button>
            <button onClick={() => addModifyInteraction(mapInstance.current, modifyYJSFeature, drawSource)} style={{ position: 'absolute', zIndex: 1, top: 30, left: 10 }}>
                {'Start Modifying'}
            </button>
            <button onClick={() => {drawLayer.getSource().clear(); yGeoJsonMap.clear();}} style={{ position: 'absolute', zIndex: 1, top: 50, left: 10 }}>
                {'Clear Polygons'}
            </button>
        </div>
    );
}

function addDrawInteraction(map, drawYJSFeature, drawSource) {
    const drawInteraction = new Draw({
        source: drawSource,
        type: 'Polygon',
        geometryFunction: null,
        freehand: false,
    });

    map.addInteraction(drawInteraction);

    drawInteraction.on('drawend', function (event) {
        drawYJSFeature(event);

        drawInteraction.setActive(false);
        console.log('Polygon drawn:', event.feature.getGeometry().getCoordinates());
    });
}

function addModifyInteraction(map, modifyYJSFeature, drawSource) {
    const modifyInteraction = new Modify({source: drawSource});

    map.addInteraction(modifyInteraction);
    
    modifyInteraction.on('modifyend', function (event) { // modifications only get listened to on other client after clicking start drawing button then refreshing
        modifyYJSFeature(event);
        modifyInteraction.setActive(false);
        console.log('Polygon modified:', event.features.getArray().map(feature => feature.getGeometry().getCoordinates()));

    });
}

export default MapComponent;