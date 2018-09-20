/*--- neighbourhood controller ---*/

"use strict";

Ext.define('assignment.view.neighbourhood.neighbourhoodController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.neighbourhood-main',

    nbhMap: null,
    neighbours: null,
    barChart: null,
    pieChart: null,
    defaultStyle: null,
    choroLayer: null,
    onMouseOverFeature: null,
    userEvent: true,

    init: function(){
        assignment.app.nbhCtrl = this;
        this.control({
            'neighbourhoodview': {
                'boxready': 'initializeView'
            },
            'panel#sts_barchart_panel': {
                'resize': 'resizeBarChart'
            },
            'panel#sts_map_panel': {
                'resize': 'onMapPanelResize'
            }
        });
    },
    /*---*/

    /*- Performs initialization actions after the view has been rendered by the browser -*/
    initializeView: function(){
        this.nbhMap = assignment.app.homeCtrl.createMap('brtachtergrondkaartgrijs', 'nbh_map_panel');
        this.nbhMap.getView().setCenter(assignment.app.cityCoords);
        this.nbhMap.getView().setZoom(7);
        
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
        this.nbhMap.addLayer(districtsWMS);
        this.renderVectorFeatures();

        var nbhCtrl = this;
        Ext.getStore('neighbours').load({
            params: { 
                'cityname': assignment.app.cityName 
            },
            callback: function(records){
                nbhCtrl.neighbours = records;
                nbhCtrl.barChart = nbhCtrl.drawBarChart(nbhCtrl.neighbours, 'nbh_barchart_panel'); 
                nbhCtrl.barChart = nbhCtrl.drawBarChart_2(nbhCtrl.neighbours, 'nbh_barchart_panel_2');
                nbhCtrl.drawPieLegend('nbh_pielegend_panel_leg');
                nbhCtrl.pieChart = nbhCtrl.drawPieChart(nbhCtrl.neighbours, 'nbh_piechart_panel');
            
            },
            scope: this
        });
        
        Ext.getCmp('nbh_map_panel').getEl().on('mouseleave',function(){
            nbhCtrl.onMouseOverFeature.getFeatures().clear();
        });  
    },
    /*---*/

    /*- Refreshes the map when its containing panel is resized -*/
    onMapPanelResize: function(){
        if (this.nbhMap){ 
            this.nbhMap.updateSize(); 
        };
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
        this.nbhMap.addLayer(this.choroLayer);
 
        function mouseOverStyle(){
            return function(feature){
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#333',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(0, 0, 0, 0.3)'
                    }),
                    text: new ol.style.Text({
                        textAlign: 'center',
                        textBaseline: 'middle',
                        font: 'Normal 16px Arial',
                        overflow: true,
                        text: feature.get('district_code').substring(6,8) + '\n' + 
                                feature.get('district_name'),
                        fill: new ol.style.Fill({color: '#fff'}),
                        stroke: new ol.style.Stroke({color: '#000', width: 3}),
                        rotation: 0
                    })
                });
            };
        };
 
        this.onMouseOverFeature = new ol.interaction.Select({
            layers: [this.choroLayer],
            condition: ol.events.condition.pointerMove,
            style: mouseOverStyle()
        });
        this.nbhMap.addInteraction(this.onMouseOverFeature);
        
        this.onMouseOverFeature.getFeatures().on('add', function(evt){
           if (assignment.app.nbhCtrl.userEvent){
            d3.select("#bar_" + evt.element.get('district_code'))
                .style("stroke", "#222")
                .style("stroke-width", 2)
                .style("fill-opacity", 0.9);
 
                var record = assignment.app.nbhCtrl.neighbours.find(function(r){
                    return r.data.code == evt.element.get('district_code')
                });
                assignment.app.nbhCtrl.refreshPieChart(record.data.marry_statu, record.data.name);
            
            };
        });    
        
        this.onMouseOverFeature.getFeatures().on('remove', function(evt){
           if (assignment.app.nbhCtrl.userEvent){
            d3.select("#bar_" + evt.element.get('district_code'))
                .style("stroke", "#AAA")
                .style("stroke-width", 1)
                .style("fill-opacity", 0.4);   
 
                assignment.app.nbhCtrl.refreshPieChart(
                    assignment.app.nbhCtrl.pieChart.cityTotals, 
                    assignment.app.cityName
                );
            };
        });                
 
    },
    /*---*/
 
 
    /*- Renders the legend for the pie charts -*/
    drawPieLegend: function(legendPanel){
        var lg = new Object;
        lg.panel = Ext.getCmp(legendPanel);
        lg.width = lg.panel.getWidth();
        lg.height = lg.panel.getHeight();
 
        /* Legend object */
        lg.obj = d3.select("#" + lg.panel.body.id).append("svg")
            .attr('id','pie_legend')
            .attr("width", lg.width)
            .attr("height", lg.height); 
 
        d3.json("app/api/marrigeclasses.py", function (error, data){
            var groups = data.classes;
 
            /* Row size and margin for the legend items */
            var row = 28,
                top = (lg.height - row * (groups.length - 1)) * 0.6;
 
            /* Containers for each legend item */
            lg.obj.selectAll('.legend-element')
                .data(groups)
              .enter()
                .append('g')
                .attr('id',function(r){ return r.class_code; })
                .attr('class','legend-element')
                .attr('transform', function(r, i){
                    var x = 5;
                    var y = i * row + top;
                    return 'translate(' + x + ',' + y + ')';
                });
 
            /* Color rectangles */
            lg.obj.selectAll('.legend-element')
                .append('rect')
                .attr('width', row/2)
                .attr('height', row/2)
                .style("fill-opacity", 0.6)
                .style('fill', function(r){
                    return Ext.getStore('colors').getById(r.class_code).get('fill');
                })
                .style('stroke', function(r){
                    return Ext.getStore('colors').getById(r.class_code).get('stroke');
                });
 
            /* Legend labels */
            lg.obj.selectAll('.legend-element')
                .append('text')
                .attr('x', 20)
                .attr('y', 12)
                .style('font-weight', 400)
                .text(function(r){ return r.class_name; });
 
            /* Legend title */
            lg.obj.append('text')
                .attr('x', 5)
                .attr('y', top - 15)
                .style('font-weight', 600)
                .style("text-anchor", "start")
                .text('Marriage status');
        });
    },
    /*---*/

     /*- Displays a choropleth for the provided values of a landuse group -*/
    showChoropleth: function(choroData, group, className){
        var choroClass, colorStore, strokeColor, tintNumber, rgb, fillColor, 
            choroStyle;
        
        choroClass = d3.scaleLinear().domain([
            d3.min(choroData, function(r){ return r.nbhCount; }),
            d3.max(choroData, function(r){ return r.nbhCount; })
        ]).rangeRound([0, 3]);
        colorStore = Ext.getStore('colors');
        strokeColor = colorStore.getById(group).get('stroke');
        
        choroStyle = function(){
            return function(feature, resolution){
                tintNumber = choroClass(
                    choroData.find(function(r){
                        return (r.code == feature.get('district_code'))
                    }).nbhCount
                );
                rgb = ol.color.asArray(colorStore.getById(group).get('tints')[tintNumber]);
                fillColor = 'rgba('+ rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', 0.8)';
                return new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: fillColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: strokeColor,
                        width: 2
                    }),
                    text: new ol.style.Text({
                        textAlign: 'center',
                        textBaseline: 'middle',
                        font: 'Normal 16px Arial',
                        overflow: true,
                        text: feature.get('district_code').substring(6),
                        fill: new ol.style.Fill({color: '#fff'}),
                        stroke: new ol.style.Stroke({color: strokeColor, width: 3}),
                        rotation: 0
                    })                    
                });
            };
        };
        this.choroLayer.setStyle(choroStyle());
    },
    /*---*/
    /*- Draws new bars based on a given set of values -*/
    redrawBars: function(barsData, fillColor, strokeColor, yAxisLabel){
        var bc = this.barChart;
        bc.y.domain([0, d3.max(barsData, function(r){ 
            return (bc.popBars) ? r.data.pop_2013 : r.nbhCount; 
        })]);
 
        bc.obj.selectAll(".bar")
            .data(barsData)
            .transition().duration(200)
            .attr("y", function(r){ 
                return bc.y((bc.popBars) ? r.data.pop_2013 : r.nbhCount); 
            })
            .attr("height", function(r){ 
                return bc.height - bc.y((bc.popBars) ? r.data.pop_2013 : r.nbhCount); 
            })
            .style("stroke", strokeColor)
            .style("fill", fillColor);
 
        bc.obj.selectAll(".y.axis")
            .call(d3.axisLeft(bc.y));
 
        d3.select('#bc_yaxis_label_2')
           .text(yAxisLabel);  
    },
    /*---*/

    /*- Creates a pie chart based on marrigue statue values -*/
    drawPieChart: function(neighbours, chartPanel){
        var pc = new Object;

         /*---*/
        function mouseOverPie(slice){
            var className, sliceData;
 
            d3.selectAll('.legend-element')
                .style('opacity', function(r){
                    if (r.class_code == slice.data.group){ className = r.class_name; };
                    return (r.class_code == slice.data.group) ? 1 : 0.2; 
                });
 
            sliceData = assignment.app.nbhCtrl.neighbours.map(function(r){
                return {
                    code: r.data.code,
                    nbhCount: r.data.marry_statu.find(function(g){
                        return ( g.group == slice.data.group);
                    }).nbhCount
                }
            });
            assignment.app.nbhCtrl.showChoropleth(sliceData, slice.data.group, className);
            assignment.app.nbhCtrl.barChart.popBars = false;
            assignment.app.nbhCtrl.redrawBars(
                sliceData, 
                Ext.getStore('colors').getById(slice.data.group).get('fill'),
                Ext.getStore('colors').getById(slice.data.group).get('stroke'),
                'Population under ' + className + ' statu in Zwolle (thousand)'
            );
        };
        /*---*/
        function mouseOutOfPie(){
            d3.selectAll('.legend-element')
                .style('opacity', 1);
            assignment.app.nbhCtrl.choroLayer.setStyle(assignment.app.nbhCtrl.defaultStyle);
            assignment.app.nbhCtrl.barChart.popBars = true;
            assignment.app.nbhCtrl.redrawBars(
                assignment.app.nbhCtrl.neighbours, 
                '#CACCCE', 
                '#AAA', 
                'Number of Inhabitants (2013)'
            );
        };
        /*---*/
 
        /* Compute statistics per landuse class at the municipality level */
        var groupPop, groupKeys, totalPop;
        groupKeys = neighbours[0].data.marry_statu.map(function(r){ return r.group; }).sort();
        totalPop = d3.sum(neighbours, function(r){ return r.data.pop_2013; }),
        pc.cityTotals = groupKeys.map(function(key){
            groupPop = d3.sum(neighbours, function(r){
                return r.data.marry_statu.find(function(i){ return i.group == key }).nbhCount;
            });
            return {
                group: key,
                nbhCount: groupPop,
                pct: Math.round(groupPop/totalPop*100)
            };
        });
 
        /* Pie chrat margins and dimentions */
        pc.panel = Ext.getCmp(chartPanel); /* Reference to the pie chart container */
        pc.width = pc.panel.getWidth();
        pc.height = pc.panel.getHeight();
        pc.radius = Math.min(pc.width, pc.height) / 2;
 
        /* Pie chart object */
        pc.obj = d3.select("#" + pc.panel.body.id).append("svg")
            .attr("width", pc.width)
            .attr("height", pc.height)
            .attr("id", 'pie_chart')
          .append("g")
            .attr("transform", "translate(" + (pc.width/2) + "," + ((pc.height/2)-10)  + ")");
 
        /* Arc & slice functions */
        pc.arc = d3.arc()
            .outerRadius(pc.radius - 45)
            .innerRadius(0);
        pc.slice = d3.pie()
            .sort(null)
            .value(function(r){ return r.nbhCount; });
 
        /* Pie slices */
        pc.obj.selectAll("path")
            .data(pc.slice(pc.cityTotals))
          .enter()
            .append("path")
            .attr("id", function(r){ return "pie_" + r.data.group; })
            .attr("d", pc.arc)
            .style("fill-opacity", 0.6)
            .style("fill", function(r){ 
                return Ext.getStore('colors').getById(r.data.group).get('fill'); 
            })
            .style("stroke", "#888")
            .style("stroke-width", 1)
            .on("mouseover", mouseOverPie)
            .on("mouseout", mouseOutOfPie); 
 
        /* Labels for the various pie slices */
        pc.labelArc = d3.arc()
            .outerRadius(pc.radius + 90)
            .innerRadius(0);
 
        pc.labelAngle = function(r){
            var a = (r.startAngle + r.endAngle) * 90 / Math.PI - 90;
            return a > 90 ? a - 180 : a;
        };
 
        pc.obj.selectAll(".pie-label")
            .data(pc.slice(pc.cityTotals))
          .enter()
            .append("text")
            .attr("class","pie-label")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .attr("transform", function(r){
                return "translate(" + pc.labelArc.centroid(r) + ")rotate(" + pc.labelAngle(r) + ")";
            })
            .style('font-weight', 500)
            .text(function(r){ 
                return (r.data.pct > 0.9) ? r.data.pct + '%' : ''; });
        
        /* Pie Title */    
        pc.obj.append('text')
            .attr('id','pie_title')
            .attr('x',0)
            .attr('y',147)
            .style('font-weight', 600)
            .style("text-anchor", "middle")
            .text('Marrigue Statue in : ' + assignment.app.cityName);


        pc.arcTween = function(r){
            var i = d3.interpolate(this._current, r);
            this._current = i(0);
            return function(t) {
                return pc.arc(i(t));
            };
        };   
 
        return pc;
    },
    /*---*/
    
    
    /*- Refreshes the pie chart with new data -*/
    refreshPieChart: function(pieData, districtName){
        var pc = this.pieChart;
        pc.obj.selectAll("path")
            .data(pc.slice(pieData))
                .transition()
                .duration(200)
                .attrTween("d", pc.arcTween);
                
        pc.obj.selectAll(".pie-label")
            .data(pc.slice(pieData))
                .transition()
                .duration(200)
                .attr("transform", function(r){ 
                    return "translate(" + pc.labelArc.centroid(r) + ")rotate(" + pc.labelAngle(r) + ")"; 
                })
                .text(function(r){
                    console.log(r.data.pct);
                    return (!r.data.nbhCount) ? '' :
                        (r.data.pct > 0.9) ? Math.round(r.data.pct) + '%' : 
                            (r.data.pct > 0.4) ? '<1%' : '';
                });
                
        d3.select('#pie_title')
            .text('Marriage Status in : ' + districtName);   
    },
    /*---*/
    
 
    /*- Redraws the bar chart when its container panel is resized -*/
    resizeBarChart: function(){
        if (this.barChart){
            var bc = this.barChart;
            
            bc.width = bc.panel.getWidth() - bc.margin.left - bc.margin.right - 1;
            bc.height = bc.panel.getHeight() - bc.margin.top - bc.margin.bottom;            
            
            d3.select('svg#bar_chart')
                .attr("width", bc.panel.getWidth());          
            
            bc.x.range([0, bc.width]).padding(0.1);
                            
            bc.obj.selectAll(".x.axis")
                .attr("transform", "translate(0," + bc.height + ")")
                .call(d3.axisBottom(bc.x))
              .select('#bc_xaxis_label')
                .attr("x", bc.width/2);    
 
            bc.obj.selectAll(".bar")
                .attr("x", function(r) { return bc.x(r.data.label); })
                .attr("width", bc.x.bandwidth()*.8);
        }
    },
    /*---*/
  
    /*- Draws a bar chart after the data of the neighbours has been received -*/
    drawBarChart: function(neighbours, chartPanel){
        var bc = new Object;
        bc.popBars = true; /* Boolean to control the type of data for the bars (pop/landuse) */
        var barTooltip = d3.select("body")
            .append("div")
            .attr("id", "bar-tooltip")
            .attr("class", "tooltip");

        /*---*/
        function onMouseOverChart(record){
            d3.select('#bar_' + record.data.code)
                .style("stroke", "#222")
                .style("stroke-width", 2)
                .style("fill-opacity", 0.9);
                
            assignment.app.nbhCtrl.refreshPieChart(record.data.marry_statu, record.data.name);    
            
            /* display tooltip including some record data */
            barTooltip.html('<b>'+record.data.name + '</b><br />' +
                Ext.util.Format.number(record.data.pop_child,'0,000')+'&nbsp;children;'+'<br />'+
                Ext.util.Format.number(record.data.pop_2013,'0,000')+',000&nbsp;people&nbsp;in total.');
            barTooltip.transition()
                .duration(50)
                .style("display", "block")
                .style("opacity", 0.9); 
 
            /* highlight the corresponding feature on the map */
            var currentFeature = 
                assignment.app.nbhCtrl.choroLayer.getSource().getFeatures().filter(function(f){
                    return f.getProperties().district_code == record.data.code;
                });
            assignment.app.nbhCtrl.userEvent = false;
            assignment.app.nbhCtrl.onMouseOverFeature.getFeatures().push(currentFeature[0]);  
        };
        /*---*/
        function onMouseMove(){
            barTooltip
                .style("top", (d3.event.pageY-25)+"px")
                .style("left", (d3.event.pageX+10)+"px");
        };
        /*---*/
        function onMouseOutOfChart(record){
            d3.select('#bar_' + record.data.code)
                .style("stroke", "#AAA")
                .style("stroke-width", 1)
                .style("fill-opacity", 0.4);
 
            assignment.app.nbhCtrl.refreshPieChart(
                assignment.app.nbhCtrl.pieChart.cityTotals, 
                assignment.app.cityName
            );
 
            /* hide the tooltip */
            barTooltip.transition()
                .duration(1)
                .style("display", "none");
 
            /* remove highligthed feature from the map */
            assignment.app.nbhCtrl.onMouseOverFeature.getFeatures().clear();
            assignment.app.nbhCtrl.userEvent = true;
        };
        /*---*/  

        /* Bar chart margins and dimentions */
        bc.panel = Ext.getCmp(chartPanel); /* Reference to the bar chart container */
        bc.margin = {top: 30, right: 20, bottom: 50, left: 60};
        bc.width = bc.panel.getWidth() - bc.margin.left - bc.margin.right - 1;
        bc.height = bc.panel.getHeight() - bc.margin.top - bc.margin.bottom;
 
        /* Bar chart object */
        bc.obj = d3.select("#" + bc.panel.body.id).append("svg")
            .attr("id", "bar_chart")
            .attr("width", bc.width + bc.margin.left + bc.margin.right)
            .attr("height", bc.height + bc.margin.top + bc.margin.bottom)
          .append("g")
            .attr("transform", "translate(" + bc.margin.left + "," + bc.margin.top + ")");
 
        /* x & y functions */
        bc.x = d3.scaleBand().rangeRound([0, bc.width]).padding(0.1);
        bc.y = d3.scaleLinear().rangeRound([bc.height, 0]);
        bc.x.domain((neighbours.map(function(r) { return r.data.label; })).sort());
        bc.y.domain([0, d3.max(neighbours, function(r){ return r.data.pop_child; }) * 1.1]);
 
        /* Population bars */
        bc.obj.selectAll(".bar")
            .data(neighbours)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("id", function(r){ return "bar_" + r.data.code; })
            .attr("x", function(r){ return bc.x(r.data.label) + bc.x.bandwidth()*.2/2; })
            .attr("y", function(r){ return bc.y(r.data.pop_child); })
            .attr("width", bc.x.bandwidth()*.8)
            .attr("height", function(r){ return bc.height - bc.y(r.data.pop_child); })
            .style("stroke", "#AAA")
            .style("stroke-width", 1)
            .style("fill", "#CACCCE")
            .style("fill-opacity", 0.4) 
            .on("mouseover", onMouseOverChart)
            .on("mousemove", onMouseMove)
            .on("mouseout", onMouseOutOfChart);
 
        /* x axis */
        bc.obj.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + bc.height + ")")
            .call(d3.axisBottom(bc.x))
          .append("text")
            .attr("id", "bc_xaxis_label")
            .attr("x", bc.width/2)
            .attr("y", 35)
            .style("fill", "#404040")
            .style("font-size", "13px")
            .style("font-weight", 400)
            .style("text-anchor", "middle")
            .text("District Codes - (" + assignment.app.cityName + ")");
 
        /* y axis */
        bc.obj.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(bc.y))
          .append("text")
            .attr("id", "bc_yaxis_label")
            .attr("x", 5)
            .attr("y", -10)
            .style("fill", "#404040")
            .style("font-size", "13px")
            .style("font-weight", 400)
            .style("text-anchor", "start")
            .text("Number of Child Inhabitants (2013)(thousand)");

        return bc;
    },
    /*---*/

    drawBarChart_2: function(neighbours, chartPanel){
        var bc = new Object;
        bc.popBars = true; /* Boolean to control the type of data for the bars (pop/landuse) */
        var barTooltip = d3.select("body")
            .append("div")
            .attr("id", "bar-tooltip_2")
            .attr("class", "tooltip");
 
        /*---*/
        function onMouseOverChart(record){
            d3.select('#bar_' + record.data.code)
                .style("stroke", "#222")
                .style("stroke-width", 2)
                .style("fill-opacity", 0.9);
                
            assignment.app.nbhCtrl.refreshPieChart(record.data.marry_statu, record.data.name); 
 
            /* display tooltip including some record data */
            barTooltip.html('<b>'+record.data.name + '</b><br />' +
                Ext.util.Format.number(record.data.pop_hh,'0,000')+'&nbsp;households.'+'<br />'+
                Ext.util.Format.number(record.data.area_km2,'0,000')+'&nbsp;km&sup2;');
            barTooltip.transition()
                .duration(50)
                .style("display", "block")
                .style("opacity", 0.9);
 
            /* highlight the corresponding feature on the map */
            var currentFeature = 
                assignment.app.nbhCtrl.choroLayer.getSource().getFeatures().filter(function(f){
                    return f.getProperties().district_code == record.data.code;
                });
            assignment.app.nbhCtrl.userEvent = false;
            assignment.app.nbhCtrl.onMouseOverFeature.getFeatures().push(currentFeature[0]);  
        };
        /*---*/
        function onMouseMove(){
            barTooltip
                .style("top", (d3.event.pageY-25)+"px")
                .style("left", (d3.event.pageX+10)+"px");
        };
        /*---*/
        function onMouseOutOfChart(record){
            d3.select('#bar_' + record.data.code)
                .style("stroke", "#AAA")
                .style("stroke-width", 1)
                .style("fill-opacity", 0.4);
 
            /* hide the tooltip */
            barTooltip.transition()
                .duration(1)
                .style("display", "none");


            /* remove highligthed feature from the map */
            assignment.app.nbhCtrl.onMouseOverFeature.getFeatures().clear();
            assignment.app.nbhCtrl.userEvent = true;
        };
        /*---*/  

        /* Bar chart margins and dimentions */
        bc.panel = Ext.getCmp(chartPanel); /* Reference to the bar chart container */
        bc.margin = {top: 30, right: 20, bottom: 50, left: 60};
        bc.width = bc.panel.getWidth() - bc.margin.left - bc.margin.right - 1;
        bc.height = bc.panel.getHeight() - bc.margin.top - bc.margin.bottom;
 
        /* Bar chart object */
        bc.obj = d3.select("#" + bc.panel.body.id).append("svg")
            .attr("id", "bar_chart")
            .attr("width", bc.width + bc.margin.left + bc.margin.right)
            .attr("height", bc.height + bc.margin.top + bc.margin.bottom)
          .append("g")
            .attr("transform", "translate(" + bc.margin.left + "," + bc.margin.top + ")");
 
        /* x & y functions */
        bc.x = d3.scaleBand().rangeRound([0, bc.width]).padding(0.1);
        bc.y = d3.scaleLinear().rangeRound([bc.height, 0]);
        bc.x.domain((neighbours.map(function(r) { return r.data.label; })).sort());
        bc.y.domain([0, d3.max(neighbours, function(r){ return r.data.pop_hh; }) * 1.1]);
 
        /* Population bars */
        bc.obj.selectAll(".bar")
            .data(neighbours)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("id", function(r){ return "bar_" + r.data.code; })
            .attr("x", function(r){ return bc.x(r.data.label) + bc.x.bandwidth()*.2/2; })
            .attr("y", function(r){ return bc.y(r.data.pop_hh); })
            .attr("width", bc.x.bandwidth()*.8)
            .attr("height", function(r){ return bc.height - bc.y(r.data.pop_hh); })
            .style("stroke", "#AAA")
            .style("stroke-width", 1)
            .style("fill", "#CACCCE")
            .style("fill-opacity", 0.4) 
            .on("mouseover", onMouseOverChart)
            .on("mousemove", onMouseMove)
            .on("mouseout", onMouseOutOfChart);
 
        /* x axis */
        bc.obj.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + bc.height + ")")
            .call(d3.axisBottom(bc.x))
          .append("text")
            .attr("id", "bc_xaxis_label")
            .attr("x", bc.width/2)
            .attr("y", 35)
            .style("fill", "#404040")
            .style("font-size", "13px")
            .style("font-weight", 400)
            .style("text-anchor", "middle")
            .text("District Codes - (" + assignment.app.cityName + ")");
 
        /* y axis */
        bc.obj.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(bc.y))
          .append("text")
            .attr("id", "bc_yaxis_label_2")
            .attr("x", 5)
            .attr("y", -10)
            .style("fill", "#404040")
            .style("font-size", "13px")
            .style("font-weight", 400)
            .style("text-anchor", "start")
            .text("Total Number of Households (2013)(thousand)");

        return bc;
    }
    /*---*/

});
/*--- ---*/