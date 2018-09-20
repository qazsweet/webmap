/*--- Neighbours store ---*/
Ext.define('assignment.store.Neighbours', {
    extend: 'Ext.data.Store',

    alias: 'store.Neighbours',
    storeId: 'neighbours',

    model: 'assignment.model.Neighbour',

    proxy: {
        type: 'ajax',
        noCache: false,
        url: 'app/api/neighbourstats.py',
        reader: {
            type: 'json',
            successProperty: 'success',
            rootProperty: 'neighbours'  /* Name of the element containing the data */
        }
    }
});
/*--- ---*/