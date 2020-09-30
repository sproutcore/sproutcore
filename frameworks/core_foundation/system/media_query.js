// ==========================================================================
// Project:   Sproutcore
// Copyright: ©2020 GestiXi
// Author:    Nicolas BADIA and contributors
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  Parses and determines if a given CSS Media Query matches a set of values.
  Inspired by Eric Ferraiuolo & Tilo (https://github.com/ericf/css-mediaquery)

  @author Nicolas BADIA
*/
SC.MediaQuery = SC.Object.create({

  matchQuery: function(mediaQuery, values) {
    var that = this;

    return this.parseQuery(mediaQuery).some(function (query) {
      var inverse = query.inverse;

      // Either the parsed or specified `type` is "all", or the types must be
      // equal for a match.
      var typeMatch = query.type === 'all' || values.type === query.type;

      // Quit early when `type` doesn't match, but take "not" into account.
      if ((typeMatch && inverse) || !(typeMatch || inverse)) {
        return false;
      }

      var expressionsMatch = query.expressions.every(function (expression) {
        var feature  = expression.feature,
          modifier = expression.modifier,
          expValue = expression.value,
          value    = values[feature];

        if (feature === 'window-width') value = window.innerWidth;
        if (feature === 'window-height') value = window.innerHeight;

        // Missing or falsy values don't match.
        if (!value) { return false; }

        switch (feature) {
          case 'orientation':
            return value.toLowerCase() === expValue.toLowerCase();

          case 'width':
          case 'height':
          case 'window-width':
          case 'window-height':
            expValue = that.toPx(expValue);
            value = that.toPx(value);
          break;

          case 'resolution':
            expValue = that.toDpi(expValue);
            value = that.toDpi(value);
          break;

          case 'aspect-ratio':
          case 'device-aspect-ratio':
            expValue = that.toDecimal(expValue);
            value = that.toDecimal(value);
          break;
        }

        switch (modifier) {
          case 'min': return value >= expValue;
          case 'max': return value <= expValue;
          default: return value === expValue;
        }
      });

      return (expressionsMatch && !inverse) || (!expressionsMatch && inverse);
    });
  },

  parseQuery: function(mediaQuery) {
    return mediaQuery.split(',').map(function (query) {
      query = query.trim();

      var captures = query.match(/^(?:(only|not)?\s*([_a-z][_a-z0-9-]*)|(\([^\)]+\)))(?:\s*and\s*(.*))?$/i);

      // Media Query must be valid.
      if (!captures) {
        throw new SyntaxError('Invalid CSS media query: "' + query + '"');
      }

      var modifier = captures[1],
        type = captures[2],
        expressions = ((captures[3] || '') + (captures[4] || '')).trim(),
        parsed = {};

      parsed.inverse = !!modifier && modifier.toLowerCase() === 'not';
      parsed.type = type ? type.toLowerCase() : 'all';

      // Check for media query expressions.
      if (!expressions) {
        parsed.expressions = [];
        return parsed;
      }

      // Split expressions into a list.
      expressions = expressions.match(/\([^\)]+\)/g);

      // Media Query must be valid.
      if (!expressions) {
        throw new SyntaxError('Invalid CSS media query: "' + query + '"');
      }

      parsed.expressions = expressions.map(function (expression) {
        var captures = expression.match(/^\(\s*([_a-z-][_a-z0-9-]*)\s*(?:\:\s*([^\)]+))?\s*\)$/);

        // Media Query must be valid.
        if (!captures) {
          throw new SyntaxError('Invalid CSS media query: "' + query + '"');
        }

        var feature = captures[1].toLowerCase().match(/^(?:(min|max)-)?(.+)/);

        return {
          modifier: feature[1],
          feature: feature[2],
          value: captures[2]
        };
      });

      return parsed;
    });
  },


  // ------------------------------------------------------------------------
  // Utilities
  //

  toDecimal: function(ratio) {
    var decimal = Number(ratio),
      numbers;

    if (!decimal) {
      numbers = ratio.match(/^(\d+)\s*\/\s*(\d+)$/);
      decimal = numbers[1] / numbers[2];
    }

    return decimal;
  },

  toDpi: function(resolution) {
    var value = parseFloat(resolution),
      units = String(resolution).match(/(dpi|dpcm|dppx)?\s*$/)[1];

    switch (units) {
      case 'dpcm': return value / 2.54;
      case 'dppx': return value * 96;
      default: return value;
    }
  },

  toPx: function(length) {
    var value = parseFloat(length),
      units = String(length).match(/(em|rem|px|cm|mm|in|pt|pc)?\s*$/)[1];

    switch (units) {
      case 'em': return value * 16;
      case 'rem': return value * 16;
      case 'cm': return value * 96 / 2.54;
      case 'mm': return value * 96 / 2.54 / 10;
      case 'in': return value * 96;
      case 'pt': return value * 72;
      case 'pc': return value * 72 / 12;
      default: return value;
    }
  }

});