/*--- Home view ---*/

"use strict";

Ext.define('assignment.view.home.HomeView', {
    extend: 'Ext.container.Viewport',

    requires: [
        'assignment.view.home.HomeController',
        'assignment.view.statistics.StatisticsView',
        'assignment.view.transport.TransportView',
        'assignment.view.neighbourhood.neighbourhoodView'
    ],

    controller: 'home-main',

    itemId: 'home_view',
    id: 'home_view',

    padding: 2,
    layout: 'fit',

    items: [{
        xtype: 'tabpanel',
        activeTab: 1,
        items: [{
             xtype: 'statisticsview',
            title: '&nbsp;&nbsp;Landuse Statistics&nbsp;&nbsp;'
        },{
            xtype: 'neighbourhoodview',
            title: '&nbsp;&nbsp;Marriage&nbsp;status&nbsp;and&nbsp;Children&nbsp;&nbsp;'
        },{
            xtype: 'transportview',
            title: '&nbsp;&nbsp;Public&nbsp;Transport&nbsp;&nbsp;'
        }]
    }]
});
/*--- ---*/