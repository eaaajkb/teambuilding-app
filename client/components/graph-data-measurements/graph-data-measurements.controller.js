angular.module('leukemiapp').controller('graphDataMeasurementsController', GraphDataMeasurementsController);

function GraphDataMeasurementsController($scope, $reactive, $timeout, $ionicActionSheet, $translate, $location, WizardStateAccessor) {
    $reactive(this).attach($scope);
    var vm = this;

    //Subscriptions
    //-------------
    $scope.$on('$ionicView.beforeEnter', function (event, data) {
        vm.autorun(() => {
            vm.subscribe('smartWatchView',
                () => [vm.getReactively('dataType')], //, vm.getReactively('startTimeStamp'), vm.getReactively('endTimeStamp')
                {
                    onReady: () => {
                        processData();
                    }
                }
            );
        });
    });

    //Code to be run every time view becomes visible
    //----------------------------------------------
    $scope.$on('$ionicView.beforeEnter', function (event, data) {
        processData();
    });

    //Init
    //----------
    vm.dataType = Session.get('graphDataType');
    vm.viewTitle = $translate.instant(vm.dataType);


    if (!vm.endTimeStamp || !vm.startTimeStamp) {
        vm.endTimeStamp = new Date();
        vm.startTimeStamp = new Date();
        vm.startTimeStamp.setMonth(vm.startTimeStamp.getMonth() - 1);
    }

    //Stores property names, colors, and visibility attributes
    // object = { name: String, color: String, visible: bool }
    vm.graphProperties = [];

    //Helpers
    //-------
    vm.helpers({
        isSmallScreen: () => {
            return window.innerWidth < 768;
        }
    });

    //Init of date- and timepickers
    //-----------------------------
    if (vm.startTimePickerObject == null) {
        vm.startTimePickerObject = {
            displayValue: function () {
                return formatTime(vm.startTimePickerObject.inputEpochTime);
            },
            inputEpochTime: ((vm.startTimeStamp ? vm.startTimeStamp : new Date()).getHours() * 60 * 60 +
            Math.floor((vm.startTimeStamp ? vm.startTimeStamp : new Date()).getMinutes() / 5) * 5 * 60),  //Optional
            step: 5,  //Optional
            format: 24,  //Optional
            titleLabel: $translate.instant('graphData.timestamp'),  //Optional
            setLabel: $translate.instant('graphData.choose'),  //Optional
            closeLabel: $translate.instant('graphData.close'),  //Optional
            setButtonType: 'button-positive',  //Optional
            closeButtonType: 'button-stable',  //Optional
            callback: function (val) {    //Mandatory
                if (val) {
                    vm.startTimePickerObject.inputEpochTime = val;
                    vm.updateStartTimeStamp();
                }
            }
        }
    }
    if (vm.startDatepickerObject == null) {
        vm.startDatepickerObject = {
            titleLabel: $translate.instant('graphData.date'),  //Optional
            todayLabel: $translate.instant('graphData.today'),  //Optional
            closeLabel: $translate.instant('graphData.close'),  //Optional
            setLabel: $translate.instant('graphData.choose'),  //Optional
            setButtonType: 'button-positive',  //Optional
            todayButtonType: 'button-stable',  //Optional
            closeButtonType: 'button-stable',  //Optional
            inputDate: (vm.startTimeStamp ? vm.startTimeStamp : new Date()),  //Optional
            mondayFirst: true,  //Optional
            //disabledDates: disabledDates, //Optional
            weekDaysList: $translate.instant('weekdaysShortList').split("_"), //Optional
            monthList: $translate.instant('monthsList').split("_"), //Optional
            templateType: 'popup', //Optional
            showTodayButton: 'true', //Optional
            modalHeaderColor: 'bar-positive', //Optional
            modalFooterColor: 'bar-positive', //Optional
            //from: new Date(2012, 8, 2), //Optional
            //to: new Date(2018, 8, 25),  //Optional
            dateFormat: 'dd-MM-yyyy', //Optional
            closeOnSelect: false, //Optional
            callback: function (val) {  //Mandatory
                if (val) {
                    vm.startDatepickerObject.inputDate = val;
                    vm.updateStartTimeStamp();
                }
            }
        };
    }
    if (vm.endTimePickerObject == null) {
        vm.endTimePickerObject = {
            displayValue: function () {
                return formatTime(vm.endTimePickerObject.inputEpochTime);
            },
            inputEpochTime: ((vm.endTimeStamp ? vm.endTimeStamp : new Date()).getHours() * 60 * 60 +
            Math.floor((vm.endTimeStamp ? vm.endTimeStamp : new Date()).getMinutes() / 5) * 5 * 60),
            step: 5,  //Optional
            format: 24,  //Optional
            titleLabel: $translate.instant('graphData.timestamp'),  //Optional
            setLabel: $translate.instant('graphData.choose'),  //Optional
            closeLabel: $translate.instant('graphData.close'),  //Optional
            setButtonType: 'button-positive',  //Optional
            closeButtonType: 'button-stable',  //Optional
            callback: function (val) {    //Mandatory
                if (val) {
                    vm.endTimePickerObject.inputEpochTime = val;
                    vm.updateEndTimeStamp();
                }
            }
        };
    }
    if (vm.endDatepickerObject == null) {
        vm.endDatepickerObject = {
            titleLabel: $translate.instant('graphData.date'),  //Optional
            todayLabel: $translate.instant('graphData.today'),  //Optional
            closeLabel: $translate.instant('graphData.close'),  //Optional
            closeLabel: $translate.instant('graphData.close'),  //Optional
            setLabel: $translate.instant('graphData.choose'),  //Optional
            setButtonType: 'button-positive',  //Optional
            todayButtonType: 'button-stable',  //Optional
            closeButtonType: 'button-stable',  //Optional
            inputDate: (vm.endTimeStamp ? vm.endTimeStamp : new Date()),  //Optional
            mondayFirst: true,  //Optional
            //disabledDates: disabledDates, //Optional
            weekDaysList: $translate.instant('weekdaysShortList').split("_"), //Optional
            monthList: $translate.instant('monthsList').split("_"), //Optional
            templateType: 'popup', //Optional
            showTodayButton: 'true', //Optional
            modalHeaderColor: 'bar-positive', //Optional
            modalFooterColor: 'bar-positive', //Optional
            //from: new Date(2012, 8, 2), //Optional
            //to: new Date(2018, 8, 25),  //Optional
            dateFormat: 'dd-MM-yyyy', //Optional
            closeOnSelect: false, //Optional
            callback: function (val) {  //Mandatory
                if (val) {
                    vm.endDatepickerObject.inputDate = val;
                    vm.updateEndTimeStamp();
                }
            }
        };
    }

    function formatTime(inputEpochTime) {
        var selectedTime = new Date(inputEpochTime * 1000);
        var hours = selectedTime.getUTCHours();
        var minutes = selectedTime.getUTCMinutes();
        return (hours < 10 ? '0' : '') + hours + ' : ' + (minutes < 10 ? '0' : '') + minutes;
    }

    vm.updateStartTimeStamp = function () {
        var date = vm.startDatepickerObject.inputDate;
        var hours = Math.floor(vm.startTimePickerObject.inputEpochTime / 3600);
        var minutes = Math.floor((vm.startTimePickerObject.inputEpochTime - hours * 3600) / 60);
        date.setHours(hours, minutes, 0, 0);
        vm.startTimeStamp = new Date(date.getTime());
    };

    vm.updateEndTimeStamp = function () {
        var date = vm.endDatepickerObject.inputDate;
        var hours = Math.floor(vm.endTimePickerObject.inputEpochTime / 3600);
        var minutes = Math.floor((vm.endTimePickerObject.inputEpochTime - hours * 3600) / 60);
        date.setHours(hours, minutes, 0, 0);
        vm.endTimeStamp = new Date(date.getTime());
    };

    function getDataForPeriod() {
        var r = SmartWatchView.findOne({});
        console.log("getperiod");
        console.log(r);
        return r;

        /*return Registrations.find({
         $and: [
         {moduleName: vm.dataType},
         {timestamp: {$exists: true}},
         {
         timestamp: {
         $gte: vm.getReactively('startTimeStamp'),
         $lte: vm.getReactively('endTimeStamp')
         }
         }
         ]
         }, {
         sort: {timestamp: -1}
         }).fetch();*/
    }

    //Table display helper methods
    //----------------------------
    function processData() {
        vm.tableObject = {};
        vm.graphProperties = [];

        //Add any properties to be ignored from table/graph display
        var ignoredProperties = [
            'date', 'userId', 'device', 'timestamp', 'B'
        ];

        var data = getDataForPeriod();
        data = data.data;
        if (data[0] != null) {

            //Generating table object by extracting data
            //object = { 'property': [value, value, value ...], ... }
            vm.tableObject['timestamp'] = _.pluck(data, 'timestamp');
            vm.tableObject['timestamp'].forEach(function (timestamp, index) {
                    var value = vm.tableObject['timestamp'][index];
                    vm.tableObject['timestamp'][index] = Date.parse(value);
                });

            var propertyIndex = 0;
            for (var property in data[0]) {
                if (data[0].hasOwnProperty(property) && !_.contains(ignoredProperties, property)) {
                    //Setup table object
                    vm.tableObject[property] = _.pluck(data, property);

                    //Setup graph object
                    // _.every *
                    // * Returns true if all of the values in the list pass the predicate truth test
                    var isPropertyDisabled = _.every(vm.tableObject[property],
                        (property) => {
                            var isProperty = property != null;

                            //property value invalid if string or array or null
                            return typeof property == 'string' || $.isArray(property) || !isProperty;
                        });
                    var graphProperty = {
                        name: property,
                        color: vm.colors[propertyIndex],
                        visible: false,
                        disabled: isPropertyDisabled    //graph disabled for string values
                    };
                    vm.graphProperties.push(graphProperty);
                    propertyIndex++;
                }
            }
            console.log('vm.tableObject is ', vm.tableObject);
            console.log('vm.graphProperties is ', vm.graphProperties);


            //Setup graph by updating datasource
            vm.graphData = generateGraphData();

        } else {
            console.log('No data found :(');
            vm.tableObject = undefined;
            vm.graphProperties = undefined;
            vm.graphData = [];
        }
    }

    //Init of graph options
    //---------------------

    //Colors
    vm.colors = [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf",
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf",
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf"
    ];

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    //Options
    vm.graph = {};
    vm.graph.options = {
        chart: {
            type: 'lineChart',
            height: window.innerHeight / 2,
            showLegend: false,
            interpolate: 'linear',
            noData: $translate.instant('graphData.noData'),
            margin: {
                top: 30,
                right: 30,
                bottom: 30,
                left: 50
            },
            transitionDuration: 500,
            xAxis: {
                tickFormat: function (d) {
                    if (d == null) {
                        return 'N/A';
                    }
                    return d3.time.format('%d/%m')(new Date(d));
                }
            },
            yAxis: {
                tickFormat: function (d) {
                    if (!d)if (d == null) {
                        return 'N/A';
                    }
                    return d3.format('.0f')(d);
                }
            }
        }
    };
    vm.graph.config = {
        visible: true, // default: true
        extended: false, // default: false
        disabled: false, // default: false
        autorefresh: true, // default: true
        refreshDataOnly: true, // default: true
        deepWatchOptions: true, // default: true
        deepWatchData: true, // default: false
        deepWatchConfig: true, // default: true
        debounce: 10 // default: 10
    };

    function generateGraphData() {
        var data = [];
        if (vm.graphProperties != null && vm.graphProperties.length > 0) {

            var propertyToShow = _.find(vm.graphProperties, (p) => {
                return p.visible;
            });

            //sets default to first if none
            if (propertyToShow == null) {
                propertyToShow = _.find(vm.graphProperties, (property) => {
                    return property.disabled == false;
                });
                if (propertyToShow == null) {
                    vm.graphData = [];
                } else {
                    propertyToShow.visible = true;
                }
            }

            var graphLine = [];
            if (vm.tableObject != null) {

                var timestampValues = vm.tableObject['timestamp'];
                var propertyValues = vm.tableObject[propertyToShow.name];

                if (Array.isArray(timestampValues) && Array.isArray(propertyValues) && timestampValues.length == propertyValues.length) {

                    //Data found!
                    timestampValues.forEach(function (timestamp, index, array) {
                        var value = propertyValues[index];
                        if (typeof value == 'number' && !isNaN(value) && timestamp) {
                            graphLine.push({
                                x: timestamp,
                                y: value
                            });
                        }
                    });

                } else {
                    console.log('timestampValues or propertyValues is null or undefined!');
                    return [];
                }

            } else {
                console.log('vm.tableObject is null or undefined!');
                return [];
            }

            data.push({
                color: propertyToShow.color,
                values: graphLine
            });

        }

        return data;
    }

    vm.showPropertyGraph = (propertyName) => {

        var propertyToHide = _.find(vm.graphProperties, (p) => {
            return p.visible;
        });

        if (propertyToHide != null) {
            propertyToHide.visible = false;
        } else {
            console.log('No property to hide!');
        }

        var propertyToShow = _.find(vm.graphProperties, (p) => {
            return p.name === propertyName;
        });

        if (propertyToShow != null) {
            propertyToShow.visible = true;
        } else {
            console.log('No matching property to show found for ', propertyName);
        }

        vm.graphData = generateGraphData();
    };

    //Color settings for background and buttons
    //-----------------------------------------

    vm.btnBackground = (property) => {
        var hex = property.color;
        var selected = property.visible;

        var background;
        if (selected) {
            background = 'rgba(' + hexToRgb(hex).r + ',' + hexToRgb(hex).g + ',' + hexToRgb(hex).b
                + ',' + '0.6)';
        } else {
            background = 'rgba(230,230,230,0.6)';
        }

        return background;
    };

    vm.rowBackground = (propertyName) => {

        if (propertyName !== 'timestamp') {
            var property = _.find(vm.graphProperties, (p) => {
                return p.name === propertyName;
            });

            var background;
            if (property != null) {

                var hex = property.color;
                background = 'rgba(' + hexToRgb(hex).r + ',' + hexToRgb(hex).g + ',' + hexToRgb(hex).b
                    + ',' + '0.1)';

            } else {
                console.log('No matching property found for ', propertyName);
            }

            return background;
        } else {
            //console.log('Running vm.rowBackground for property timestamp!');
        }
    };



    $scope.$watch(
        function () {
            return vm.graphData;
        },
        function (newValue, oldValue) {
            console.log('vm.graphData is ', newValue);
            vm.isData = Array.isArray(newValue) && newValue.length > 0;
        }
    );
}

