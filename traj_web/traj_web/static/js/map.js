//add map layer
var mymap = L.map('shanghaimap').setView([31.22,121.49], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(mymap);

//selection
var selection = [];

function add_geojson(data){
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
			add_geojson(line);
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
function select_center(e){
	$('#point-latitude').val(e.latlng.lat);
	$('#point-longitude').val(e.latlng.lng);
	$('#radius').val('');
	center = e.latlng;
	return center;
}
function select_radius(e,center){
	var dis = e.latlng.distanceTo(center);
	var c= L.circle(center,dis).addTo(mymap);
	$('#radius').val(dis);
	queryjson = c.toGeoJSON()
	console.log(queryjson);
	$('#geo').val(c.toGeoJSON());
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
		},
		success:function(json){

			var lineset = JSON.parse(json.lineset);//as an object
			console.log(lineset);
			console.log(json.count);
			add_geojson(lineset);
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
