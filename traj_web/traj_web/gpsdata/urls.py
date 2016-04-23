from django.conf.urls import url, include
from . import views

urlpatterns = [
    url(
    	regex=r'^$',
    	view = views.MapView.as_view(),
    	name = 'map'
    ),
    url(
    	regex=r'^search/id$',
    	view = views.ExactSearchView.as_view(),
    	name = "search_by_id"
    	),
    url(
        regex= r'^search/range$',
        view = views.RangeSearchView.as_view(),
        name = "search_by_range"
        ),
]