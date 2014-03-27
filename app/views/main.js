'use strict';

angular.module('autocompleteApp')
  .controller('MainCtrl', function ($scope) {
  	$scope.selectedItems = [];

  	$scope.multiInputItems = [];


  	$scope.customisedSelectedItems = [];
  	$scope.customisedItems = [
  		{ name: 'Fred' },
  		{ name: 'Brabra' },
  		{ name: 'Gomez' },
  	];
    $scope.customisedOptions = {
      disableCreate: true,
    };
  });
