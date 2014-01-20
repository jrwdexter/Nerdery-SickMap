/**
 * @module Sickmap
 *
 * @author Jonathan Dexter
 */

/**
 * Describes the sickmap directive, which creates the structure and attaches events
 * to the DOM for all interactive functionality of the Sickmap.
 * @class Sickmap (Directive)
 */
define(['angular', 'jquery', 'heatmap'], function(angular, $, h337){
    'use strict';
    return angular
    .module('sickMap.directives', [])
    .directive('sickmap', function () {

        /**
         * Links all required functionalities to the current DOM element.'
         * @method link
         * @param  {Object} scope   The angular scope object from the SickmapController.
         * @param  {jQuery} element The jQuery DOM element of the item where to create the sickmap.
         */
        function link(scope, element) {
            createStructure(scope, element);
            scope.gridContext = element.find('canvas').get(0).getContext('2d');
            scope.$watch('Users', function () {
                if (typeof scope.Users === 'undefined' || scope.Users === null) {
                    return;
                }
                createGrid(scope, element.find('.heat-grid'));
                applyHeatmap(scope, element.find('.heat-overlay'));
            }, true);
            scope.$watchCollection('[Zoom, YOffset, XOffset]', function () {
                if (typeof scope.Users === 'undefined' || scope.Users === null) {
                    return;
                }
                createGrid(scope, element.find('.heat-grid'));
                applyHeatmap(scope, element.find('.heat-overlay'));
            });
            attachEvents(scope, element);
        }

        /**
         * Creates the structure for the Sickmap grid and heatmap overlay.
         * @method createStructure
         * @protected
         * @param  {Object} scope   The angular scope object from the SickmapController.
         * @param  {[type]} element [description]
         * @return {[type]}         [description]
         */
        function createStructure(scope, element) {
            element.addClass('heat-container');
            element.append(
                $(
                    '<canvas height="' +
                    element.height() +
                    '" width="' +
                    element.width() +
                    '" class="heat-grid"></canvas>')
            );
            element.append($('<div class="heat-overlay"></div>'));
            element.append($('<span class="heat-label"></span>'));
        }

        /**
         * Adds the grid to a canvas element located on the DOM, as specified by
         * Zoom, Users, and *Offset in the scope object.
         * @method createGrid
         * @protected
         * @param  {Object} scope   The angular scope object from the SickmapController.
         * @param  {jQuery} element The jQuery DOM element for the canvas grid.
         * @return {jQuery}         The jQuery canvas element that has been drawn on.
         */
        function createGrid(scope, element) {
            scope.gridContext.clearRect(0, 0, element.width(), element.height());
            scope.gridContext.beginPath();
            scope.gridContext.save();
            var width = Math.max.apply(null, scope.Users.map(function (u) { return u.col; }));
            var cellSize = scope.Zoom * element.width() / width;
            for (var x = scope.XOffset % cellSize; x < element.width() ; x += cellSize) {
                scope.gridContext.moveTo(x, 0);
                scope.gridContext.lineTo(x, element.height());
            }
            for (var y = scope.YOffset % cellSize; y < element.height() ; y += cellSize) {
                scope.gridContext.moveTo(0, y);
                scope.gridContext.lineTo(element.width(), y);
            }

            scope.gridContext.strokeStyle = 'black';
            scope.gridContext.stroke();
            scope.gridContext.restore();
            return element;
        }

        /**
         * Adds the heatmap overlay layer to the DOM, using Heatmap.js.
         * Every time this is called, it removes the canvas DOM element and readds it... sad face.
         * Includes logic for re-applying using Scope.Zoom and Scope.*Offset.
         * @method applyHeatmap
         * @protected
         * @param  {Object} scope   The scope object for the controller.
         * @param  {jQuery} element A jQuery child DOM element to use as the overlay. 
         * @return {jQuery}         The jQuery heatmap element that has been drawn.
         */
        function applyHeatmap(scope, element) {
            element.find('canvas').remove();

            var width = Math.max.apply(null, scope.Users.map(function (u) { return u.col; }));
            var cellSize = scope.Zoom * element.width() / width;
            var config = {
                element: element.get(0),
                radius: cellSize,
                opacity: 20
            };

            var heatmap = h337.create(config);

            var data = {
                max: 3,
                data: $.grep(scope.Users, function (u) { return u.sick; })
                    .map(function (u) {
                        return {
                            x: u.col * cellSize + cellSize / 2 + scope.XOffset,
                            y: u.row * cellSize + cellSize / 2 + scope.YOffset,
                            count: 3
                        };
                    })
            };
            heatmap.store.setDataSet(data);
            return element;
        }

        /**
         * Attaches various events to the DOM, including zooming (mousewheel),
         * and panning (mousedown / mousemove), as well as labeling.
         * @method attachEvents
         * @protected
         * @param  {object} scope   The scope object for the controller
         * @param  {jQuery} element A jQuery DOM element to attach the events to.  
         * @return {jQuery}         The jQuery DOM element that has had events attached.
         */
        function attachEvents(scope, element) {
            element.bind('mousewheel', function (e) {
                if (e.originalEvent.wheelDelta > 0) {
                    scope.ZoomIn();
                } else {
                    scope.ZoomOut();
                }
                e.preventDefault();
                scope.$apply();
            });

            element.bind('DOMMouseScroll', function(e) {
                if (e.originalEvent.detail < 0) {
                    scope.ZoomIn();
                } else {
                    scope.ZoomOut();
                }
                e.preventDefault();
                scope.$apply();
            });

            element.bind('mousedown', function(e) {
                scope.originalCoords = getMousePosition(element.find('.heat-grid'), e);
                scope.isMouseDown = true;
            });

            element.bind('mousemove', function(e){
                var coords;
                if(scope.isMouseDown) {
                    coords = getMousePosition(element.find('.heat-grid'), e);
                    scope.YOffset += coords.y - scope.originalCoords.y;
                    scope.XOffset += coords.x - scope.originalCoords.x;
                    scope.originalCoords = getMousePosition(element.find('.heat-grid'), e);
                    scope.$apply();
                } else {
                    coords = getMousePosition(element.find('.heat-grid'), e);
                    var user = getUserAtPosition(scope, element, coords);
                    var heatLabel = element.find('.heat-label');
                    if(user !== undefined && user !== null) {
                        heatLabel.html(user.val);
                        heatLabel.css('top', coords.y - heatLabel.height() / 2);
                        heatLabel.css('left', coords.x + heatLabel.height() / 2);
                        heatLabel.show();
                    } else {
                        heatLabel.hide();
                    }
                }
            });

            element.bind('mouseup', function() {
                scope.isMouseDown = false;
            });

            return element;
        }

        /**
         * Function to get a user from the scope at a specific position.
         * @method getUserAtPosition
         * @protected
         * @param  {object} scope   The scope from the angular controller.
         * @param  {jQuery} element The jQuery element to use for positioning.
         * @param  {object} coords  A simple object containing x and y coords of the mouse position.
         * @return {Sickcell}       A Sickcell object describing the person at the specified position, or null.
         */
        function getUserAtPosition(scope, element, coords) {
            if(scope === undefined || scope === null ||
               scope.Users === undefined || scope.Users === null) {
                return null;
            }
            var width = Math.max.apply(null, scope.Users.map(function (u) { return u.col; }));
            var cellSize = scope.Zoom * element.width() / width;
            var user = $.grep(scope.Users, function(u) {
                return  (
                            coords.x - scope.XOffset > u.col * cellSize &&
                            coords.x - scope.XOffset < (u.col + 1) * cellSize
                        ) &&
                        (
                            coords.y - scope.YOffset > u.row * cellSize &&
                            coords.y - scope.YOffset < (u.row + 1) * cellSize
                        );
            });
            if(user !== undefined && user !== null && user.length === 1) {
                return user[0];
            }
            return null;
        }

        /**
         * Function to retrieve the mouse position on the canvas.
         * @method getMousePosition
         * @protected
         * @param  {jQuery} canvas The jQuery DOM element.
         * @param  {Event} evt     The event that was fired for mouseover.
         * @return {Object}        A simple object containing x and y coords of the mouse.
         */
        function getMousePosition(canvas, evt) {
            var rect = canvas.get(0).getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        }

        return {
            link: link
        };
    });
});