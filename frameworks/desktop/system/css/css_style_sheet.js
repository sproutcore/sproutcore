// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class SC.CSSStyleSheet

  A style sheet object wraps a document style sheet object. SC.CSSStyleSheet will
  re-use stylesheet objects as needed.
  
  @extends SC.Object
*/
SC.CSSStyleSheet = SC.Object.extend(
/** @scope SC.CSSStyleSheet.prototype */ {
  
  init: function() {
    sc_super() ;
    
    var ss = this.styleSheetElement ;
    if (!ss) {
      // create the stylesheet object the hard way (works everywhere)
      ss = this.styleSheetElement = document.createElement('style') ;
      ss.type = 'text/css' ;
      var head = document.getElementsByTagName('head')[0] ;
      if (!head) head = document.documentElement ; // fix for Opera
      head.appendChild(ss) ;
    }
    
		this.styleSheet = document.styleSheets[document.styleSheets.length - 1]; 

    // cache this object for later
    var ssObjects = this.constructor.styleSheets ;
    if (!ssObjects) ssObjects = this.constructor.styleSheets = {};
    
    // create rules array
    var rules = ss.cssRules || SC.EMPTY_ARRAY ;
    var array = SC.SparseArray.create();
		// array.provideLength(rules.length);
    array.delegate = this ;
    this.rules = array ;
    
    return this ;
  },
  
  /**
    @property {Boolean} YES if the stylsheet is enabled.
  */
  isEnabled: function(key, val) {
    if (val !== undefined) {
      this.styleSheet.disabled = !val ;
    }
    return !this.styleSheet.disabled ;
  }.property(),
  isEnabledBindingDefault: SC.Binding.bool(),
  
  /**
    DO NOT MODIFY THIS OBJECT DIRECTLY!!!! Use the methods defined on this
    object to update properties of the style sheet; otherwise, your changes 
    will not be reflected.
    
    @property {CSSStyleSheet} RO
  */
  styleSheet: null,
  
  /**
    @property {String}
  */
  href: function(key, val) {
    if (val !== undefined) {
      this.styleSheet.href = val ;
    }
    else return this.styleSheet.href ;
  }.property(),
  
  /**
    @property {String}
  */
  title: function(key, val) {
    if (val !== undefined) {
      this.styleSheet.title = val ;
    }
    else return this.styleSheet.title ;
  }.property(),
  
  /**
    @property {SC.Array} contains SC.CSSRule objects
  */
  rules: null,
  
  /**
    You can also insert and remove rules on the rules property array.
  */
  insertRule: function(rule,i) {
    var rules = this.get('rules') ;
		rules.pushObject(rule);
		if (!SC.none(i))
		{
		  var styleSheetElement = this.styleSheet;
  		if (SC.browser.msie)
  		{
		    //break up the rule for IE
		    var brokenRule = rule.split('{');
		    var hash = brokenRule[1];
		    //remove trailing bracket and split by ;
		    rules = brokenRule[1].substr(0,brokenRule[1].length-1).split(';');
		    for (var idx =0;idx<rules.length;idx++)
		    {
          //add the rule
		      styleSheetElement.addRule(brokenRule[0],rules[idx]+';');
		    }
  		}
  		else
  		{ 
  		  if (i<styleSheetElement.cssRules.length)
  		  {
  		    i = styleSheetElement.insertRule(rule,i);
		    }
		    else
		    {
		      i = styleSheetElement.insertRule(rule,styleSheetElement.cssRules.length);
		    }
  		}
	  }
  },
  
  /**
    You can also insert and remove rules on the rules property array.
  */
  deleteRule: function(rule) {
    var rules = this.get('rules') ;
    rules.removeObject(rule) ;
  },
  
  deleteRuleByIndex: function(i) {
    var styleSheetElement = this.styleSheet;
	  if (i<styleSheetElement.cssRules.length)
	  {
	    styleSheetElement.deleteRule(i);
	  }
	  else
	  {
	    //index too large, delete last if any
	  }
  },
  
  // TODO: implement a destroy method
  
	destroy: function() {
		var ss = this.get('styleSheetElement');
		ss.parentNode.removeChild(ss);
		sc_super();
	},

  /**
    @private
    
    Invoked by the sparse array whenever it needs a particular index 
    provided.  Provide the content for the index.
  */
  sparseArrayDidRequestIndex: function(array, idx) {
    // sc_assert(this.rules === array) ;
    var rules = this.styleSheet.cssRules || SC.EMPTY_ARRAY ;
    var rule = rules[idx] ;
    if (rule) {
      array.provideContentAtIndex(idx, SC.CSSRule.create({ 
        rule: rule,
        styleSheet: this
      })); 
    }
  },
  
  /** @private synchronize the browser's rules array with our own */
  sparseArrayDidReplace: function(array, idx, amt, objects) {
    var cssRules = objects.collect(function(obj) { return obj.rule; }) ;
    this.styleSheet.cssRules.replace(idx, amt, cssRules) ;
  }
  
});

SC.mixin(SC.CSSStyleSheet,
/** SC.CSSStyleSheet */{
  
  /**
    Find a stylesheet object by name or href. If by name, .css will be 
    appended automatically.
    
    {{{
      var ss = SC.CSSStyleSheet.find('style.css') ;
      var ss2 = SC.CSSStyleSheet.find('style') ; // same thing
      sc_assert(ss === ss2) ; // SC.CSSStyleSheet objects are stable
    }}}
    
    @param {String} nameOrUrl a stylsheet name or href to find
    @returns {SC.CSSStyleSheet} null if not found
  */
  find: function(nameOrUrl) {
    var isUrl = nameOrUrl ? nameOrUrl.indexOf('/') >= 0 : NO ;
    
    if (!nameOrUrl) return null ; // no name or url? fail!
    
    if (!isUrl && nameOrUrl.indexOf('.css') === -1) {
      nameOrUrl = nameOrUrl + '.css' ;
    }
    
    // initialize styleSheet cache
    var ssObjects = this.styleSheets ;
    if (!ssObjects) ssObjects = this.styleSheets = {} ;
    
    var styleSheets = document.styleSheets ;
    var ss, ssName, ssObject, guid ;
    for (var idx=0, len=styleSheets.length; idx < len; ++idx) {
      ss = styleSheets[idx] ;
      if (isUrl) {
        if (ss.href === nameOrUrl) {
          guid = SC.guidFor(ss) ;
          ssObject = ssObjects[guid] ;
          if (!ssObject) {
            // cache for later
            ssObject = ssObjects[guid] = this.create({ styleSheet: ss }) ;
          }
          return ssObject ;
        }
      }
      else {
        if (ssName = ss.href) {
          ssName = ssName.split('/') ; // break up URL
          ssName = ssName[ssName.length-1] ; // get last component
          if (ssName === nameOrUrl) {
            guid = SC.guidFor(ss) ;
            ssObject = ssObjects[guid] ;
            if (!ssObject) {
              // cache for later
              ssObject = ssObjects[guid] = this.create({ styleSheet: ss }) ;
            }
            return ssObject ;
          }
        }
      }
    }
    return null ; // stylesheet not found
  },
  
  styleSheets: null
  
});
