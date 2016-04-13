from django.shortcuts import render
from django.core.urlresolvers import reverse
from django.views.generic import View 

from .models import TrajPoint,TrajLine 

# Create your views here.

class MapView(View):
	model = TrajPoint

	def get(self,request):
		return render(request,"gpsdata\map.html",{})


