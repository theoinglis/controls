'use strict';

describe('Directive: autocompleteInput', function () {

  // load the directive's module
  beforeEach(module('autocompleteApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<autocomplete-input></autocomplete-input>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the autocompleteInput directive');
  }));
});
