// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
   SC.CoreQuery defines a core query language which can be used to find objects in an array
   by searching for certain properties values, as well as ordering the results

  Array#filterProperties({
    or: {
       prop: value,
       and: {
         prop2: value2,
         prop3: value3
       }
    },
    orderBy: {
      property: propname,
      order: 'ASC'
    }
  })

 LANGUAGE DEFINITION

 { // toplevel object is always AND
   prop1: value1, // is equal, or if the value of prop1 on the record you are testing is a regex, it will auto-match
   prop2: [value2,value3,value4], // contains value,
   prop2: [/regexp1/,/regexp2/],  // contains based on regexp
   or   : { // OR the following properties
      prop5: value5,
      prop6: value6
   },
   prop3: /regexp3/, // prop3 value must match the regexp

   and: { // AND the following properties
      prop7: value7,
      prop8: value8
   },

   // having an array for the and keyword as array doesn't make sense,
   // as the properties can be put together in one object

   or: [ // OR together the following items
     { // because no keyword used, AND is assumed
        prop9 : value9,
        prop10: value10
     },
     {
        prop11: value11,
        prop12: value12
     }
   ], // equal to (prop9 === value9 && prop10 === value10) || (prop11 === value11 && prop12 === value12)
   // if you need or inside the objects, you can easily write it in one object

   beginsWith: { // prop14 has to begin with 'text'
     prop14: 'text'
   },

   endsWith: { // prop15 has to end with '.ext'
     prop15: '.ext'
   },

   not: { // negate inner result

   },

   range: { // allows defined properties to be an object describing range instead of a value.
     prop16: { // for this property
       from: val16from // from
       to: val16to  // to
       includeLower: true, // from value is part (default true)
       includeUpper: true, // to value is part (default true)
       gt: val16from, // same as from: + includeLower === false
       gte: val16from, // same as from: + includeLower === true
       lt: val16to, // same as to: + includeUpper === false
       lte: val16to // same as to: + includeUpper === true
     },  // if more properties are given, AND is assumed.
     // if you need more property ranges with OR, you can wrap them:
     or: {
       prop16: {
       },
       prop17: {
       }
     }
   },

   all: { // will not only AND the property values, but also AND the array options
     prop17: [/regexp6/,/regexp7/]
   },

   none: { // same as not: { }
     prop19: [/regexp8/,/regexp9/],
     prop20: [val19,val20]
   }


 }

 */




