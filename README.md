angular-tipped
==============

An AngularJS directive for the Tipped tooltip library.

Installation
============

```
bower install angular-tipped
```

Dependencies
============

- Tipped (http://projects.nickstakenburg.com/tipped) tooltip library
- jQuery (http://jquery.com) since Tipped needs it

Usage
=====

Require the `decipher.tipped` module:

```javascript
angular.module('myApp', ['decipher.tipped']);
```

Simple Tooltips
---------------
Use the directive:

```html
<div tipped title="foo {{bar}}">{{bar}}</div>
```

This will create a Tipped tooltip that will show on hover after 1s and hide when you move your mouse out after 500ms.  The value is interpolated.  These defaults can be changed by injecting the `tippedOptions` constant:

```javascript
angular.module('myApp', ['decipher.tipped']).config(function(tippedOptions) {
    tippedOptions.showDelay = 500; // reduce the delay to show the tooltip to 500ms.
});
```

Pass any options to Tipped (see the docs) via an object in the `tipped` directive itself:

```html
<div tipped="{showDelay: 500}" title="I'm a tooltip">hover me</div>
```

Advanced Tooltips
-----------------
The above is of course for a simple tooltip, but if you wish to do something more involved, you can pass a template URL to the directive:

```html
<div tipped template-url="'my-template.html'">hooey</div>
```

The value of `templateUrl` is evaluated against the current scope, so you may pass it a string in single-quotes or an expression.  There is no `$watch` on the expression as of this writing.  The directive will look in the `$templateCache` here for something called `my-template.html`, and will/should avoid making the `GET` request to go grab it, if found.  The template is compiled and linked against the current scope, so you can do basically anything you want within one of these tooltips.

Questions or comments to @boneskull




