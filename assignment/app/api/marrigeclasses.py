import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

print ("Content-type: application/json")
print ()

file = open(os.path.dirname(os.path.abspath(__file__)) + "\pg.credentials")
connection_string = file.readline() + file.readline()
pg = psycopg2.connect(connection_string)

records_query = pg.cursor(cursor_factory=RealDictCursor)
records_query.execute("""
    SELECT 'g' || class_code as class_code, class_name
    FROM s6035280.marrigestate_class
    ORDER BY 2;
""")

print ('{"success":"true", "classes":',json.dumps(records_query.fetchall()),'}')