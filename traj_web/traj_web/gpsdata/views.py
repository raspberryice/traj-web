from django.shortcuts import render
from django.core.urlresolvers import reverse
from django.views.generic import View 
from django.http import HttpResponse
from django.core.serializers import serialize
from django.contrib.gis.db.models.functions import AsGeoJSON
from django.contrib.gis.measure import Distance,D
from django.db.models import Q
import json
from datetime import datetime 


from .models import TrajPoint,TrajLine 

class MapView(View):
	model = TrajPoint

	def get(self,request):
		return render(request,"gpsdata\map.html",{})


class TrajSearchView(View):
	model = TrajLine 
	q = TrajLine.objects.all()


class ExactSearchView(TrajSearchView):
	
	def get(self,request):
		id = request.GET["search_id"]
		traj = TrajLine.objects.filter(traj_id = id)
		points = TrajPoint.objects.filter(traj_id =id)
		response = {}
		response['line'] = serialize('geojson',traj)
		#TODO serialize time 
		# response['start_time'] = traj.start_time
		# response['end_time'] = traj.end_time 
		response['points'] = serialize('geojson',points)
		return HttpResponse(
			json.dumps(response),
			content_type="application/json",
			)


class RangeSearchView(TrajSearchView):
	def get(self,request):
	
		geo = request.GET['geo']
		dis = request.GET['dis']

		traj = self.q.filter(geom__distance_lte = (geo,D(m=dis)))
		count = traj.count()
		response = {}
		if (request.GET['has_time']=='true'):
			timeStartStr = request.GET['start_time']
			timeStart = datetime.strptime(timeStartStr,'%H:%M')
			timeEndStr =request.GET['end_time'] 
			timeEnd = datetime.strptime(timeEndStr,'%H:%M')
			traj = traj.filter(Q(start_time__range=(timeStart,timeEnd))|Q(end_time__range=(timeStart,timeEnd)))
			count = traj.count()
		
		response['lineset'] = serialize('geojson',traj)
		response['count'] = count 
		return HttpResponse(
			json.dumps(response),
			content_type="application/json",
			)



class LoadPointView(View):
	model=TrajPoint

	def get(self,request):
		id = request.GET['play_id']
		points = TrajPoint.objects.filter(traj_id=id).order_by('create_time')
		traj = TrajLine.objects.get(traj_id=id)
		response = {}
		response['points'] = serialize('geojson',points)
		response['start'] = datetime.strftime(traj.start_time,"%x %X")
		response['end'] = datetime.strftime(traj.end_time,"%x %X")
		return HttpResponse(
			json.dumps(response),
			content_type="application/json",
			)
 




