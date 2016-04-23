//jquery conflict
// jQuery.noConflict();

//add map layer
var mymap = L.map('shanghaimap').setView([31.22,121.49], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);

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
			//what about points?
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
				L.geoJson(lineset).addTo(mymap);
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