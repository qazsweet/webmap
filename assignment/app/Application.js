/**
 * The main application class. An instance of this class is created by the init.js  script
 * when it calls Ext.app.application(). This is the ideal place to handle application launch
 * and initialization details.
 */

"use strict";

Ext.define('assignment.Application', {
    extend: 'Ext.app.Application',
    appFolder: 'app',

    requires: [
        'assignment.store.Districts',
        'assignment.store.Colors',
        'assignment.store.Neighbours'
    ],
 
    stores: [ 'Districts', 'Colors', 'Neighbours' ],

    homeCtrl: null,
    stsCtrl: null,
    txpCtrl: null,
    nbhCtrl: null,
 
    cityName: 'Zwolle',
    cityCoords: [204000,503000], /* Coordinates of a central point in Enschede EPSG:28992 */
    
    launch: function(){

    }
});
/*--- ---*/