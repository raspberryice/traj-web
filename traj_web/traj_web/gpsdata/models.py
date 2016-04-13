from __future__ import unicode_literals

from django.contrib.gis.db import models

class TrajPoint(models.Model):
	obd_id = models.CharField(max_length=16)
	longitude = models.FloatField()
	latitude = models.FloatField()
	create_time = models.DateTimeField()
	traj_id = models.IntegerField()
	geom = models.PointField(srid=4326,null=True)

class TrajLine(models.Model):
	traj_id = models.IntegerField()
	obd_id = models.CharField(max_length=16)
	start_time = models.DateTimeField()
	end_time = models.DateTimeField()
	geom = models.LineStringField(srid=4326)

