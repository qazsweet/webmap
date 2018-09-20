/*--- Transport controller ---*/

"use strict";

Ext.define('assignment.view.transport.TransportController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.transport-main',
 
    txpMap: null,
    vehicleLayer: null,
    interval: null,
    deployed: false, 
    defaultStyle: null,
    choroLayer: null,
 
    init: function(){
        assignment.app.txpCtrl = this;
        this.control({
            'panel#txp_map_panel': {
                'resize': 'onMapPanelResize'
            },
            'transportview': {
                'boxready': 'initializeView'
            }
        });
    },
    /*---*/   
 
    /*- Overlays on the base map a vector layer with the districts -*/
    renderVectorFeatures: function(){
        var featuresUrl = 'https://gisedu.itc.utwente.nl/cgi-bin/mapserv.exe?map='+
         'd:/iishome/student/s6035280/assignment/app/api/adminboundaries.map'+
         '&service=WFS&version=1.1.0&request=GetFeature&typename=cbs:districts'+
         '&outputFormat=geojson&srsname=EPSG:28992&cityname=Zwolle';
            
        this.defaultStyle = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 0, 0.07)'
            }),
            stroke: new ol.style.Stroke({
                color: '#777',
                width: 2
            })
        });
 
        this.choroLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: featuresUrl
            }),
            name: 'Chroropleth',
            style: this.defaultStyle
        });
        this.txpMap.addLayer(this.choroLayer);
    },
    /*---*/
    
   
    /*- Refreshes the map when its containing panel is resized -*/
    onMapPanelResize: function(){
        if (this.txpMap){ 
            this.txpMap.updateSize(); 
        };
    },
    /*---*/ 
 
 
    /*- Performs initialization actions after the view has been rendered by the browser -*/
    initializeView: function(){
        this.txpMap = assignment.app.homeCtrl.createMap('brtachtergrondkaartgrijs', 'txp_map_panel');
        this.txpMap.getView().setCenter(assignment.app.cityCoords);
        this.txpMap.getView().setZoom(7);
        
        var districtsWMS = new ol.layer.Image({
            source: new ol.source.ImageWMS({
                url: 'https://gisedu.itc.utwente.nl/cgi-bin/mapserv.exe?',
                params: {
                    'MAP': 'd:/iishome/student/s6035280/assignment/app/api/adminboundaries.map',
                    'LAYERS': 'districts',
                    'SERVER': 'MapServer',
                    'TILED': true
                }
            }),
            name: 'District Boundaries',
            visible: true
        });  
        
        var defaultStyle = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: 'rgba(0, 200, 0, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#009900',
                    width: 2
                })
            })
        });
 
        this.vehicleLayer = new ol.layer.Vector({   
            source: new ol.source.Vector({
                features: (new ol.format.GeoJSON())
            }),
            style: defaultStyle
        });
        this.txpMap.addLayer(this.vehicleLayer);
        this.txpMap.addLayer(districtsWMS);
        this.renderVectorFeatures();
        
        function hoverStyle() {
            return function(feature){
                return new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 5,
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 0, 102, 0.2)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#ff0066',
                            width: 2
                        })
                    }),
                    text: new ol.style.Text({
                        textAlign: 'center',
                        textBaseline: 'middle',
                        font: 'Normal 16px Arial',
                        text: feature.get('route_code') + '\n' + feature.get('route_name'),
                        fill: new ol.style.Fill({color: '#ff0066'}),
                        stroke: new ol.style.Stroke({color: '#fff', width: 3}),
                        offsetX: 0,
                        offsetY: -26,
                        rotation: 0
                    })
                });
            };
        };
        var hoverInteraction = new ol.interaction.Select({
            layers: [this.vehicleLayer],
            condition: ol.events.condition.pointerMove,
            style: hoverStyle()
        });        
        this.txpMap.addInteraction(hoverInteraction); 
        
        this.txpMap.on('moveend', this.refreshVehicleLayer);
    },
    /*---*/
    
    
    /*- Reads a new transit feed */
    getVehiclePositions: function(bboxCoords){
        Ext.Ajax.request({
            url: 'app/api/transitfeed.py?bbox=' + bboxCoords,
            disableCaching: false,
            success: function(response){
                assignment.app.txpCtrl.updateVehiclePositions(JSON.parse(response.responseText));
            },
            failure: function(response){
                console.log('error: '+response.status);
            }
        });
    },    
    /*---*/
    
    
    /* Updates the features in the vehicle layer with their new positions from the feed -*/
    updateVehiclePositions: function(vehiclePositions){    
        var feature, layerSource, updateTime;
        updateTime = Date.now(); 
        layerSource = this.vehicleLayer.getSource();
        vehiclePositions.features.forEach(function(vehicle){
            feature = layerSource.getFeatureById(vehicle.id);
            if (feature){ /* update geomtery if the feature exists */
                feature.setGeometry(
                    new ol.geom.Point([vehicle.geometry.coordinates[0],vehicle.geometry.coordinates[1]])
                        .transform('EPSG:4326','EPSG:28992')
                );
            } else { /* create new features */
                feature = new ol.Feature();
                feature.setGeometry(
                    new ol.geom.Point([vehicle.geometry.coordinates[0],vehicle.geometry.coordinates[1]])
                        .transform('EPSG:4326','EPSG:28992')
                );
                feature.setId(vehicle.id);
                feature.setProperties(vehicle.properties);
                layerSource.addFeature(feature);
            };
            feature.set('timestamp', updateTime);
        });
        layerSource.forEachFeature(function(feature){ /* remove features that are no longer in the feed */
            if (feature.get('timestamp') < updateTime){ layerSource.removeFeature(feature); };
        });
    },    
    /*---*/    
    
    
    /*- Reconfigures the interface for the retrieval of vehicle positions -*/
    refreshVehicleLayer: function(){
        assignment.app.txpCtrl.getVehiclePositions(
            assignment.app.txpCtrl.txpMap.getView().calculateExtent()
        );
        assignment.app.txpCtrl.interval = setInterval(
            function(){ 
                assignment.app.txpCtrl.getVehiclePositions(
                    assignment.app.txpCtrl.txpMap.getView().calculateExtent()
                ); 
            }, 
            60000
        );    
    }
    /*---*/
});
/*--- ---*/