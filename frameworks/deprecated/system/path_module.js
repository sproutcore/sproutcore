// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================
//
// When creating a web app, you often need to find elements in your page to
// configure them on load.  These elements are often marked with a class or
// id.  General purpose methods such as $$() or getElementsByClassName are
// not very good for this because they search entire trees of nodes.
//
// These methods are much faster because they make some assumptions about 
// how your elements are structured.
//
// ==========================================================================

require('core') ;
require('system/benchmark') ;

// Constants
SC.BENCHMARK_SELECTOR = NO ;
NO_LIMIT = 10000 ;

/**
  PathModule is high-performance API for locating DOM nodes in your HTML
  document.  It's designed to be used by searching elements from a parent
  node.  

  PathModule is patched into Prototypes Element.Methods, which means that 
  you can automatically access this API for any DOM element retrieved via
  the $() operator.  You can also mixin the PathModule api to your own 
  objects.  Be sure to also have a property called rootElement that points to 
  the root DOM element you want to search.
*/
SC.PathModule = {

// NOTE: The code below simulates having document.rootElement = document.  
// we can't actually do this assignment because it will leak memory in IE.

    $$func: function(func, levels, max, nest) {
      var el = (this.rootElement) ? this.rootElement : (this === document) ? document : null ;
      return SC._PathModule.$$func(el,func,levels,max,nest);
    },

    $$C: function(className, levels, max, nest) {
      var el = (this.rootElement) ? this.rootElement : (this === document) ? document : null ;
      return SC._PathModule.$$C(el,className,levels,max,nest);
    },

    $$T: function(tagName, levels, max, nest) {
      var el = (this.rootElement) ? this.rootElement : (this === document) ? document : null ;
      return SC._PathModule.$$T(el,tagName,levels,max,nest);
    },

    $$P: function(property, value, levels, max, nest) {
      var el = (this.rootElement) ? this.rootElement : (this === document) ? document : null ;
      return SC._PathModule.$$P(el, property, value, levels, max, nest);
    },

    $$S: function(selector, levels, max, nest) {
      var el = (this.rootElement) ? this.rootElement : (this === document) ? document : null ;
      return SC._PathModule.$$S(el, selector, levels, max, nest);
    },

    // finds the first node for which func returns true.
    $func: function(func, levels) {
      var el = (this.rootElement) ? this.rootElement : (this === document) ? document : null ;
      return SC._PathModule.$func(el, func, levels);
    },

    // finds the first node with class name.  returns element, not array.
    $C: function(className, levels) {
      var el = (this.rootElement) ? this.rootElement : (this === document) ? document : null ;
      return SC._PathModule.$C(el, className, levels);
    },

    // finds the first node with tag name.  returns element, not array.
    $T: function(tagName, levels) {
      var el = (this.rootElement) ? this.rootElement : (this === document) ? document : null ;
      return SC._PathModule.$T(el, tagName, levels);
    },

    // find first node with an attribute matching then named value.
    $P: function(attr, value, levels) {
      var el = (this.rootElement) ? this.rootElement : (this === document) ? document : null ;
      return SC._PathModule.$P(el, attr, value, levels);
    },

    // find first node matching the specified class selector.
    $S: function(selector, levels) {
      var el = (this.rootElement) ? this.rootElement : (this === document) ? document : null ;
      return SC._PathModule.$S(el, selector, levels);
    },
    
    // find an element and configure it as the named view if it is not already
    // configured.
    $$view: function(selector, viewClass, levels, max, nest) {
      var el = (this.rootElement) ? this.rootElement : (this === document) ? document : null ;
      return SC._PathModule.$$view(el, selector, viewClass, levels, max, nest) ;
    },

    // find the first element matching the selector and create a view if it is
    // not already configured.
    $view: function(selector, viewClass, levels) {
      var el = (this.rootElement) ? this.rootElement : (this === document) ? document : null ;
      return SC._PathModule.$view(el, selector, viewClass, levels) ;
    }
    
};

