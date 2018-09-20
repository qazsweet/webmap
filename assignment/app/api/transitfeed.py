# Retrieve vehicle locations via a GTFS 
import os, cgi
import urllib.request
import geojson
import psycopg2
from psycopg2.extras import RealDictCursor
from google.transit import gtfs_realtime_pb2
from pyproj import Proj, transform
from geojson import Feature, Point, FeatureCollection

def routesearch(route_id, routes):
    return [route for route in routes if route['route_id'] == int(route_id)]

print ("Content-type: application/json")
print ()

params = cgi.FieldStorage()
if (params.getvalue('bbox')):
    coords = params.getvalue('bbox').split(",") 
else:
    coords = [250000, 466000, 266000, 476000]
    
file = open(os.path.dirname(os.path.abspath(__file__)) + "\pg.credentials")
connection_string = file.readline() + file.readline()
pg = psycopg2.connect(connection_string)
query = pg.cursor(cursor_factory=RealDictCursor)
query.execute("""
    SELECT route_id, route_short_name AS short_name,
           route_long_name AS long_name 
    FROM transport.route ORDER BY route_id
""")
routes = query.fetchall()               
               
feed = gtfs_realtime_pb2.FeedMessage()
response = urllib.request.urlopen('http://gip.itc.utwente.nl/exercises/data_sources/vehiclePositions.pb')
feed.ParseFromString(response.read())

inProj = Proj(init='epsg:28992')
outProj = Proj(init='epsg:4326')
x1rd,y1rd = coords[0],coords[1]
x1wgs,y1wgs = transform(inProj,outProj,x1rd,y1rd)
x2rd,y2rd = coords[2],coords[3]
x2wgs,y2wgs = transform(inProj,outProj,x2rd,y2rd)

features = []
for entity in feed.entity:
    if x1wgs < entity.vehicle.position.longitude and entity.vehicle.position.longitude < x2wgs:
        if y1wgs < entity.vehicle.position.latitude and entity.vehicle.position.latitude < y2wgs:
            props = entity.id.split(":")
            route_data = routesearch(entity.vehicle.trip.route_id, routes)
            if len(route_data) > 0:
                route_data = route_data[0]
            else:
                route_data = {}
                route_data['short_name'] = entity.vehicle.trip.route_id
                route_data['long_name'] = 'Unknown'
            feature = Feature(
                geometry = Point((entity.vehicle.position.longitude, entity.vehicle.position.latitude)),
                properties = {
                    "trip_id": entity.vehicle.trip.trip_id,
                    "company": props[1],
                    "route_id": entity.vehicle.trip.route_id,
                    "route_code": route_data['short_name'],
                    "route_name": route_data['long_name'],
                    "vehicle_id": entity.vehicle.vehicle.label,
                    "timestamp": None
                }, 
                id = entity.vehicle.vehicle.label
            )
            features.append(feature)

feature_collection = FeatureCollection(features)
print (geojson.dumps(feature_collection))