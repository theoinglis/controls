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
                        if (navigateSelectedItems.isHighlightedItem()) {
                            navigateSelectedItems.next();
                        }
                    } else if (isKeyCode(e, 8)) { // backspace
                        e.preventDefault();
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
                    },
                    template: '<div class="input-default clearfix" ng-keyup="onKeyup($event)" ng-click="containerClicked($event)">'+
                              '  <div class="aim-item aim-selected-item"'+
                              '       ng-class="{highlight: ($index === selectedItemPos)}"'+
                              '       ng-repeat="item in selectedItems"'+
                              '       prevent-default>'+
                              '      <button class="aim-selected-item-btn-select btn-blank" type="button" ng-click="highlightSelectedItem($index)">'+
                              '          {{item[options.propName]}}'+
                              '      </button>'+
                              '      <button class="aim-selected-item-btn-delete" type="button" ng-click="removeItem(item)">&#10006</button>'+
                              '  </div>'+
                              '  <autocomplete-input class="aim-item input-blank"'+
                              '                      selected-item="selectedItem" '+
                              '                      items="availableItems" '+
                              '                      options="options">'+
                              '  </autocomplete-input>'+
                              '</div>'
                };
            }]);