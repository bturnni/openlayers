import Feature from '../src/ol/Feature.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import WebGLVectorLayer from '../src/ol/layer/WebGLVector.js';
import Map from '../src/ol/Map.js';
import Cluster from '../src/ol/source/Cluster.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';
import View from '../src/ol/View.js';

const source = new VectorSource({
  url: 'data/geojson/world-cities.geojson',
  format: new GeoJSON(),
});

// The cluster source emits one Point feature per cluster. The flat WebGL style
// cannot read the `features` array length directly, so a custom `createCluster`
// stores a numeric `count` (to drive size/color expressions) and a `label`
// string (the cluster count, or the single city name when not clustered).
const clusterSource = new Cluster({
  distance: 40,
  source: source,
  createCluster: function (point, features) {
    const count = features.length;
    const label =
      count > 1 ? count.toString() : features[0].get('accentcity') || '';
    return new Feature({
      geometry: point,
      count: count,
      label: label,
    });
  },
});

// A single WebGLVectorLayer draws the cluster circle and its label: both the
// `circle-*` and `text-*` properties are driven by the `count`/`label` props
// using Mapbox-style expressions in one flat style.
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new WebGLVectorLayer({
      source: clusterSource,
      style: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'count'],
          1,
          7,
          50,
          16,
          500,
          26,
        ],
        'circle-fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'count'],
          1,
          [51, 153, 204, 0.85],
          10,
          [255, 204, 51, 0.85],
          100,
          [204, 51, 51, 0.85],
        ],
        'circle-stroke-color': [255, 255, 255, 0.9],
        'circle-stroke-width': 1.5,
        'text-value': ['get', 'label'],
        'text-font': 'bold 13px sans-serif',
        'text-fill-color': '#222222',
        'text-stroke-color': 'rgba(255, 255, 255, 0.85)',
        'text-stroke-width': 2,
      },
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
