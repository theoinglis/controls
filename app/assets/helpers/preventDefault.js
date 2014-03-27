angular.module('Helpers')
	.directive('preventDefault', function() {
	    return function(scope, element, attrs) {
	        element.click(function(event) {
	            event.preventDefault();
	        });
	    }
	})