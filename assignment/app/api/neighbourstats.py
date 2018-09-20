# Generate district statistics (population and landuse)
import os
import json
import psycopg2
import cgi
from psycopg2.extras import RealDictCursor

print ("Content-type: application/json")
print ()

params = cgi.FieldStorage()
cityName = params.getvalue('cityname')
if cityName is None:
    cityName = ''

file = open(os.path.dirname(os.path.abspath(__file__)) + "\pg.credentials")
connection_string = file.readline() + file.readline()
pg = psycopg2.connect(connection_string)

records_query = pg.cursor(cursor_factory=RealDictCursor)
records_query.execute("""
     WITH nbhs AS(
SELECT ovn.wk_code AS code,'g' || generate_series(1,4) AS group,
       substring(ovn.wk_code from 7 for 2) AS label, 
       regexp_replace(d.wk_name, 'Wijk (.. )', '') AS name,
       sum(ovn.aant_inw/1000)::REAL AS pop_2013,
       sum(ovn.aant_inw * ovn.p_00_14_jr/1000):: REAL AS pop_child,
       sum(ovn.aantal_hh/1000):: REAL  AS pop_hh,
       sum(st_area(ovn.geom)/1000000)::REAL AS area_km2
FROM overijssel.neighbourhood as ovn JOIN netherlands.district as d 
  ON ovn.wk_code = d.wk_code
WHERE ovn.gm_naam = '%s'
GROUP BY 1,4
ORDER BY 1,2
)
SELECT nbhs.code,
       nbhs.label,
       nbhs.name,
       nbhs.area_km2,
       nbhs.pop_2013,
       nbhs.pop_child,
       nbhs.pop_hh,
       json_agg((
    nbhs.group,
    (marr.pop_g/1000)::REAL
  )) AS marry_statu
FROM nbhs LEFT JOIN s6035280.marrige as marr
  ON (marr.code = nbhs.code) AND ('g' || marr.classn = nbhs.group)
GROUP BY 1,2,3,4,5,6,7
""" % (cityName))

results = json.dumps(records_query.fetchall())
results = results.replace('"f1"','"group"').replace('"f2"','"nbhCount"')
print ('{"success":"true", "neighbours":',results,'}')