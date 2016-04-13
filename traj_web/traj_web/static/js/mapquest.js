/* Project specific Javascript goes here. */
var mapLayer = MQ.mapLayer(),
    map;

map = L.map('shanghaimap', {
    layers: mapLayer,
    center: [40.731701, -73.993411],
    zoom: 12
});