SC.ArrayQuery = {

  // INTERNALS

  _methods: {

    // this can parse arrays:
    // curopt is always an array, so the loops should do something like indexOf
    // if
    _parseArray: function (curopt, val, forceAND) {
      // this is called when curopt is an array
      // curval can also be an array
      var valIsArray = val instanceof Array;
      var valIsRegex = val instanceof RegExp;
      var i, len, j, lenj, o, hasFound, curval;
      if (valIsArray) {
        lenj = val.length;
      }

      hasFound = forceAND ? true: false;
      for (i = 0, len = curopt.length; i < len; i += 1) {
        o = curopt[i];
        if (valIsArray) {
          for (j = 0; j < lenj; j += 1) {
            curval = (o instanceof RegExp) ? o.test(val[j]) : o === val[j];
            hasFound = forceAND ? hasFound && curval : hasFound || curval;
          }
        }
        else if (valIsRegex) { // val is a regexp
          curval = !(o instanceof RegExp) ? val.test(o) : val === o;
          hasFound = forceAND ? hasFound && curval: hasFound || curval;
        }
        else {
          curval = (o instanceof RegExp) ? o.test(val) : o === val;
          hasFound = forceAND ? hasFound && curval : hasFound || curval;
        }
        if (forceAND && !hasFound) {
          return false; // won't be true, quit
        }
        else if (!forceAND && hasFound) {
          return true; // OR and true, so quit
        }
      }
      return hasFound;
    },

    _getPropval: function (item, prop) {
      return item.get ? ((prop.indexOf(".") > -1) ? item.getPath(prop): item.get(prop)) : item[prop];
    },

    and: function (opts, item, forceAND) {
      var ret = true;
      var curopt, curpropval, i;
      var arrayRegExp = function (v) {
        return curopt.test(v);
      };

      for (i in opts) {
        if (opts.hasOwnProperty(i) && this._reserved.indexOf(i) === -1) {
          curopt = opts[i];
          if (this[i]) {
            ret = ret && this[i](curopt, item, forceAND);
          }
          else {
            curpropval = this._getPropval(item, i);
            if (curopt instanceof RegExp) {
              if (curpropval instanceof Array) {
                ret = ret && curpropval.some(arrayRegExp);
              }
              else ret = ret && curopt.test(curpropval);
            }
            else if (curopt instanceof Array) {
              ret = ret && this._parseArray(curopt, curpropval, forceAND);
            }
            else {
              if (curpropval instanceof Array) {
                ret = ret && (curpropval.indexOf(curopt) > -1);
              }
              else if (curpropval instanceof RegExp) {
                ret = ret && curpropval.test(curopt);
              }
              else ret = ret && (curopt === curpropval);
            }
          }
        }
        if (ret === false) return false; // quit early when obvious that and will not be true
      }
      if (ret === true) return true;
    },

    or: function (opts, item) {
      var ret = false; // start with false, anything else will cause ret to flip
      var curopt, curpropval, i, len;
      var arrayRegExp = function (v) {
        return curopt.test(v);
      };
      if (opts instanceof Array) {
        for (i = 0, len = opts.length; i < len; i += 1) {
          curopt = opts[i];
          if (curopt instanceof Object) {
            ret = ret || this.and(opts[i], item);
          }
          if (ret === true) return ret; // immediately return when true
        }
        return ret;
      }
      for (i in opts) {
        if (opts.hasOwnProperty(i) && this._reserved.indexOf(i) === -1) {
          curopt = opts[i];
          if (this[i]) {
            ret = ret || this[i](curopt, item); // recursive call deeper in
          }
          else {
            curpropval = this._getPropval(item, i);
            if (opts[i] instanceof RegExp) {
              if (curpropval instanceof Array) {
                ret = ret || curpropval.some(arrayRegExp);
              }
              else ret = ret || curopt.test(curpropval);
            }
            else if (opts[i] instanceof Array) {
              ret = ret || this._parseArray(curopt, curpropval);
            }
            else {
              if (curpropval instanceof Array) {
                ret = ret || (curpropval.indexOf(curopt) > -1);
              }
              else if (curpropval instanceof RegExp) {
                ret = ret || curpropval.test(curopt);
              }
              else ret = ret || (opts[i] === curpropval);
            }
          }
        }
        if (ret === true) return true;
      }
      if (!ret) return false;
    },

    all: function (opts, item) { // forces everything inside to be connected with AND
      return this.and(opts, item, true);
    },

    // only for inner use: will call func for every property inside an embedded OR
    // (for example in range, beginsWith, endsWith etc)
    _appliedOR: function (opts, item, func) {
      var ret = false;
      for (var i in opts) {
        if (opts.hasOwnProperty(i)) {
          ret = ret || func(i, opts[i], item);
        }
        if (ret) return ret;
      }
      return ret;
    },

    // only for inner use: will call func for every property inside an embedded AND
    // (for example in range, beginsWith, endsWith etc)
    // function is called with (property,opts,item);
    _appliedAND: function (opts, item, func) {
      var ret = true;
      for (var i in opts) {
        if (opts.hasOwnProperty(i)) {
          ret = ret && func(i, opts[i], item);
        }
        if (ret === false) return ret; // if false, will never be true again, skip rest
      }
      return ret;
    },

    beginsWith: function (opts, item) {
      var me = this;
      var isMatch = function (prop, opt, item) {
        var curpropval, regexp, ret;
        if (prop === 'or') {
          return me._appliedOR(opt[prop], item, isMatch);
        }
        else if (prop === 'and') {
          return me._appliedAND(opt[prop], item, isMatch);
        }
        else {
          curpropval = me._getPropval(item, prop);
          regexp = new RegExp("^" + opt);
          ret = regexp.test(curpropval);
          return ret;
        }
      };
      return this._appliedAND(opts, item, isMatch);
    },

    endsWith: function (opts, item) {
      var me = this;
      var isMatch = function (prop, opt, item) {
        var curpropval, regexp;
        if (prop === 'or') {
          return me._appliedOR(opt[prop], item, isMatch);
        }
        else if (prop === 'and') {
          return me._appliedAND(opt[prop], item, isMatch);
        }
        else {
          curpropval = me._getPropval(item, prop);
          regexp = new RegExp(opt + "$");
          return regexp.test(curpropval);
        }
      };
      return this._appliedAND(opts, item, isMatch);
    },

    range: function (opts, item) {
      var me = this;

      var rangetest = function (prop, opts, item) {
        var from, to, incLower = true, incUpper = true;
        var curpropval, fitsFrom, fitsTo;
        // first handle nested ands and ors
        if (prop === 'or') {
          return me._appliedOR(opts, item, rangetest);
        }
        else if (prop === 'and') {
          return me._appliedAND(opts, item, rangetest);
        }
        else {
          // handle real range stuff
          if (opts.from !== undefined) { from = opts.from; }
          if (opts.to !== undefined) { to = opts.to; }
          if (opts.includeLower !== undefined) { incLower = opts.includeLower; }
          if (opts.includeUpper !== undefined) { incUpper = opts.includeUpper; }
          if (opts.gt  !== undefined) { from = opts.gt;  incLower = false; }
          if (opts.gte !== undefined) { from = opts.gte; incLower = true; }
          if (opts.lt  !== undefined) { to = opts.lt;  incUpper = false; }
          if (opts.lte !== undefined) { to = opts.lte; incUpper = true; }
          if (incLower === undefined) incLower = true; // default value
          if (incUpper === undefined) incUpper = true;
          // now testing the property
          curpropval = me._getPropval(item, prop);
          if (from === undefined && to === undefined) {
            return false;
          }
          fitsFrom = incLower ? curpropval >= from: curpropval > from;
          fitsTo = incUpper ? curpropval <= to: curpropval < to;
          if (from === undefined) {
            return fitsTo;
          }
          if (to === undefined) {
            return fitsFrom;
          }
          return fitsFrom && fitsTo;
        }
      };
      return this._appliedAND(opts, item, rangetest);
    },

    not: function (opts, item) {
      return !this.and(opts, item);
    },

    none: function (opts, item) {
      return !this.and(opts, item);
    },

    _reserved: [ 'orderBy' ]

  }, // end _methods

  _isMatch: function (opts, item) {
    //var ret = false;
    //var hasRootProps = false;
    if (!item) return false;
    //util.log('_ismatch');
    //effectively, the root of the object is always an 'and', so just feed it to and, the rest
    //will run automatically
    return this._methods.and.call(this._methods, opts, item);
  },

  filter: function (ary, opts) {
    var ret = [], idx, len = ary.length;
    var sortProp, sortOrder;
    if (!opts) return ary;  // don't filter

    // check for orderBy
    for (idx = 0; idx < len; idx += 1) {
      if (this._isMatch(opts, ary[idx])) {
        ret.push(ary[idx]);
      }
    }
    if (opts.orderBy) {
      sortProp = opts.orderBy.property;
      sortOrder = opts.orderBy.order;
      ret.sort(function (elOne, elTwo) {
        var valOne = elOne.get ? elOne.get(sortProp) : elOne[sortProp];
        var valTwo = elTwo.get ? elTwo.get(sortProp) : elTwo[sortProp];
        var sortASC = sortOrder === 'ASC';
        if (valOne < valTwo) {
          if (sortASC) return -1;
          else return 1;
        }
        if (valOne === valTwo) {
          return 0;
        }
        if (valOne > valTwo) {
          if (sortASC) return 1;
          else return -1;
        }
      });
    }
    return ret;
  },

  find: function (ary, opts) {
    var idx, len = ary.length;
    if (!opts) return ary;

    for (idx = 0; idx < len; idx += 1) {
      if (this._isMatch(opts, ary[idx])) return ary[idx];
    }
    return null;
  },

  registerFilterMethod: function (lemma, func) {
    this._methods[lemma] = func;
  },

  unregisterFilterMethod: function (lemma) {
    if (lemma === 'and' || lemma === 'or') return false;
    else {
      this._methods[lemma] = null;
    }
  },

};
