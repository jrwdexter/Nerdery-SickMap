/**
 * @module Sickmap
 *
 * @author Jonathan Dexter
 */

/**
 * A simple structure to house seating information, name of person, and sick status.
 * @class Sickcell
 */
define(['base'], function(Base){
    'use strict';
    return Base.extend({

        /**
         * The constructor for a given Sickcell object.
         * @constructor
         * @param  {String}   rowCol The row/column information, directly from Google.  Looks like '20B'.
         * @param  {String}   val    The name of the person, who may or may not be sick.
         * @return {Sickcell} The Sickcell object, with sick set to false.
         */
        constructor: function(rowCol, val) {
            this.row = parseInt(rowCol.match(/\d+/)[0], 10) - 1;
            this.col = this.getCol(rowCol);
            this.val = val;
        },

        /**
         * The row that the person sits in.
         * @property {int} row 
         */
        row: 0,

        /**
         * The column that the person sits in.
         * @property {int} col 
         */
        col: 0,

        /**
         * The name of the person.
         * @property {String} val 
         */
        val: '',

        /**
         * True if the person is sick; otherwise, false.
         * @property {bool} sick 
         */
        sick: false,

        /**
         * @method getCol
         * @private
         * @param  {string} rowCol The row/column information, directly from Google.  Looks like '20B'.
         * @return {int}           The integral version of what column the person sits in.
         */
        getCol: function(rowCol) {
            var colLetters = rowCol.toUpperCase().match(/[A-Z]+/)[0];
            var col = 0;
            for (var i = 0; i < colLetters.length; i++) {
                col += Math.pow(26, i) * (colLetters.charCodeAt(colLetters.length - i - 1) - 64);
            }
            return --col;
        }
    });
});
