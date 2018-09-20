/* Colors store */
Ext.define('assignment.store.Colors', {
    extend: 'Ext.data.Store',

    alias: 'store.colors',
    storeId: 'colors',

    model: 'assignment.model.Color',

    data : [{
        group: 'g1', /*red*/
        stroke: '#d41811', 
        fill: '#ec1a13', 
        tints: ['#f9bab8', '#f47671', '#f15854', '#ec1a13'] 
    },{
        group: 'g2', /*orange*/
        stroke: '#e65c00', 
        fill: '#ff6600', 
        tints: ['#ffc299', '#ffa366', '#ff8533', '#ff6600'] 
    },{
        group: 'g3', /*brown*/
        stroke: '#734d26', 
        fill: '#996633', 
        tints: ['#e6ccb3', '#d9b38c', '#cc9966', '#bf8040'] 
    },{
        group: 'g4', /*light-green*/
        stroke: '#33cc00', 
        fill: '#39e600', 
        tints: ['#d9ffcc', '#8cff66', '#53ff1a', '#39e600'] 
    },{
        group: 'g5', /*yellow*/
        stroke: '#e6b800', 
        fill: '#ffcc00', 
        tints: ['#fff5cc', '#ffeb99', '#ffdb4d', '#ffcc00'] 
    },{
        group: 'g6', /*green*/
        stroke: '#3c9043', 
        fill: '#4bb454', 
        tints: ['#c9e8cc', '#a5d9a9', '#6fc376', '#4bb454'] 
    },{
        group: 'g7', /*blue*/
        stroke: '#005fb3', 
        fill: '#0088ff', 
        tints: ['#e6f3ff', '#99cfff', '#4dacff', '#0088ff']      
    },{
        group: 'g8', /*cyan*/
        stroke: '#00b3b3', 
        fill: '#00cccc', 
        tints: [ ] 
    },{
        group: 'g9', /*purple*/
        stroke: '#b034b2', 
        fill: '#c94dcb', 
        tints: [ ]  
    }]
});