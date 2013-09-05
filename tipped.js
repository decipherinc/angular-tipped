/*global angular*/
(function () {
  'use strict';

  var tipped = angular.module('decipher.tipped', []);

  var defaults = {
    showOn: 'mouseover',
    showDelay: 1000,
    hideOn: 'mouseout',
    hideDelay: 500,
    target: 'self'
  };

  /**
   * Grab this constant and put stuff in it to override the defaults above
   * or set any defaults you please.
   */
  tipped.constant('tippedOptions', {});

  /**
   * There are two way to use this directive:
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

          options =
          angular.extend(tippedDefaults, angular.extend(moduleDefaults,
            ttDefaults));

          // explicitly get options from skin since we have to do stuff manually.
          if (options.skin && (skin = $window.Tipped.Skins[options.skin])) {
            options = angular.extend(options, skin);
          }

          if (attrs.title) {
            $window.Tipped.create(element[0], $interpolate(attrs.title)(scope),
              options);
          }
          else if (attrs.templateUrl) {
            $http.get(scope.$eval(attrs.templateUrl), {cache: $templateCache})
              .then(function receiveTemplate(res) {
                // we have to interpolate and compile the template first because Tipped
                // will size its tooltip based on the HTML.  if we left the
                // uninterpolated values in the HTML, the resulting tooltip
                // could be larger/smaller than what actually should be shown.
                // this means, unfortunately, we must compile once for this reason,
                // and again to actually wire up the resulting tooltip.
                // we wrap in a <div> in order to get the html of the tooltip;
                // this allows us to use templates without wrappers.  we wrap in a
                // SECOND div because interpolation is wonky and becomes confused
                // if there is no wrapper.
                var template = $compile('<div>' + $interpolate('<div>' +
                                                               res.data +
                                                               '</div>')(scope) +
                                        '</div>')(scope), tt, t;

                options.afterUpdate = function afterUpdate(content, element) {
                  var c = angular.element(content),
                    el = angular.element(element);
                  scope.$apply(function () {
                    c.html($compile('<div>' + c.html() + '</div>')(scope));
                  });

                  // these following bindings are there because somehow
                  // using the afterUpdate callback breaks hiding, at least
                  // in the case of mouseout.
                  el.bind(options.hideOn, function () {
                    t = $timeout(function () {
                      // suppress any BS errors from Tipped
                      try {
                        tt.hide();
                      } catch (e) {
                      }
                    }, options.hideDelay);
                  });

                  el.bind(options.showOn, function () {
                    $timeout.cancel(t);
                  });

                };
                tt =
                $window.Tipped.create(element[0], template.html(), options);
              });

          }
        }
      };
    }
  );
})();
