/*--- Districts store ---*/
Ext.define('assignment.store.Districts', {
    extend: 'Ext.data.Store',

    alias: 'store.districts',
    storeId: 'districts',

    model: 'assignment.model.District',

    proxy: {
        type: 'ajax',
        noCache: false,
        url: 'app/api/districtstats.py',
        reader: {
            type: 'json',
            successProperty: 'success',
            rootProperty: 'districts'  /* Name of the element containing the data */
        }
    }
});
/*--- ---*/