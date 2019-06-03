# webmap
interact
visit the web through
https://gisedu.itc.utwente.nl/student/s6035280/assignment/

##1.	Web application description

Zwolle is selected as area of interest in this application. It is shown as web atlas mainly about childhood. Landuse, population of different marriage status and transport are chosen as indicators to show the influences of childhood.

The page named ‘Marriage status and children’ depicts the relationship between population of Children, number of households and marriage status. Two bar charts display the number of children and number of households, which are absolute data, in district level. The pie chart displays the percentage of different marriage status, which are relative data. Through the interaction of pie chart, users could know the population under different marriage status in different district shown in bar chart above and in base map using choropleth. The bar chart allows users to interact to show certain district’s marriage status distribution.

The page named ‘Basic Statistics’ shows the relationship between population and landuse in district level. Through the interaction of bar chart, landuse of certain district is shown in pie chart. While interacting with pie chart, area of certain landuse class in different district is shown in bar chart.

The page named ‘Public Transport’ depicts clearly the distribution of stations and the boundary of each district.

##2.	Application design and architecture

For design, this application uses an interface with three tabs, each of which provides access to a specific type of content, one tab for landuse data, one tab for marriage status data and one tab for transport data.

For application architecture, the base JavaScript library used, ExtJS, follows a unified directory structure that is the same for every application. Therefore, application code components are placed inside folders, named after the actual name of the application, which conversely contains sub-folders to namespace models, views, controllers and stores. To be in conformity with the functionality and usability of the application, it is called as assignment. Inside this folder we will encapsulate all the components of the application. 

##3.	Back-end (server-side) services

According to above description, the requirement of the useful data and data type need to be decided. Tile map published cbs through nationaalgeoregister website is used as base map and features.
