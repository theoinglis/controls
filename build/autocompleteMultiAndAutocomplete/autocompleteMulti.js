angular.module('Controls')
    .controller('AutocompleteInputController',
        ['$scope', '$filter', '$timeout',
            function($scope, $filter, $timeout) {

                var filter = $filter('filter');
                var orderBy = $filter('orderBy');

                var setFilteredItems = function() {
                    $scope.filteredItems = orderBy(filter($scope.items, $scope.options.selectedItemText), $scope.options.propName);
                    $scope.noItems = $scope.filteredItems.length === 0;
                    refreshShouldShow();
                };
                $scope.$watch('options.selectedItemText.length', function () {
                    if (!$scope.isDefined($scope.options.selectedItem)
                        || $scope.options.selectedItemText !== $scope.selectedItem[$scope.options.propName]) {
                        $scope.selectedItem = {};
                    }
                    setFilteredItems();
                });
                $scope.$watch('items.length', setFilteredItems);

                var refreshShouldShow = function() {
                    var hasItems = !$scope.noItems;
                    var canCreate = !$scope.options.disableCreate && $scope.isDefined($scope.options.selectedItemText) && $scope.options.selectedItemText !== '';
                    if (isFocused) {
                        $scope.options.isShowing = hasItems || canCreate;
                    } else {
                        // Firefox closes before the button is clicked so a delay is needed before the menu is closed
                        $timeout(function() {
                            if (!isFocused) {
                                $scope.options.isShowing = false;
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
                        } else if ($scope.options.selectedItemText) {
                            $scope.createAndSelect($scope.options.selectedItemText);
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
                        selectedItem: '=',
                        items: '=',
                        userOptions: '=options',
                    },
                    controller: 'AutocompleteInputController',
                    templateUrl: '/assets/controls/autocomplete/autocompleteInput.html',
                    link: function($scope, element, attrs) {

                        var setOptions = function(userOptions) {
                            var newOptions = $.extend({}, {
                                selectedItemText: '',
                                propName: 'name',
                                isShowing: false,
                                placeholder: '',
                                closeOnSelect: true,
                                disableCreate: false,
                                // select: <- If undefined will use default select action
                                // create: <- If undefined will use default create action
                            }, userOptions);
                            $scope.options = $.extend(userOptions, newOptions);
                        }
                        setOptions();
                        $scope.$watch('userOptions', setOptions);

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
                            if ($scope.options.disableCreate) return;

                            if ($scope.isDefined($scope.options.create)) {
                                return $scope.options.create(itemName);
                            } else {
                                var createdItem = {};
                                createdItem[$scope.options.propName] = itemName;
                                $scope.items.push(createdItem);
                                return createdItem;
                            }
                        };
                        $scope.select = function (item) {
                            if (!$scope.isDefined(item)) return;

                            if ($scope.isDefined($scope.options.select)) {
                                $scope.options.select(item);
                            } else {
                                $scope.selectedItem = item;
                                $scope.options.selectedItemText = $scope.isDefined($scope.selectedItem)
                                    ? $scope.selectedItem[$scope.options.propName]
                                    : '';
                            }
                            
                            $scope.onSelected(item);
                        };
                        
                        $scope.onSelected = function () {
                            if (!$scope.options.closeOnSelect) {
                                $scope.focusOnInput();
                            } else {
                                $scope.blur();
                            }
                        };
                    }
                };
            }]);
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
angular.module('Controls')
    .controller('AutocompleteInputMultiController',
        ['$scope', '$timeout',
            function($scope, $timeout) {
                var initialised = false;
                $scope.$watch('selectedItemText.length', function() {
                    if (initialised) {
                        navigateSelectedItems.reset();
                    } else {
                        initialised = true;
                    }
                });

                $scope.selectedItemPos = null;
                $scope.containerClicked = function(e) {
                    if (e.isDefaultPrevented()) {
                        return;
                    }
                    navigateSelectedItems.reset();
                };
                var focusInput = function(shouldFocus) {
                    var input = $scope.getInput();
                    if (shouldFocus) {
                        input.focus();
                    } else {
                        input.blur();
                    }
                }
                var navigateSelectedItems = {
                    reset: function() {
                        $scope.selectedItemPos = null;
                        focusInput(true);
                    },
                    refreshCurrentSelection: function() {
                        if ($scope.selectedItemPos < 0
                         || $scope.selectedItemPos >= $scope.selectedItems.length) {
                            this.reset();
                        } else {
                            this.select($scope.selectedItemPos);
                        }
                    },
                    next: function() {
                        this.select($scope.selectedItemPos + 1);
                    },
                    back: function() {
                        if ($scope.selectedItemPos === null) {
                            this.select($scope.selectedItems.length - 1);
                        } else {
                            this.select($scope.selectedItemPos - 1);
                        }
                    },
                    select: function(id) {
                        var self = this;
                        var setPos = function(newPos) {
                            $scope.selectedItemPos = newPos;
                            self.focusSelectedItem();
                        }
                        if (id <= 0) {
                            if ($scope.selectedItems.length > 0) {
                                setPos(0);
                            } else self.reset();
                        } else if (id === $scope.selectedItems.length) {
                            self.reset();
                        } else if (id < $scope.selectedItems.length) {
                            setPos(id);
                        } else {
                            self.reset();
                        }
                    },
                    isHighlightedItem: function() {
                        return $scope.selectedItemPos !== null
                            && $scope.selectedItemPos >= 0
                            && $scope.selectedItemPos < $scope.selectedItems.length;
                    },
                    tryDeleteSelectedItem: function() {
                        if(this.isHighlightedItem()) {
                            var itemToDelete = $scope.selectedItems[$scope.selectedItemPos];
                            $scope.removeItem(itemToDelete);
                            this.refreshCurrentSelection();
                            return true;
                        } else return false;
                    },
                    focusSelectedItem: function() {
                        var self = this;
                        focusInput(false);
                        // Need to wait for next digest cycle for highlight to be applied
                        $timeout(function() {
                            if (self.isHighlightedItem()) {
                                var highlightedItem = $scope.getHighlightedSelectedItem();
                                var focusableElement = highlightedItem.find('.aim-selected-item-btn-select');
                                if (focusableElement !== null) {
                                    focusableElement.focus();
                                }
                            }
                        }, 0);
                    }
                }
                var isKeyCode = function(e, id) {
                    return (e.which && e.which == id) || (e.keyCode && e.keyCode == id)
                }
                $scope.onKeyup = function (e) {
                    var inputElement = $scope.getInput();
                    var caretPos = inputElement.caret();
                    if (isKeyCode(e, 37)) { // left
                        if (caretPos === 0 || navigateSelectedItems.isHighlightedItem()) {
                            navigateSelectedItems.back();
                        }
                    } else if (isKeyCode(e, 39)) { // right
                        if (caretPos === 0 || navigateSelectedItems.isHighlightedItem()) {
                            navigateSelectedItems.next();
                        }
                    } else if (isKeyCode(e, 8)) { // backspace
                        if (caretPos === 0) {
                            if (!navigateSelectedItems.tryDeleteSelectedItem()) {
                                navigateSelectedItems.back();
                            }
                        }
                    } else if (isKeyCode(e, 46)) { // delete
                        navigateSelectedItems.tryDeleteSelectedItem();
                    }
                };
                $scope.highlightSelectedItem = function(id) {
                    navigateSelectedItems.select(id);
                }
            }])
    .directive('autocompleteInputMulti',
        ['$timeout',
            function($timeout) {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        selectedItems: '=',
                        items: '=',
                        userOptions: '=options',
                    },
                    controller: 'AutocompleteInputMultiController',
                    templateUrl: '/assets/controls/autocomplete/autocompleteInputMulti.html',
                    link: function($scope, element, attrs) {
                        var setOptions = function(userOptions) {
                            // Want to overwrite default options hence have to have
                            // userOptions later in the extend, however, want to
                            // use userOptions object
                            var newOptions = $.extend({}, {
                                disableCreate: false,
                                closeOnSelect: false,
                                propName: 'name',
                                select: $scope.addItem,
                            }, userOptions);
                            $scope.options = $.extend(userOptions, newOptions);
                        };
                        setOptions();
                        $scope.$watch('userOptions', setOptions);

                        var inputElement = null;
                        $scope.getInput = function() {
                            if (inputElement === null) {
                                inputElement = element.find('.autocomplete-input');
                                if (inputElement.length === 0) {
                                    inputElement = null;
                                }
                            }
                            return inputElement;
                        }
                        $scope.getHighlightedSelectedItem = function() {
                            var highlightedSelectedItem = element.find('.aim-selected-item.highlight');
                            if (highlightedSelectedItem.length === 0) {
                                return null;
                            } else return highlightedSelectedItem;
                        }
                        // Validation
                        if ($scope.selectedItems === undefined || $scope.selectedItems === null) {
                            throw 'Selected Items must be defined'
                        }
                        if ($scope.items === undefined || $scope.items === null) {
                            throw 'Items must be defined'
                        }
                        var removeItemFromArray = function(array, item) {
                            var itemPos = array.indexOf(item);
                            if (itemPos > -1) {
                                array.splice(itemPos, 1);
                            }
                        }
                        $scope.addItem = function(item) {
                            $scope.selectedItems.push(item);
                            $scope.options.selectedItemText = '';
                            removeItemFromArray($scope.availableItems, item)
                        }

                        $scope.removeItem = function(item) {
                            removeItemFromArray($scope.selectedItems, item);
                            $scope.availableItems.push(item);
                        }

                        var refresh = function() {
                            $scope.availableItems = $scope.items.slice(0);
                            $scope.selectedItems.length = 0;
                        }
                        refresh();
                    }
                };
            }]);
angular.module('Helpers')
	.directive('preventDefault', function() {
	    return function(scope, element, attrs) {
	        element.click(function(event) {
	            event.preventDefault();
	        });
	    }
	})