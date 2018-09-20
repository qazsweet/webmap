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
    WITH cp AS (
        SELECT d.wk_code AS code, 'g' || generate_series(1,9) AS group,
               substring(d.wk_code from 7 for 2) AS label,
               regexp_replace(d.wk_name, 'Wijk (.. )', '') AS name,
               d.aant_inw::REAL AS pop_2016,    
               st_area(d.geom) / 1000000 AS area_km2
        FROM  netherlands.district as d
        WHERE d.gm_naam = '%s'
        ORDER BY 1,2
    )
    SELECT cp.code, cp.label, cp.name, cp.pop_2016, cp.area_km2,
           json_agg((
               cp.group,
               round(l.use_m2::NUMERIC,2),
               round((l.use_m2 * 100 / (cp.area_km2 * 1000000))::NUMERIC,2)
           )) AS landuse_2012
    FROM cp LEFT JOIN s6035280.landuse_per_district_assignment as l 
         ON (l.wk_code = cp.code) AND ('g' || l.group_2012 = cp.group)
    GROUP BY 1,2,3,4,5;
""" % (cityName))

results = json.dumps(records_query.fetchall())
results = results.replace('"f1"','"group"').replace('"f2"','"m2"').replace('"f3"','"pct"')
print ('{"success":"true", "districts":',results,'}')