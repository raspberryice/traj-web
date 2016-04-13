/* Project specific Javascript goes here. */
var mymap = L.map('shanghaimap').setView([51.505, -0.09], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);
var marker = L.marker([51.5, -0.09]).addTo(mymap);