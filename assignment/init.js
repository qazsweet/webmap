/*--- assignment - Application launcher script ---*/

"use strict";

Ext.application({
    name: 'assignment',
    extend: 'assignment.Application',

    requires: [
        'assignment.view.home.HomeView'
    ],

    /* The class name of the View that will be lauched when the applicatin starts. */
    mainView: 'assignment.view.home.HomeView'
});
/*--- ---*/