-- Compute the area of landuse (in m2) per landuse type in each disctrict in Enschede
SELECT d.wk_code, d.wk_name, l.group_2012, sum(St_Area(ST_Intersection(l.geom, d.geom))) AS use_m2
FROM netherlands.landuse AS l JOIN netherlands.district AS d ON ST_Intersects(l.geom, d.geom)
WHERE d.gm_naam = 'Enschede'
GROUP BY 1,2,3
ORDER BY 1,2;

-- Q1 --
-- Create a table for the results of the landuse type areas in each district in Enschede
-- This way we get a faster response to web service requests
CREATE TABLE s6035280.landuse_per_district AS 
SELECT d.wk_code, l.group_2012, sum(St_Area(ST_Intersection(l.geom, d.geom))) AS use_m2
FROM netherlands.landuse AS l JOIN netherlands.district AS d ON ST_Intersects(l.geom, d.geom)
WHERE d.gm_naam = 'Enschede'
GROUP BY 1,2
ORDER BY 1,2;
 
 
-- Q2 --
-- Check that indeed the correct data content has been generated
SELECT wk_code, group_2012, use_m2
FROM s6035280.landuse_per_district; 

-- Combining district data with landuse data
SELECT l.wk_code,
    'g' || group_2012 AS group,
    round(use_m2::NUMERIC,2) AS m2,
    round((use_m2 * 100 / ST_Area(d.geom))::NUMERIC,2) AS pct
FROM s6035280.landuse_per_district AS l JOIN netherlands.district AS d
     ON (l.wk_code = d.wk_code)
WHERE d.gm_naam = 'Enschede'
ORDER By 1,2;

-- Q1 -- 
-- Generation of rows for all combinations of landuse groups and districts,
-- namely a cartesian product
SELECT d.wk_code, 'g' || generate_series(1,9) AS group
FROM  netherlands.district AS d
WHERE d.gm_naam = 'Enschede';


-- Q2 -- 
-- Checking that the district-landuse_group pairs approach using a cartesian product, 
-- actually works (see Figure 12)
WITH cp AS (
    SELECT d.wk_code, 'g' || generate_series(1,9) AS group
    FROM  netherlands.district AS d
    WHERE d.gm_naam = 'Enschede'
)
SELECT cp.wk_code, cp.group, l.use_m2
FROM cp LEFT JOIN s6035280.landuse_per_district AS l 
     ON (cp.wk_code = l.wk_code) AND ('g' || l.group_2012 = cp.group);