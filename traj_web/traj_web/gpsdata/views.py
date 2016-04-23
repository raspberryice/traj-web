from django.shortcuts import render
from django.core.urlresolvers import reverse
from django.views.generic import View 
from django.http import HttpResponse
from django.core.serializers import serialize
from django.contrib.gis.db.models.functions import AsGeoJSON
import json


from .models import TrajPoint,TrajLine 

# Create your views here.

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
		traj = self.q.get(traj_id = id)
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
	def post(self,request):
		geo = request.POST['geo']
		traj = self.q.filter(geom__intersects = geo)
		response = {}
		response['lineset'] = serialize('geojson',traj)
		return HttpResponse(
			json.dumps(response),
			content_type="application/json",
			)



