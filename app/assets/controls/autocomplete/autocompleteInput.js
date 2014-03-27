angular.module('Controls')
    .controller('AutocompleteInputController',
        ['$scope', '$filter', '$timeout',
            function($scope, $filter, $timeout) {

                var filter = $filter('filter');
                var orderBy = $filter('orderBy');

                var setFilteredItems = function() {
                    $scope.filteredItems = orderBy(filter($scope.items, $scope.selectedItemText), $scope.propName);
                    $scope.noItems = $scope.filteredItems.length === 0;
                    refreshShouldShow();
                };
                $scope.$watch('selectedItemText.length', function () {
                    if (!$scope.isDefined($scope.selectedItem)
                        || $scope.selectedItemText !== $scope.selectedItem[$scope.propName]) {
                        $scope.selectedItem = {};
                    }
                    setFilteredItems();
                });
                $scope.$watch('items.length', setFilteredItems);

                var refreshShouldShow = function() {
                    var hasItems = !$scope.noItems;
                    var canCreate = !$scope.disableCreate && $scope.isDefined($scope.selectedItemText) && $scope.selectedItemText !== '';
                    if (isFocused) {
                        $scope.isShowing = hasItems || canCreate;
                    } else {
                        // Firefox closes before the button is clicked so a delay is needed before the menu is closed
                        $timeout(function() {
                            if (!isFocused) {
                                $scope.isShowing = false;
                            }
                        }, 100);
                    }
                };

                var isFocused;
                $scope.onFocused = function(newIsFocused) {
                    isFocused = newIsFocused;
                    refreshShouldShow();
                };

                var navigateHighlight = {
                    reset: function() {
                        $scope.highlightPos = 0;
                    },
                    next: function(){
                        if (0 <= $scope.highlightPos
                            && $scope.highlightPos < ($scope.filteredItems.length - 1))
                            $scope.highlightPos++;
                        else this.reset();
                    },
                    back: function() {
                        if ($scope.highlightPos === 0) {
                            $scope.highlightPos = $scope.filteredItems.length - 1;
                        } else if ($scope.highlightPos > 0
                            && $scope.highlightPos < $scope.filteredItems.length)
                            $scope.highlightPos--;
                        else this.reset();
                    },
                    getHighlightedItem: function() {
                        if (0 <= $scope.highlightPos 
                            && $scope.highlightPos < $scope.filteredItems.length){
                            return $scope.filteredItems[$scope.highlightPos];
                        } else if ($scope.filteredItems.length > 0) {
                            return $scope.filteredItems[0];
                        } else return null;
                    },
                };
                navigateHighlight.reset();

                var isKeyCode = function(e, id) {
                    return (e.which && e.which == id) || (e.keyCode && e.keyCode == id)
                }
                $scope.onKeyup = function (e) {
                    // On Enter
                    if (isKeyCode(e, 13)) { // Return
                        var highlightedItem = navigateHighlight.getHighlightedItem();
                        if (highlightedItem !== null) {
                            $scope.select(highlightedItem);
                        } else if ($scope.selectedItemText) {
                            $scope.createAndSelect($scope.selectedItemText);
                        }
                    } else if (isKeyCode(e, 38)) { // up
                        navigateHighlight.back();
                    } else if (isKeyCode(e, 40)) { // down
                        navigateHighlight.next();
                    }
                };
            }])
    .directive('autocompleteInput',
        ['$timeout',
            function($timeout) {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        selectedItemText: '=',
                        selectedItem: '=',
                        items: '=',
                        propName: '@',
                        externalSelect: '=select',
                        externalCreate: '=create',
                        isShowing: '=',
                        placeholder: '@',
                        closeOnSelect: '@',
                        disableCreate: '@',
                    },
                    controller: 'AutocompleteInputController',
                    templateUrl: '/assets/controls/autocomplete/autocompleteInput.html',
                    link: function($scope, element, attrs) {
                        var input = element.find('.autocomplete-input');
                        $scope.focusOnInput = function() {
                            input.focus();
                        };
                        $scope.blur = function() {
                            document.activeElement.blur();
                            $timeout(function() { $scope.onFocused(false); });
                        };
                        $scope.isDefined = function(item) {
                            return item !== undefined && item !== null;
                        };

                        // Initialise
                        if (!$scope.isDefined($scope.items)) {
                            $scope.items = [];
                        }
                        $scope.createAndSelect = function(itemName) {
                            var createdItem = $scope.create(itemName);
                            $scope.select(createdItem);
                        };
                        $scope.create = function(itemName) {
                            if ($scope.disableCreate) return;

                            if ($scope.isDefined($scope.externalCreate)) {
                                return $scope.externalCreate(itemName);
                            } else {
                                var createdItem = {};
                                createdItem[$scope.propName] = itemName;
                                $scope.items.push(createdItem);
                                return createdItem;
                            }
                        };
                        $scope.select = function (item) {
                            if (!$scope.isDefined(item)) return;

                            if ($scope.isDefined($scope.externalSelect)) {
                                $scope.externalSelect(item);
                            } else {
                                $scope.selectedItem = item;
                                $scope.selectedItemText = $scope.isDefined($scope.selectedItem)
                                    ? $scope.selectedItem[$scope.propName]
                                    : '';
                            }
                            
                            $scope.onSelected(item);
                        };
                        
                        $scope.onSelected = function () {
                            if (!$scope.closeOnSelect) {
                                $scope.focusOnInput();
                            } else {
                                $scope.blur();
                            }
                        };
                    }
                };
            }]);