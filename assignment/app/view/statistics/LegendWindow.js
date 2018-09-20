/*--- Legend window ---*/

"use strict";

Ext.define('assignment.view.statistics.LegendWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.legendwindow',

    layout: 'fit',
    padding: 12,
    border: false,
    header: false,
    closable: false,
    resizable: false,    
    style: {
        border: 'solid 1px #cccccc'
    }
});