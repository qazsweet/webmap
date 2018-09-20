/*--- neighbourhood View ---*/

"use strict";

Ext.define('assignment.view.neighbourhood.neighbourhoodView', {
    extend: 'Ext.panel.Panel',
    xtype: 'neighbourhoodview',
 
    requires: [
        'assignment.view.neighbourhood.neighbourhoodController'
    ],
 
    itemId: 'neighbourhood_view',
    id: 'neighbourhood_view',
 
    controller: 'neighbourhood-main',
 
    border: false,
    layout: {
        type: 'hbox',
        pack: 'start',
        align: 'stretch'
    },    
 
    items: [{
        xtype: 'panel',
        id: 'nbh_map_panel',
        layout: 'fit',
        margin:'3 3 3 3',
        flex: 3
    },
    {
        xtype: 'panel',
        margin:'3 3 3 3',
        flex: 2,
        border: false,
        layout: {
            type: 'vbox',
            pack: 'start',
            align: 'stretch'
        },
        items: [{
            xtype: 'panel',
            id: 'nbh_barchart_panel',  /* bar chart */
            layout: 'fit',
            style: {
                borderLeft: 'solid 1px #cccccc',
                borderTop: 'solid 1px #cccccc',
                borderRight: 'solid 1px #cccccc'
            },
            flex: 2
        },{
            xtype: 'panel',
            id: 'nbh_barchart_panel_2',  /* bar chart */
            layout: 'fit',
            style: {
                borderLeft: 'solid 1px #cccccc',
                borderTop: 'solid 1px #cccccc',
                borderBottom: 'solid 1px #cccccc',
                borderRight: 'solid 1px #cccccc'
            },
            flex: 2
        },{
        xtype: 'panel',
        margin:'0 0 0 0',
        flex: 3,
        border: false,
        layout: {
            type: 'hbox',
            pack: 'start',
            align: 'stretch'
        },
        items: [{
            xtype: 'panel',
            id: 'nbh_piechart_panel',  /* pie chart */
            layout: 'fit',
            style: {
                borderLeft: 'solid 1px #cccccc',
                borderTop: 'solid 1px #cccccc'
            },
            flex: 2
        },{
            xtype: 'panel',
            id: 'nbh_pielegend_panel_leg',  /* pie legend */
            layout: 'fit',
            style: {
                borderTop: 'solid 1px #cccccc',
                borderBottom: 'solid 1px #cccccc',
                borderRight: 'solid 1px #cccccc'
            },
            flex: 1
        }]
    }]
    }]
});
/*--- ---*/