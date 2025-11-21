import React, { useEffect, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import GeoJSON       from 'ol/format/GeoJSON';
import Modify from 'ol/interaction/Modify';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer   from 'ol/layer/Vector';

export function YJSMapBindings({ydoc, drawSource, geojsonData}) {

function drawYJSFeature(event) {
    const feature = event.feature;
    const id = uuid();
    feature.setId(id);
    const geojsonFeature = geojsonData.writeFeatureObject(feature);
    ydoc.set(id, geojsonFeature);
}

function modifyYJSFeature(event) {
    const modifiedFeatures = event.features.getArray();
    modifiedFeatures.forEach(function(feature) {
        const id = feature.getId();
        const geojsonFeature = geojsonData.writeFeatureObject(feature);
        ydoc.set(id, geojsonFeature);
    });
}

function yjsObserver() {
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
    return { drawYJSFeature, modifyYJSFeature, yjsObserver };
}