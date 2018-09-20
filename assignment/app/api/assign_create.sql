/* create personal table of marrige statue of per neighbourhood*/
CREATE TABLE s6035280.marrige AS
SELECT ovn.wk_code AS code,
       sum(ovn.aant_inw)::REAL AS pop_t,
       sum((ovn.aant_inw*ovn.p_gehuwd/100))::REAL AS pop_g1,
       sum((ovn.aant_inw*ovn.p_ongehuwd/100))::REAL AS pop_g2,
       sum((ovn.aant_inw*ovn.p_gescheid/100))::REAL AS pop_g3,
       sum((ovn.aant_inw*ovn.p_verweduw/100))::REAL AS pop_g4
FROM overijssel.neighbourhood as ovn
WHERE ovn.gm_naam = 'Zwolle'
GROUP BY 1;

/*data prepare of comparation the relationship between marrige statue and number of children per neighbourhood*/
WITH nbhs AS(
SELECT ovn.wk_code AS code,'g' || generate_series(1,4) AS group,
       substring(ovn.wk_code from 7 for 2) AS label, 
       ovn.aant_inw::REAL AS pop_2013,
       (ovn.aant_inw * ovn.p_00_14_jr):: REAL AS pop_child,
       ovn.aantal_hh AS pop_hh
FROM overijssel.neighbourhood as ovn
WHERE ovn.gm_naam = 'Zwolle'
ORDER BY 1,2
)
SELECT nbhs.code,
       nbhs.label,
       sum(nbhs.pop_child)::NUMERIC AS pop_nbh_child,
       json_agg((
		marr.class,
		marr.pop_g
	)) AS marrige_statue
FROM nbhs LEFT JOIN s6035280.marrigestatue as marr
  ON (marr.code = nbhs.code) AND ('g' || marr.class = nbhs.group)
GROUP BY 1,2;