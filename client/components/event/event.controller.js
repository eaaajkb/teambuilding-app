angular.module('leukemiapp').controller('frontpageController', FrontpageController);

function FrontpageController($scope, $rootScope, $reactive, $ionicModal, $ionicNavBarDelegate, $location, WizardStateAccessor, $timeout, SessionSetting) {
    $reactive(this).attach($scope);
    var vm = this;

    vm.event = SessionSetting.getValue('event');
    vm.currentDate = Date.now();

    function getModules() {
        // get IDs of modules from completed registrations of a particular user
        var reg = Registrations.find({
                $and: [
                    {moduleId: {$exists: true}},
                    {createdBy: Meteor.userId()},
                    {createdBy: {$exists: true}}
                ]
            },
            {moduleId: 1, _id: 0} // projection is not working
        ).fetch();
        reg = _.pluck(reg, 'moduleId');
        reg = _.uniq(reg);

        var now = new Date();

        return CustomModules.find(
            {
                _id: {$nin: reg}, // filter already filled in
                eventId: vm.event._id,
                startTime: {$lte: now, $exists: true},
                endTime: {$gte: now, $exists: true}
            },
            {sort: {number: 1}}
        ).fetch();
    };

    vm.futureModules = function () {
        var now = new Date();

        return CustomModules.find(
            {
                eventId: vm.event._id,
                startTime: {$gt: now, $exists: true},
            }
        ).count();
    };

    vm.countAllModules = function () {
        return CustomModules.find(
            {
                eventId: vm.event._id
            }
        ).count();
    };

    vm.nextTime = function () {
        var now = new Date();

        return CustomModules.findOne(
            {
                eventId: vm.event._id,
                startTime: {$gt: now, $exists: true},
            }
        ).startTime;
    };


    vm.refresh = function () {
        vm.modules = getModules();
        console.log(JSON.stringify(vm.modules));
        $scope.$broadcast('scroll.refreshComplete');
    }

    //Code to be run every time view becomes visible
    //----------------------------------------------
    $scope.$on('$ionicView.beforeEnter', function (event, data) {
        vm.autorun(() => {
            var now = new Date();

            vm.subscribe('modulesAndRegistrations',
                () => [],
                () => {
                    console.log('Subscription ready for modules and registrations!');
                    vm.modules = getModules();
                    console.log(JSON.stringify(vm.modules));
                });
        });
    });

    $scope.$on('$ionicView.enter', function () {
        $timeout(function () {
            $ionicNavBarDelegate.align('center');
        });
    });

    vm.backToLogout = function () {
        Meteor.logout(function () {
            SessionSetting.clearAllValues()

            $location.path("app/login");
        });
    };

    vm.backToEvents = function () {
        SessionSetting.setValue('eventId', null);
        SessionSetting.setValue('event', null);

        $location.path("app/eventselect");
    };


    Meteor.subscribe("settings", function () {
        var analyticsSettings = Settings.findOne({key: 'analytics'});
        console.log("Analytics settings", analyticsSettings);
        if (!!analyticsSettings.value) {
            console.log("turning on analytics");
            $rootScope.$on('$stateChangeSuccess', function (event, toState) {
                $timeout(function () {
                    var type = "", title = "";

                    if (toState.url == "/questionwizard") {
                        type = SessionSetting.getValue('registrationType');
                        title = SessionSetting.getValue('registrationType');
                    }
                    else {
                        title = "How-R-you";
                    }
                    console.log(toState.url + "/" + type + " | " + title);

                    analytics.page(title, {
                        title: title,
                        path: toState.url + "/" + type
                    });
                });
            });
        }
        else console.log("turning off analytics");
    });


    vm.newRegistration = (moduleIndex) => {
        var module = vm.modules[moduleIndex];

        if (module == null) {
            console.error("Module index " + moduleIndex + " not found");
            return;
        }

        SessionSetting.setValue('registrationType', module._id);
        WizardStateAccessor.setRegistration(module._id, undefined);
        SessionSetting.setValue('updating', undefined);
        $location.path("app/questionwizard");
    };


    //Settings for turning modules on/off

    $ionicModal.fromTemplateUrl("client/components/settings/settings.html", {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        vm.modal = modal;
        $scope.modal = modal;
    });

    vm.openModal = function () {
        vm.modal.show();
    };

    $scope.closeModal = function () {
        vm.modal.hide();
        console.log('activeModules at vm.closeModal: ', vm.modules);
    };

    $scope.$on('modal.hidden', function () {
        console.log('activeModules at modal.hidden', vm.modules);
        refreshModules();
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        console.log('activeModules at modal.removed', vm.modules);
    });
}

