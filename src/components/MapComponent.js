import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import GeoJSON from 'ol/format/GeoJSON';
import { v4 as uuid } from 'uuid';
import { fromLonLat } from 'ol/proj';

function MapComponent({ ydoc, onMapMouseMove, onMapReady }) {
  const mapRef = useRef();
  const mapInstance = useRef(null);

  const geojsonData = new GeoJSON();
  const yGeoJsonMap = ydoc.getMap('geojsonMap');

  const drawSource = new VectorSource();
  const drawLayer = new VectorLayer({ source: drawSource });

  useEffect(() => {
    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        drawLayer,
      ],
      view: new View({
        center: fromLonLat([-98.5795, 39.8283]),
        zoom: 5.1,
      }),
    });

    // Notify App.js that the map is ready
    onMapReady?.(mapInstance.current);

    // Pointer move — send map coordinates
    mapInstance.current.on('pointermove', (e) => {
      onMapMouseMove?.({ mapX: e.coordinate[0], mapY: e.coordinate[1] });
    });

    return () => {
      mapInstance.current?.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    observeEvents(yGeoJsonMap, drawSource, geojsonData);
  }, [yGeoJsonMap]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <button onClick={() => addDrawInteraction(mapInstance.current, geojsonData, yGeoJsonMap, drawSource)} style={{ position: 'absolute', zIndex: 1, top: 10, left: 10 }}>
        Start Drawing
      </button>
      <button onClick={() => addModifyInteraction(mapInstance.current, geojsonData, yGeoJsonMap, drawSource)} style={{ position: 'absolute', zIndex: 1, top: 30, left: 10 }}>
        Start Modifying
      </button>
      <button onClick={() => { drawLayer.getSource().clear(); yGeoJsonMap.clear(); }} style={{ position: 'absolute', zIndex: 1, top: 50, left: 10 }}>
        Clear Polygons
      </button>
    </div>
  );
}

function addDrawInteraction(map, geojsonData, ydoc, drawSource) {
  const draw = new Draw({ source: drawSource, type: 'Polygon' });
  map.addInteraction(draw);
  draw.on('drawend', (e) => {
    const feature = e.feature;
    const id = uuid();
    feature.setId(id);
    const geojson = geojsonData.writeFeatureObject(feature);
    ydoc.set(id, geojson);
    draw.setActive(false);
  });
}

function addModifyInteraction(map, geojsonData, ydoc, drawSource) {
  const modify = new Modify({ source: drawSource });
  map.addInteraction(modify);
  modify.on('modifyend', (e) => {
    e.features.getArray().forEach((feature) => {
      const id = feature.getId();
      const geojson = geojsonData.writeFeatureObject(feature);
      ydoc.set(id, geojson);
    });
  });
}

function observeEvents(ydoc, drawSource, geojsonData) {
  ydoc.observe((event) => {
    event.changes.keys.forEach((change, key) => {
      if (change.action === 'add' || change.action === 'update') {
        const geojson = ydoc.get(key);
        if (!drawSource.getFeatureById(key)) {
          const feature = geojsonData.readFeature(geojson);
          feature.setId(key);
          drawSource.addFeature(feature);
        } else {
          const geom = geojsonData.readGeometry(geojson.geometry);
          drawSource.getFeatureById(key).setGeometry(geom);
        }
      }
      if (change.action === 'delete') {
        const f = drawSource.getFeatureById(key);
        if (f) drawSource.removeFeature(f);
      }
    });
  });
}

export default MapComponent;