// This version of PathModule can be added to Element.Methods among others.
// It is the same API except that it passes the element as the first parameter.
SC._PathModule = {

  // this is the core method that needs to be implemented for each object.
  // this method will search the receiver (up to _levels_ deep) for _max_
  // elements for which the function func() returns true. 
  //
  // el:     (req) the root element.  If you pass null, document will be used. 
  // func:   (req) the function to be used to check each element.
  // levels: (opt) the max levels deep in nested elements. defaults: NO_LIMIT
  // max:    (opt) the maximum number of elements to return. defaults: 
  //         NO_LIMIT
  // nest:   (opt) if true, then the children of matched elements will also be
  //         searched.  if your element matches will never be nested, setting
  //         this to false can be much faster.  defaults: false
  $$func: function(el, func, levels, max, nest) {
    // defaults
    levels = levels || NO_LIMIT ; max = max || NO_LIMIT; nest = nest || false;
    
    // function to search this node.
    var searchNode = function(node, depth, remain, includeThisNode) {
      var ret = [] ;
      
      // does this node match?
      // we extend any returned elements so you can chain these methods. 
      // on browsers that support HTMLElement.prototype, this will do nothing.
      var match = (includeThisNode) ? func(node) : false ;
      if (match) { ret.push(node); remain--; }

      // can we search children?
      depth-- ;
      if ((match && !nest) || (remain<=0) || (depth<=0)) return ret;

      // search children.
      node = node.firstChild ;
      while(node && (remain > 0)) {
        var found = searchNode(node,depth,remain,true) ;
        remain -= found.length ;
        ret = ret.concat(found) ;
        node = node.nextSibling ;
      }
      return ret ;
    } ;
    
    return searchNode(el || document, levels+1, max, false) ;
  },
  
  // finds all nodes with class name.
  $$C: function(el, className, levels, max, nest) {
    return SC._PathModule.$$func(el, function(node) {
      return Element.hasClassName(node, className) ; 
    }, levels, max, nest) ;
  },
  
  // find all nodes with tag name
  $$T: function(el, tagName, levels, max, nest) {
    tagName = tagName.toUpperCase() ;
    return SC._PathModule.$$func(el, function(node) { 
      return node.tagName == tagName; 
    }, levels, max, nest) ;
  },

  // find all nodes with an attribute matching then named value.
  $$P: function(el, property, value, levels, max, nest) {
    return SC._PathModule.$$func(el, function(node) { 
      var pvalue = (node.getAttribute) ? node.getAttribute(property) : node[property] ;
      return pvalue == value; 
    }, levels, max, nest) ;
  },

  // this will parse the selector and then execute the selectors to return
  // the result.  this understands a very simple form for selectors. the 
  // parts are split by spaces. and treated like so:
  // '.classname' = class name
  // 'tag' = tag
  // '#id' = an id. (this will bypass the normal selector methods) 
  // 'attr=value' = find an attr with the value.
  //
  // understands the following qualifiers:
  // .selector:3   => find .selector at most 3 levels deep
  // .selector:3:4 => find at most 4 .selectors at most 3 levels deep
  // .selector?    => find at most 1 .selector, any depth.
  // .selector?3   => find at most 3 .selectors, any depth
  // .selector:*:4 => find at more 4 .selectors at any depth.
  // 
  // You can also directly access child nodes by doing:
  // .selector[0][1][3] -> get child 3 of child 1 of child 0.
  // or:
  // [0][2][3] -> search base.
  //
  $$S: function(el,selector, levels, max, nest) {
    var parts = selector.split(' ') ;
    var ret = [el] ; var nextMax = null ; var bits ;
    var blevels; var bmax; var q; var indicies ;

    parts.each(function(part) {
      // this is included for compatibility with earlier changes I made to
      // prototype.  the preferred way to do this in the future is with with
      // the colon format.
      if (part == '?') { nextMax = 1; return ; }

      // get defaults
      blevels = levels; bmax = (nextMax) ? nextMax : max ;
      nextMax = null ;

      // if there are indexes, find those and save them.
      if (part.slice(part.length-1,part.length) == ']') {
        bits = part.split('[') ;
        part = bits.shift();
        indicies = bits.map(function(b) {return parseInt(b.slice(0,-1),0);});
      } else indicies = null ;

      // find found modifiers
      bits = part.split('?') ;
      part = bits[0] ;
      if (bits.length > 1) {
        bmax = (bits[1].length == 0) ? 1 : parseInt(bits[1],0) ;
      }

      // find level modifiers
      bits = part.split(':') ;
      part = bits[0] ;
      if (bits.length > 1) blevels = (bits[1] == '*') ? '*' : parseInt(bits[1],0) ;
      if (bits.length > 2) bmax = (bits[2] == '*') ? '*' : parseInt(bits[2],0) ;

      // convert star to NO_LIMIT
      if (blevels == '*') blevels = NO_LIMIT ;
      if (bmax == '*') bmax = NO_LIMIT ;

      // prepare the selector info.
      // q tells us how to process the first part.
      // part is the first part of the selector
      // bits are any extra css selectors.
      if (part && part.length > 0) {
        q = part.slice(0,1) ; 
        if (['.','#'].indexOf(q) >= 0) { 
          part = part.slice(1,part.length) ; 
        }
        
        bits = part.split('.') ;
        part = bits[0] ;
        bits = bits.slice(1,bits.length) ;

        // optimization for # types.
        var fret = null ;
        if (q == '#') {
          fret = $(part) ;
          fret = (fret) ? [fret] : null ;
          if (fret) ret = fret ;
        }
        
        // otherwise pass this off to $$func to actually search.
        if (fret == null) {
          fret = [] ;
          for(var i=0;i<ret.length;i++) {

            var found = SC._PathModule.$$func(ret[i],function(node) {
              var match ;
              switch(q) {
                case '.':
                  NODE = node ;
                  var elementClassName = node.className;
                  if (elementClassName && (elementClassName.length > 0)) {
                    match = (elementClassName == part ||
                      elementClassName.match( new RegExp("(^|\\s)" + part + 
                        "(\\s|$)"))) ;
                  } else match = false ;
                  break ;
                case '#':
                  match = node.id == part ;
                  break ;
                default:
                  if (node.tagName) {
                    match = (node.tagName.toLowerCase() == part.toLowerCase()) ;
                  } else { match = false; }
              }

              // if the first item matched, verify that the others match as well.
              var ilen = bits.length ;
              for(var i=0; match && i < ilen; i++) {
                if (!Element.hasClassName(node,bits[i])) match = false ; 
              }
              return match ; 
            }, blevels, bmax, nest) ;
            fret = fret.concat(found) ;
          }
          ret = fret ;
        }
      } else if (SC.typeOf(ret) != SC.T_ARRAY) ret = [ret] ;

      // now follow indicies, if there are any
      if (indicies && indicies.length > 0 && ret) {
        ret = ret.map(function(el){
          var iloclen = indicies.length ;
          for(var iloc=0; el && (iloc < iloclen); iloc++) {
            el = el.childNodes[indicies[iloc]] ;
          }
          return el;
        }) ;
      }
    }) ;
    return ret ;
  },

  // finds the first node for which func returns true.
  $func: function(el,func, levels) {
    var ret = SC._PathModule.$$func(el,func,levels,1,false) ;
    return (ret.length>0) ? ret[0] : null ;
  },

  // finds the first node with class name.  returns element, not array.
  $C: function(el, className, levels) {
    var ret = SC._PathModule.$$C(el, className,levels,1,false) ;
    return (ret.length>0) ? ret[0] : null ;
  },

  // finds the first node with tag name.  returns element, not array.
  $T: function(el, tagName, levels) {
    var ret = SC._PathModule.$$T(el, tagName,levels,1,false) ;
    return (ret.length>0) ? ret[0] : null ;
  },

  // find first node with an attribute matching then named value.
  $P: function(el, attr, value, levels) {
    var ret = SC._PathModule.$$P(el, attr, value,levels,1,false) ;
    return (ret.length>0) ? ret[0] : null ;
  },

  // find first node matching the specified class selector.
  $S: function(el, selector, levels) {
    var ret = SC._PathModule.$$S(el, selector,levels,1,false) ;
    return (ret.length>0) ? ret[0] : null ;
  },
  
  // find an element and configure it as the named view if it is not already
  // configured.
  $$view: function(el, selector, viewClass, levels, max, nest) {
    //if (!viewClass) viewClass = SC.ClassicView;
    var ret ;
    if (selector && (typeof(selector) != 'string')) {
      ret = [selector] ;
    } else {
      ret = SC._PathModule.$$S(el,selector,levels,max,nest) ;
    }
    if (ret) ret = ret.map(function(x) { return (viewClass) ? viewClass.viewFor(x) : SC.ClassicView.findViewForElement(x); }) ;
    return ret ;
  },

  // find the first element matching the selector and create a view if it is
  // not already configured.
  $view: function(el, selector, viewClass, levels) {
    var ret = SC._PathModule.$$view(el, selector, viewClass, levels, 1, false) ;
    return (ret.length>0) ? ret[0] : null ;
  }
  
} ;

