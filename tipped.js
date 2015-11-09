/*! angular-tipped - v1.0.0-2
 * https://github.com/decipherinc/angular-tipped
 * Copyright (c) 2015 FocusVision Worldwide. Licensed MIT
 */

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var angular = (window.angular);

var tipped = angular.module('fv.tipped', []),

  DEFAULTS = {
    showOn: 'mouseenter',
    showDelay: 1000,
    hideOn: 'mouseleave',
    hideDelay: 500,
    target: 'self',
    skin: 'custom'
  },

  TITLE_DEFAULTS = {
    showDelay: 333,
    hideDelay: 0,
    hideOthers: false,
    showOn: 'mouseenter',
    hideOn: [
      {element: 'tooltip', event: 'mouseleave'},
      {element: 'self', event: 'click'},
      {element: 'self', event: 'mouseleave'}
    ],
    target: 'self',
    skin: 'custom'
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
 * Including both title and data-template-url in a single element creates:
 *
 *   - the title as a hover tooltip bound to the mouseenter event
 *
 *   - the template URL using the data-tipped options
 *
 * To override any defaults, pass an options object to the tipped directive:
 *
 *  <div data-tipped="{skin: 'grey'}" title="Derp"></div>
 *
 */
tipped.directive('tipped',
  ['$window', '$http', '$interpolate', '$compile', '$templateCache',
    '$timeout', 'tippedOptions',
    /* eslint max-params:0 */
    function ($window, $http, $interpolate, $compile, $templateCache,
      $timeout, tippedOptions) {

      var Tipped = $window.Tipped;

      return {
        restrict: 'A',
        link: function link(scope, element, attrs) {
          var tipped = attrs.tipped || '{}', skin,
            tippedDefaults = angular.copy(DEFAULTS),
            moduleDefaults = angular.copy(tippedOptions),
            titleDefaults = angular.copy(TITLE_DEFAULTS),
            ttDefaults = scope.$eval(tipped), tt, ht,
            hoverElement,
            options = {},

            make = function make() {
              return $http.get(scope.$eval(attrs.templateUrl),
                {cache: $templateCache})
                .then(function receiveTemplate(res) {
                  var compiledTemplate; // compiled template
                  options.afterUpdate = function afterUpdate(content) {
                    var c = angular.element(content);
                    c.html(compiledTemplate);
                  };
                  return $timeout(function () {
                    scope.$apply(function () {
                      compiledTemplate =
                        $compile('<div>' + res.data + '</div>')(scope);
                    });
                    tt = Tipped.create(element[0], compiledTemplate.html(),
                      options);
                    return tt;
                  }, 0, true);
                });
            };

          if (attrs.templateUrl) {
            options = angular.extend(options, tippedDefaults);
            options = angular.extend(options, moduleDefaults);

            // explicitly get options from skin since we have to do stuff
            // manually.
            if (options.skin &&
              (skin =
                Tipped.Skins[ttDefaults.skin || options.skin])) {
              options = angular.extend(options, skin);
            }

            options = angular.extend(options, ttDefaults);

            scope.$on('Tipped.refresh', function () {
              Tipped.refresh(element[0]);
            });

            if (options.showOn) {
              element.bind(options.showOn, function () {
                make().then(function (tt) {
                  if (options.showDelay) {
                    // show after the specified delay
                    $timeout(function() {
                      tt.show();
                    }, options.showDelay);
                  } else {
                    // show immediately
                    tt.show();
                  }
                });
              });
              scope.$on('$destroy', function () {
                element.unbind(options.showOn);
              });
            }
          } else {
            // title gets the overridden defaults if no template-url
            titleDefaults = angular.extend(titleDefaults, ttDefaults);
          }

          if (angular.isDefined(attrs.title)) {
            if (attrs.templateUrl) {
              // we may be trying to add more than one tip to the element
              // wrap the current element with a span that this tooltip will
              // bind to
              hoverElement =
                element.wrap('<span class="title_tip"></span>').parent();
            } else {
              hoverElement = element;
            }

            attrs.$observe('title', function (value) {
              var isMouseOverElement;
              if (value) {
                if (attrs.templateUrl || titleDefaults.createNow) {
                  // certain tooltips need to be created right away to
                  // prevent display issues
                  ht = Tipped.create(hoverElement[0],
                    $interpolate(value)(scope), titleDefaults);

                  // since we're not adding the tooltip to the original
                  // element we need to remove the title from it
                  element.removeAttr('title');
                } else {
                  hoverElement.bind('mouseenter', function () {
                    isMouseOverElement = true;
                    if (!angular.isObject(ht)) {
                      ht = Tipped.create(hoverElement[0],
                        $interpolate(value)(scope), titleDefaults);

                      $timeout(function () {
                        if (isMouseOverElement &&
                          titleDefaults.showOn === 'mouseenter') {
                          ht.show();
                        }
                      }, titleDefaults.showDelay);

                    }
                  }).bind('mouseleave', function () {
                    isMouseOverElement = false;
                    // prevent the ht tooltip from getting stuck when the
                    // mouse leaves before it is created and displayed needs
                    // to happen after the show event, hence the timeout
                    $timeout(function () {
                      if (angular.isObject(ht) &&
                        Tipped.visible(hoverElement)) {
                        ht.hide();
                      }
                    }, titleDefaults.showDelay);
                  });
                }

                scope.$on('$destroy', function () {
                  hoverElement.unbind('mouseenter');
                  hoverElement.unbind('mouseleave');
                });
              }
            });
          }

          // watch the 'show' option.
          scope.$watch(function () {
            return scope.$eval(tipped).show;
          }, function (newVal) {
            if (tt) {
              if (newVal) {
                tt.show();
              } else {
                tt.hide();
              }
            } else if (newVal) {
              make().then(function (tt) {
                tt.show();
              });
            }
          });

          // Remove the tooltip if scope is destroyed, otherwise it will
          // linger.
          scope.$on('$destroy', function () {
            if (tt) {
              tt.remove();
            } else {
              Tipped.remove(element[0]);
            }
          });
        }
      };
    }]);

tipped.factory('Tipped', function tippedFactory() {

  // Our actual service we will return
  return {
    /*
     Convenience method for defining tooltip options outside of the view
     template.
     */
    makeOptions: function makeOptions(options) {
      var tippedOptions = options.tippedOptions || {};
      return angular.extend({
        hideApply: true
      }, options, {
        tippedOptions: angular.extend({
          hideOn: 'click-outside',
          hideAfter: 3000
        }, tippedOptions)
      });
    }
  };
});

tipped.directive('tippedModal', ['$compile', '$q', '$timeout',
  function ($compile, $q, $timeout) {
    return {
      restrict: 'A',
      replace: false,
      terminal: true,
      priority: 1000,
      scope: true,
      compile: function compile(element, attrs) {

        /*
         We want to add the Tipped directive to this element, so we will have
         to add the attributes. We remove this directive so we do not get an
         infinite loop when we try and compile this element later.
         */
        var modalOptions = attrs.tippedModal;
        element.removeAttr(attrs.$attr.tippedModal);

        return function (elementScope, element) {
          // This will be placed into modalOptions and resolved/rejected
          // when a button is clicked
          var def;

          /*
           Faux $scope, so we don't muck up other variables on the scope
           chain.  Will get added to current scope as $tippedModal
           */
          var $scope = {
            tippedTemplate: 'tipped-modal-template',
            tippedOptions: {
              skin: 'dropdown',
              showOn: false,
              hideAfter: false,
              hideOn: false,
              show: false,
              onBeforeShow: angular.noop,
              onBeforeHide: angular.noop,
              onShow: angular.noop,
              onHide: angular.noop
            },
            tipCtrl: {
              show: function tippedModalShow() {
                $timeout(function () {
                  var shouldShow;
                  elementScope.$tippedModal = $scope;
                  if ($scope.tippedOptions.show) {
                    $scope.tipCtrl.hide();
                  } else {
                    shouldShow = $scope.modalOptions.show;
                    if (angular.isUndefined(shouldShow) ||
                      shouldShow(elementScope, $scope)) {
                      def = $q.defer();
                      $scope.modalOptions.promise = def.promise;
                      $scope.tippedOptions.onBeforeShow(elementScope,
                        $scope, element);
                      $scope.tippedOptions.show = true;
                    }
                  }
                });
              },
              hide: function tippedModalHide() {
                if ($scope.tippedOptions.show) {
                  def.reject();
                }
                $timeout(function () {
                  if ($scope.tippedOptions.show) {
                    $scope.tippedOptions.onBeforeHide(elementScope, $scope);
                    $scope.tippedOptions.show = false;
                  }
                });
              }
            },
            $dismiss: function $dismiss(val) {
              def.reject(val);
              $scope.tipCtrl.hide();
            },
            $close: function $close(val) {
              def.resolve(val);
              $scope.tipCtrl.hide();
            }
          };

          var initializeModal = function initializeModal(modalOptions) {
            // Tipped can have a "target" key specifying a different
            // element to display on We want to bind the "click to hide"
            // hide event to that element
            var bindEl;

            elementScope.$tippedModal = $scope;
            $scope.$$scope = elementScope;

            $scope.modalOptions = modalOptions;
            $scope.modalOptions.$dismiss = $scope.$dismiss;
            $scope.modalOptions.$close = $scope.$close;

            angular.extend($scope.tippedOptions,
              $scope.modalOptions.tippedOptions || {show: false});

            $scope.tippedOptions.onShow = (function () {
              var oldOnShow = $scope.tippedOptions.onShow;
              return function () {
                /*
                 Wrap in timeout to trigger digest cycle
                 */
                $timeout(function () {
                  oldOnShow(elementScope, $scope);
                });
              };
            }());

            $scope.tippedOptions.onHide = (function () {
              var oldOnHide = $scope.tippedOptions.onHide;
              return function () {
                if ($scope.tippedOptions.show) {
                  // If the tooltip still has the show flag set it means
                  // the tooltip was hidden some way besides using the
                  // buttons, such as Tipped.hideAll() or this is a menu
                  $scope.tipCtrl.hide();
                }
                $timeout(function () {
                  oldOnHide(elementScope, $scope);
                });
              };
            }());

            /*
             Bind to the click event. In-context modals should display/hide
             when the element is clicked
             */
            bindEl = $scope.tippedOptions.target ?
              angular.element($scope.tippedOptions.target) : element;
            element.bind('mousedown', $scope.tipCtrl.show);

            if (element !== bindEl) {
              bindEl.bind('mousedown', $scope.tipCtrl.hide);
            }

            elementScope.$on('$destroy', function () {
              element.unbind('mousedown', $scope.tipCtrl.show);
              if (element !== bindEl) {
                bindEl.unbind('mousedown', $scope.tipCtrl.hide);
              }
            });

            /*
             Add the Tipped directive and recompile our element
             */
            element.attr('data-template-url',
              '$tippedModal.tippedTemplate');
            element.attr('data-tipped', '$tippedModal.tippedOptions');
            $compile(element)(elementScope);
          };

          // TODO why not a $watch here?
          (function waitForVariables() {
            var variables = elementScope.$eval(modalOptions);
            if (angular.isUndefined(variables)) {
              $timeout(waitForVariables, 100);
            } else {
              initializeModal(variables);
            }
          }());
        };
      }
    };
  }]);

},{}]},{},[1]);
