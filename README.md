# angular-tipped [![npm version](https://badge.fury.io/js/angular-tipped.svg)](http://badge.fury.io/js/angular-tipped) [![Bower version](https://badge.fury.io/bo/angular-tipped.svg)](http://badge.fury.io/bo/angular-tipped)

An AngularJS directive for the [Tipped](http://projects.nickstakenburg.com/tipped) tooltip library.

## Usage

Require the `decipher.tipped` module:

```javascript
angular.module('myApp', ['fv.tipped']);
```

### Simple Tooltips

Use the directive:

```html
<div tipped title="foo {{bar}}">{{bar}}</div>
```

This will create a Tipped tooltip that will show on hover after 1s and hide when you move your mouse out after 500ms.  The value is interpolated.  These defaults can be changed by injecting the `tippedOptions` constant:

```javascript
angular.module('myApp', ['fv.tipped']).config(function(tippedOptions) {
    tippedOptions.showDelay = 500; // reduce the delay to show the tooltip to 500ms.
});
```

Pass any options to Tipped (see [the docs](http://projects.nickstakenburg.com/tipped/documentation)) via an object in the `tipped` directive itself:

```html
<div tipped="{showDelay: 500}" title="I'm a tooltip">hover me</div>
```

### Unique Features
 
#### Template URLs 
 
The above is of course for a simple tooltip, but if you wish to do something more involved, you can pass a template URL to the directive:

```html
<div tipped template-url="'my-template.html'">hooey</div>
```

The value of `templateUrl` is evaluated against the current scope, so you may pass it a string in single-quotes or an expression.  There is no `$watch` on the expression as of this writing.  The directive will look in the `$templateCache` here for something called `my-template.html`, and will/should avoid making the `GET` request to go grab it, if found.  The template is compiled and linked against the current scope, so you can do basically anything you want within one of these tooltips.

#### Show/Hide via Scope

angular-tipped supports an option called `show`, which is *not* a Tipped option, and is different than `showOn` .  Pass a model to `show` in the options and the tooltip will hide/show as it changes.  For example:

```html
<div tipped="{show: foo}" title="jumpin">punkins</div>
```

```javascript
$scope.foo = false;
//... time passes ...
$scope.foo = true; // tooltip shows
```

#### The `Tipped` Service

The `Tipped` service allows you to create a *Tipped configuration object* containing all user defaults (and "default" defaults) to be used in the view.  
 
TODO

#### 

#### The `tippedModal` Directive

The `tippedModal` directive creates a dialog-box-like tooltip (functioning much like the ui-bootstrap [$modal service](https://angular-ui.github.io/bootstrap/#modal), which is closable via Scope functions `$dismiss()` or `$close()`.  Opening a tooltip will return a resolved or rejected promise upon closure or dismissal, respectively.

TODO

## Installation

```sh
$ bower install angular-tipped
```

Alternatively, if using in a server-side context (such as with [Browserify](http://browserify.org)):

```sh
$ npm install angular-tipped
```

## Dependencies

- [AngularJS](http://angularjs.org) v1.2.0 < v2.0.0
- [Tipped](http://projects.nickstakenburg.com/tipped) v3.1.8 < v4.0.0
- [jQuery](http://jquery.com) v1.4.4 < v2.0 (Tipped requirement)

**Note**: Tipped is *not* open-source software, and as such is not included in **angular-tipped**'s depepdencies; it must be installed manually.

This package may or may not work with newer versions of Tipped or jQuery.  If you have success or failure with newer versions than those listed above, please [let us know](https://github.com/decipherinc/angular-tipped/issues).
 
## Authors

- [Christopher Hiller](https://github.com/boneskull)
- [Anthony Thompson](https://github.com/vercasson)
- [DJ Agellon](https://github.com/dagellon)
- [Nick Trevino](https://github.com/hyperlisk)
- [Cameron Briar](https://github.com/cameronbriar)

## License

Copyright 2013-2015 [FocusVision Worldwide](http://www.focusvision.com).  Licensed MIT.

[Tipped](http://www.tippedjs.com) is Copyright 2010-2015 Nick Stakenburg. 
