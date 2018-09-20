/*--- Neighbour model ---*/
Ext.define('assignment.model.Neighbour', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'label', type: 'string' },
        { name: 'code', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'area_km2', type: 'float' },
        { name: 'pop_2013', type: 'float' },
        { name: 'pop_child', type: 'float' },
        { name: 'pop_hh', type: 'float' },
        { name: 'marry_statu', type: 'auto' }
    ],
    idProperty: 'label'
});
/*--- ---*/