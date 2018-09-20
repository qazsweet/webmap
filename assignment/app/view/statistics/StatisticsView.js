/*--- Statistics View ---*/

"use strict";

Ext.define('assignment.view.statistics.StatisticsView', {
    extend: 'Ext.panel.Panel',
    xtype: 'statisticsview',
 
    requires: [
        'assignment.view.statistics.StatisticsController'
    ],
 
    itemId: 'statistics_view',
    id: 'statistics_view',
 
    controller: 'statistics-main',
 
    border: false,
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },    
 
    items: [{
        xtype: 'panel',
        id: 'sts_map_panel',
        layout: 'fit',
        margin:'3 3 3 3',
        flex: 1
    },{
        xtype: 'panel', /* statistical charts container */
        margin:'1 3 3 3',
        height: 300,
        border: false,
        layout: {
            type: 'hbox',
            pack: 'start',
            align: 'stretch'
        },
        items: [{
            xtype: 'panel',
            id: 'sts_barchart_panel',  /* bar chart */
            layout: 'fit',
            margin: '0 2 0 0',
            flex: 1
        },
        {
            xtype: 'panel',
            id: 'sts_piechart_panel',  /* pie chart */
            layout: 'fit',
            border: false,
            style: {
                borderLeft: 'solid 1px #cccccc',
                borderTop: 'solid 1px #cccccc',
                borderBottom: 'solid 1px #cccccc'
            },
            width: 250
        },
        {
            xtype: 'panel',
            id: 'sts_pielegend_panel',  /* pie legend */
            layout: 'fit',
            border: false,
            style: {
                borderRight: 'solid 1px #cccccc',
                borderTop: 'solid 1px #cccccc',
                borderBottom: 'solid 1px #cccccc'
            },
            width: 180
        }]
    }]
 
});
/*--- ---*/