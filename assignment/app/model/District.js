/*--- District model ---*/
Ext.define('assignment.model.District', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'label', type: 'string' },
        { name: 'code', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'pop_2016', type: 'float' },
        { name: 'area_km2', type: 'float' },
        { name: 'landuse_2012', type: 'auto' }
    ],
    idProperty: 'label'
});
/*--- ---*/