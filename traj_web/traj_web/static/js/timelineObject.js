function load_points(timelineLayer){
	$.ajax({
		url:"play/load",
		type:"GET",
		data:{
			"play_id":timelineLayer.traj_id,
		},
		success:function(json){
			var pointset = JSON.parse(json.points);
			timelineLayer.timeline = create_timeline(pointset);
			timelineControl.addTimelines(timelineLayer.timeline);
		},
		error:function(xhr,errmsg,err){
			console.log(xhr.status + ': '+xhr.responseText);
		},
	});
};



//constructor 
//define properties here
var TimelineLayer = function(id){
	this.traj_id = id;
	this.status = 0;
	//unselected 
	//selected
	//loaded
	this.timeline = undefined;//leaflet L.timeline object
	this.listitem = $("<li class='list-group-item'><span>"
		    + this.traj_id
			+ "</span><a class='glyphicon glyphicon-remove pull-right delete-selection' aria-hidden='true'></a></li>");//DOM object
};

TimelineLayer.prototype.select = function(){
	this.status =1;
	$('#selection-list').append(this.listitem);
	this.listitem.find('.delete-selection').on('click',delete_selection); 
};

TimelineLayer.prototype.remove = function(){
	this.status = 0;
	this.listitem.remove();//remove DOM object
	timelineControl.removeTimelines(this.timeline);//remove timeline 
};

TimelineLayer.prototype.load = function(){
	
	this.status =2;
	load_points(this);
	$('#play-load-status').text('Traj ' + selection[i] + ' points loaded.');
	//TODO:change the style of the DOM object
}