// Install benchmark report for selector if configured.
if (SC.BENCHMARK_SELECTOR) {
  ['$$S','$$C','$$T','$S','$C','$T'].each(function(mname) {
    SC.Benchmark.install(SC._PathModule,mname) ;
  })  ;
  SC.Benchmark.install(window,'$$$') ;
}

// longer form aliases of the functions.
SC.mixin(SC._PathModule, {
  $$class: SC._PathModule.$$C,
  $$tag: SC._PathModule.$$T,
  $$sel: SC._PathModule.$$S,
  $$prop: SC._PathModule.$$P,
  
  $class: SC._PathModule.$C,
  $tag: SC._PathModule.$T,
  $sel: SC._PathModule.$S,
  $prop: SC._PathModule.$P
}) ;

// longer form aliases of the functions.
SC.mixin(SC.PathModule, {
  $$class: SC.PathModule.$$C,
  $$tag: SC.PathModule.$$T,
  $$sel: SC.PathModule.$$S,
  $$prop: SC.PathModule.$$P,
  
  $class: SC.PathModule.$C,
  $tag: SC.PathModule.$T,
  $sel: SC.PathModule.$S,
  $prop: SC.PathModule.$P
}) ;

// Add _PathModule to the appropriate elements.  Add to Element.Methods which
// will cause it to be copied onto elements automatically in IE when you 
// call IE.
SC.mixin(Element.Methods,SC._PathModule) ;
SC.mixin(Element,SC._PathModule) ;

// applies to Element.
if (typeof HTMLElement != 'undefined') {
  SC.mixin(HTMLElement.prototype,SC.PathModule) ;
}

// applies to document
SC.mixin(document,SC.PathModule) ;

// applies to window.
SC.mixin(SC.mixin(window,SC.PathModule), {
  $$func: function(func, levels, max, nest) {
    return document.$$func(func,levels,max,nest) ;
  }
});

// applies to arrays. Note the override of $$func to act on the group.
SC.mixin(SC.mixin(Array.prototype,SC.PathModule), {
  $$func: function(func, levels, max, nest) {
    var ret = [] ;
    for(var loc=0;loc<this.length;loc++) {
      ret = ret.concat(this[loc].$$func(func,levels,max,nest)) ;
    }
    return ret ;
  }
}) ;
