//jquery conflict
// jQuery.noConflict();

//add map layer
var mymap = L.map('shanghaimap').setView([31.22,121.49], 13);
var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
osm.addTo(mymap);
// var timelineControl = L.timelineSliderControl();
var timelineControl = L.timelineSliderControl({
	formatOutput: function(date){
		try{
		return new Date(date).toISOString();
	}
	catch (ex) {
		console.error("Error converting date",ex.message);
		return '';
	}

	}
});
timelineControl.addTo(mymap);
var currentTimeline;

//selection
var selection = [];

function add_geojson_crop(data){
	var layer = L.geoJson(data).addTo(mymap);
	//crop map
	mymap.fitBounds(layer.getBounds()); 
}
//-----------id search-----------------------

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
			var line = JSON.parse(json.line);//as an object
			add_geojson_crop(line);
		},
		error:function(xhr,errmsg,err){
			console.log(xhr.status + ': '+xhr.responseText);
		},
	});
};

$('#id-search-form').on('submit',function(e){
	e.preventDefault();
	if ($('#search-id').val()==''){
		alert("Please enter an integer!");
	}
	else{
		var search_id = parseInt($('#search-id').val());
		search_by_id(search_id);
	}
});




//--------------------range search----------------------
//listen to click events 
var flag=false;
var center;
var queryjson;
var range_circle;
function select_center(e){
	if(range_circle){
		mymap.removeLayer(range_circle);
	}
	$('#point-latitude').val(e.latlng.lat);
	$('#point-longitude').val(e.latlng.lng);
	$('#radius').val('');
	center = e.latlng;
	return center;
}
function select_radius(e,center){
	var dis = e.latlng.distanceTo(center);
	range_circle= L.circle(center,dis).addTo(mymap);
	$('#radius').val(dis);
	queryjson = range_circle.toGeoJSON().geometry;
	console.log(queryjson);
	$('#geo').val(range_circle.toGeoJSON());
}

//flag,center are globally overwritten 

mymap.on('click',function(e){
	if (!flag){
		center = select_center(e);
		flag= true;
		return;
	}
	else{
		select_radius(e,center);
		flag = false;
		return;
	}	
});


function search_by_range(geojson){	
	$.ajax({
		url:"search/range",
		type:"GET",
		data:{
			"csrfmiddlewaretoken":$("input[name=csrfmiddlewaretoken]").val(),
			"geo":JSON.stringify(geojson),
			"dis": $('#radius').val(),
			"has_time":$('#time-toggle').is(':checked'),
			"start_time":$('#start-time').val(),
			"end_time":$('#end-time').val(),
		},
		success:function(json){
			$('#range-results').text(json.count + " results found.");
			if (json.count>0){
				var lineset = JSON.parse(json.lineset);//as an object
				console.log(lineset);
				L.geoJson(lineset,{
					onEachFeature:function(feature,layer){
						 if (feature.properties && feature.properties.traj_id) {
						        layer.bindPopup(feature.properties.traj_id.toString());
						    }
					}
				}).addTo(mymap);

			}
			
		},
		error:function(xhr,errmsg,err){
			console.log(xhr.status + ': '+xhr.responseText);
		},
	});
};


$('#point-search-form').on('submit',function(e){
	e.preventDefault();
	// var geo = $('#geo').val();
	search_by_range(queryjson);
});

$('#time-toggle').on('change',function(e){
	if(this.checked){
		$('#time-filter').show();
		//show time selection 
		return;
	}
	else{
		$('#time-filter').hide();
	}
})

//--------------------play route --------------------
//custom circle marker 
var geojsonMarkerOptions = {
    radius: 3,
    fillColor: "#AF002A",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

function create_timeline(data){
	var timeline = L.timeline(data,{
				getInterval:function(feature){
					var create_time = new Date(feature.properties.create_time);
					return {
						start: create_time.getTime(),
						end: new Date(create_time.getTime() + 60000),//last for 1 minute 
					}
				},
				pointToLayer:function(feature,latlng){
					return L.circleMarker(latlng,geojsonMarkerOptions);
				}
			});
	
			
	timeline.addTo(mymap);
	return timeline;
	// mymap.fitBounds(timeline.getBounds()); 
}

//load points 
function load_points(play_id){
	$.ajax({
		url:"play/load",
		type:"GET",
		data:{
			"play_id":play_id,
		},
		success:function(json){
			var pointset = JSON.parse(json.points);
			console.log(pointset);
			//remove old timeline and add new one
			// timelineControl.removeTimelines(currentTimeline);
			currentTimeline = create_timeline(pointset);
			timelineControl.addTimelines(currentTimeline);
			//TODO:remove timelines separately
		},
		error:function(xhr,errmsg,err){
			console.log(xhr.status + ': '+xhr.responseText);
		},
	});
};

//search for a list of trajectories 

// $('#play-search-form').on('submit',function(e){
// 	e.preventDefault();
// 	if ($('#play-id').val() == ''){
// 		alert("Please enter a valid integer.");
// 	}
// 	else{
// 		load_points(parseInt($('#play-id').val()));
//		$('#play-load-status').text('Points loaded.');
// 	}
// });
 
$('#add-selection').on('click',function(e){
	var id = $('#selection-id').val();
	if (id==''){
		alert('Please enter a valid integer.');
	}
	else{
		var new_item = $("<li class='list-group-item'><span>"
		    + id
			+ "</span><a class='glyphicon glyphicon-remove pull-right delete-selection' aria-hidden='true'></a></li>");

		$('#selection-list').append(new_item);
		new_item.find('.delete-selection').on('click',delete_selection);
		selection.push(parseInt(id));
		console.log(selection);
	}
});

function delete_selection(e){
	var item = $(this).parent();
	var id = item.find('span').text();
	selection.splice(selection.indexOf(parseInt(id)),1);
	console.log(selection);
	item.remove();
}

$('.delete-selection').on('click',delete_selection);

$('#load-button').on('click',function(e){
	for (i=0;i<selection.length;i++){
		load_points(selection[i]);
		$('#play-load-status').text('Traj' + selection[i] + 'points loaded.');

	}
});
