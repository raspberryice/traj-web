from django.conf.urls import url, include
from . import views

urlpatterns = [
    url(
    	regex=r'^$',
    	view = views.MapView.as_view(),
    	name = 'map'
    ),
]