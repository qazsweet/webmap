/*--- Home controller ---*/

"use strict";

Ext.define('assignment.view.home.HomeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.home-main',

    init: function(){
        assignment.app.homeCtrl = this;
        this.control({
            'tabpanel': {
                'tabchange': 'onTabPanelChange'
            }
        });
        window.onblur = this.onFocusChange;
        window.onfocus = this.onFocusChange; 
    },
    /*---*/
    
    
    /*- Enables of desables the transit feed request on changes of focus on the app window -*/
    onFocusChange: function(appState){
        var activeTab;
        var txpCtrl = assignment.app.txpCtrl;
        activeTab = Ext.ComponentQuery.query('#home_view tabpanel')[0].activeTab;
        if (activeTab.id == 'transport_view'){
            (appState.type == 'focus') ? txpCtrl.refreshVehicleLayer() : clearInterval(txpCtrl.interval);
        };
        
    },
    /*---*/
    
    
    /*- Enables or desables the transit feed request on tab changes -*/
    onTabPanelChange: function(tabpanel, newTab, oldTab){
        var txpCtrl = assignment.app.txpCtrl;
        if (newTab.id == 'transport_view'){
            (txpCtrl.deployed) ? txpCtrl.refreshVehicleLayer() : txpCtrl.deployed = true;
        } else {
            if (oldTab.id == 'transport_view') { clearInterval(txpCtrl.interval); }
        };
    },
    /*---*/
 
 
     /*- Creates and returns a new ol map object using the given panel -*/ 
    createMap: function(baseMap, mapPanel){
        var brtUrl = 'https://geodata.nationaalgeoregister.nl/tiles/service/tms/1.0.0/' + 
                  baseMap + '@EPSG:28992@png/';
        var brtResolutions = [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52,
                              53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.21];
        var tileUrlFunction = function(zxy){ /* zxy = tileCoord */
                if (zxy[1] < 0 || zxy[2] < 0) {
                    return "";
                }
                return brtUrl + zxy[0].toString() + '/' + zxy[1].toString() +'/'+
                       zxy[2].toString() +'.png';
            };

        var baseLayer = new ol.layer.Tile({
            name: 'BRT Base Map',
            source: new ol.source.TileImage({
                projection: nlProjection,
                tileGrid: new ol.tilegrid.TileGrid({
                    origin: [-285401.92,22598.08],
                    resolutions: brtResolutions
                }),
                tileUrlFunction: tileUrlFunction,
                attributions: 'Tiles &copy; OSM & Kadaster'
            })
        });
        
        var nlExtent = [-285401.920,22598.080,595401.920,903401.920],
            nlProjection = new ol.proj.Projection({
                code: 'EPSG:28992',
                units: 'm',
                extent: nlExtent
            });

        var newMap = new ol.Map({
            controls: [],
            view: new ol.View({
                projection: nlProjection,
                center: [150000, 450000], /* Default coordinates for the whole country */
                minZoom: 2,
                maxZoom: 13,
                zoom: 3
            })
        });
        
        newMap.addLayer(baseLayer);
        newMap.addControl(
            new ol.control.MousePosition({
                coordinateFormat: ol.coordinate.createStringXY(2)
            })
        );        
        newMap.setTarget(Ext.getCmp(mapPanel).body.id);
        console.log('a new empty map object has been created in the "' + mapPanel + '".');
        
        return newMap;
    }/*---*/

});
/*--- ---*/