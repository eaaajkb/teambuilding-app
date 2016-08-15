angular.module('leukemiapp').controller('mucositisController', MucositisController);

function MucositisController($scope, $reactive) {
   $reactive(this).attach($scope);
   var vm = this;

   var module = Modules[3];

   //Init
   vm.registration = Session.get('registration');

   if (vm.registration.diagnosis === undefined) {
      vm.registration.diagnosis = [];
      vm.registration.nauseaScore = 0;
      Session.set('registration', vm.registration);
   }

   vm.setDiagnosis = function (number, value) {
      vm.registration.diagnosis[number] = value;
      switch (number) {
         case 0:
            vm.registration.pain = value;
            break;
         case 1:
            vm.registration.ulcers = value;
            break;
         case 2:
            vm.registration.food = value;
      }
      updateRegistration();
   };

   $scope.$watch(
      function nauseaScore(scope) {
         return vm.registration.nauseaScore;
      },
      function (newValue, oldValue) {
         updateRegistration()
      }
   );

   function validateData() {
      var validated = Session.get('regValidated');
      if (validated === undefined)
         validated = [];

      validated[0] = vm.registration.timestamp !== undefined;
      for (i = 0; i < module.wizard.steps.length; i++) {
         validated[i + 1] = module.wizard.steps[i].validation(vm.registration);
      }

      Session.set('regValidated', validated);
      console.log('regValidated session variable updated')
   }

   function updateRegistration() {
      validateData();
      vm.registration.nauseaScore = parseInt(vm.registration.nauseaScore);
      Session.set('registration', vm.registration);
      console.log('Registration updated');
      console.log(vm.registration);
   }

   //Rzslider test
   vm.slider = {
      value: 0,
      options: {
         floor: 0,
         ceil: 10,
         step: 0.5,
         precision: 1,
         hideLimitLabels: true
      }
   }
}