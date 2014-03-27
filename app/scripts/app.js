'use strict';

angular.module('autocompleteApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'Helpers',
  'Controls'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });


angular.module('Helpers', []);
angular.module('Controls', []);