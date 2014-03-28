An AngularJS control library:
  - Autocomplete
  - Autocomplete with multiple items selectable

The library can be run by downloading the repository and running with 'grunt serve', provided you have grunt etc.

Autocomplete
======

### Description
A simple autocomplete input, that also has the ability to create new entries.

### Demo
A demo can be seen [here](http://jsfiddle.net/TheoI/BN8Tc/).

### How to use
To use add the files in the [autocomplete build directory](https://github.com/theoinglis/controls/tree/master/build/autocomplete).

### Options
| Option Name | Default | Description  |
| ------------- |:-------------:| --------|
| placeholder      | '' | The placeholder used in the input |
| selectedItemText | '' | The text for the selected item |
| propName         | 'name'  | The property name on the object used for displaying in the dropdown |
| isShowing | false | Whether the dropdown is showing |
| closeOnSelect | true | Whether the dropdown should close on selecting an item |
| disableCreate | false | Whether the user is allowed to create new entries |
| select | | Specify a function that will overwrite the default select behavior |
| create | | Specify a function that will overwrite the default create behavior |

Autocomplete Multi
======

### Description
Autocomplete input with multiple items selectable. As they are selected they become items in the input that can be selected and deleted.

### Demo
A demo can be seen [here](http://jsfiddle.net/TheoI/LndTb/).

### How to use
To use add the files in the [autocomplete multi build directory](https://github.com/theoinglis/controls/tree/master/build/autocompleteMultiAndAutocomplete). Adding this will also add the single autocomplete input.

### Options
Same as the [single Autocomplete](https://github.com/theoinglis/controls#options)
