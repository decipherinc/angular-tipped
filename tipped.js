/*global angular*/
(function () {
  'use strict';

  var tipped = angular.module('decipher.tipped', []);

  var defaults = {
    showOn: 'mouseenter',
    showDelay: 1000,
    hideOn: 'mouseleave',
    hideDelay: 500,
    target: 'self'
  };

  tipped.constant('tippedOptions', {});

  /**
   * There are two ways to use this directive:
   *
   * An inline template, with interpolation available:
   *
   *  <div data-tipped title="your {{mom}}"></div>
   *
   * Or a templateUrl, which will fetch the template via AJAX and be fancy.
   *
   *  <div data-tipped data-template-url="'something.html'"></div>
   *
   * (the template URL is an AngularJS expression)
   *
   * To override any defaults, pass an options object to the tipped directive:
   *
   *  <div data-tipped="{skin: 'grey'}" title="Derp"></div>
   *
   */
  tipped.directive('tipped',
    function ($window, $http, $interpolate, $compile, $templateCache, $timeout,
      tippedOptions) {
      return {
        restrict: 'A',
        link: function link(scope, element, attrs) {
          var tipped = attrs.tipped || '{}', skin,
            tippedDefaults = angular.copy(defaults),
            moduleDefaults = angular.copy(tippedOptions),
            ttDefaults = scope.$eval(tipped),
            options;

          options = angular.extend(tippedDefaults, moduleDefaults);

          // explicitly get options from skin since we have to do stuff manually.
          if (options.skin &&
              (skin = $window.Tipped.Skins[ttDefaults.skin || options.skin])) {
            options = angular.extend(options, skin);
          }

          options = angular.extend(options, ttDefaults);

          if (attrs.title) {
            $window.Tipped.create(element[0], $interpolate(attrs.title)(scope),
              options);
          }
          else if (attrs.templateUrl) {
            $http.get(scope.$eval(attrs.templateUrl), {cache: $templateCache})
              .then(function receiveTemplate(res) {

                var compiled; // compiled template

                options.afterUpdate = function afterUpdate(content) {
                  var c = angular.element(content);
                  c.html(compiled);
                };

                // compilation does not require interpolation
                $timeout(function () {
                  scope.$apply(function () {
                    compiled = $compile('<div>' + res.data + '</div>')(scope);
                  });
                  $window.Tipped.create(element[0], compiled.html(), options);
                }, 0, false);
              });
          }
        }
      };
    }
  );
})();
