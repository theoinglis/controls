'use strict';

angular.module('autocompleteApp')
  .controller('MainCtrl', function ($scope) {
  	$scope.selectedItems = [];

  	$scope.multiInputItems = [];


  	$scope.customisedSelectedItems = [];
  	$scope.customisedItems = [
  		{ Name: 'Fred' },
  		{ Name: 'Brabra' },
  		{ Name: 'Gomez' },
  	];
    $scope.customisedOptions = {
      disableCreate: true,
    };
  });
