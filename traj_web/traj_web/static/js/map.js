//add map layer
var mymap = L.map('shanghaimap').setView([121.6, 31.2], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);
//add marker
var marker = L.marker([121.6, 31.2]).addTo(mymap);

//listen to click events 
mymap.on('click',function(e){
	$('#point-latitude').val(e.latlng.lat);
	$('#point-longitude').val(e.latlng.lng);

});


//search by id 
function search_by_id(search_id){	
	$.ajax({
		url:"search/id",
		type:"GET",
		data:{
			"csrfmiddlewaretoken":$("input[name=csrfmiddlewaretoken]").val(),
			"search_id":search_id,
		},
		success:function(json){
			console.log(json);
			var line = json.line;
			// add_traj(json.line);
			//draw_line(json.line);
			//draw_points(json.points);
		},
		error:function(xhr,errmsg,err){
			console.log(xhr.status + ': '+xhr.responseText);
		},
	});
};

$('#id-search-form').on('submit',function(e){
	e.preventDefault();
	if ($('#search-id').val()==''){
		alert("Please enter an integer!")
	}
	else{
		var search_id = parseInt($('#search-id').val());
		search_by_id(search_id);
	}
});

function add_traj(geojson){
	L.geoJson(geojson,{

	}).addTo(mymap);

}