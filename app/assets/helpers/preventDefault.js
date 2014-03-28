angular.module('Helpers')
	.directive('preventDefault', function() {
	    return {
	    	restrict: 'A',
	    	link: function(scope, element, attrs) {
		        element.click(function(event) {
		            event.preventDefault();
		        });
		    }
	    } 
	});