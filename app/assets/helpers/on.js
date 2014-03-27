angular.module('Helpers')
    .directive('onFocusChanged',
        ['$timeout',
            function($timeout) {
                return {                
                    restrict: 'A',
                    link: function ($scope, element, attrs) {
                        var safeApply = function(fn) {
                            // Safest and most future proof way of
                            // calling $apply safely;
                            $timeout(fn);
                        }
                        var onChanged = function(changedTo) {
                            var onChangedFn = $scope.$eval(attrs.onFocusChanged);
                            if (angular.isDefined(onChangedFn)) {
                                safeApply(function() {
                                    onChangedFn(changedTo);
                                });
                            }
                        };
                        element.focusin(function () {
                            onChanged(true);
                        });
                        element.focusout(function () {
                            onChanged(false);
                        });
                    },
                };
            }]);