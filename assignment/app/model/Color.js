/*--- Color model ---*/
Ext.define('assignment.model.Color', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'group', type: 'string' },
        { name: 'stroke', type: 'string' },
        { name: 'fill', type: 'string' },
        { name: 'tints', type: 'auto' }
    ],
    idProperty: 'group'
});