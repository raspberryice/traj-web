from django.contrib.gis import admin
from .models import TrajLine,TrajPoint

admin.site.register(TrajPoint, admin.GeoModelAdmin)
admin.site.register(TrajLine, admin.GeoModelAdmin)
