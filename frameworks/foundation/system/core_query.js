// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals CQ*/

require('system/builder') ;

/**
  CoreQuery is a simplified DOM manipulation library used internally by 
  SproutCore to find and edit DOM elements.  Outside of SproutCore, you 
  should generally use a more full-featured DOM library such as Prototype
  or jQuery.
  
  CoreQuery itself is a subset of jQuery with some additional plugins.  If
  you have jQuery already loaded when SproutCore loads, in fact, it will 
  replace CoreQuery with the full jQuery library and install any CoreQuery
  plugins, including support for the SC.Enumerable mixin.
  
  Much of this code is adapted from jQuery 1.2.6, which is available under an
  MIT license just like SproutCore.
  
  h1. Using CoreQuery
  
  You can work with CoreQuery much like you would work with jQuery.  The core
  manipulation object is exposed as SC.$.  To find some elements on the page
  you just pass in a selector like this:
  
  {{{
    var cq = SC.$('p');
  }}}
  
  The object returned from this call is a CoreQuery object that implements 
  SC.Enumerable as well as a number of other useful manipulation methods.  
  Often times we call this object the "matched set", because it usually an
  array of elements matching the selector key you passed.
  
  To work with the matched set, just call the various helper methods on it.
  Here are some of the more useful ones:
  
  {{{
    // change all of the text red
    cq.css('color','red');
    
    // hide/show the set
    cq.hide();  cq.show();
    
    // set the text content of the set
    cq.text("Hello World!");
    
  }}}
  
  Of course, you can also chain these methods, just like jQuery.  Here is 
  how you might find all of the headings in your page, change their text and
  color:
  
  {{{
    SC.$('h1').text('Hello World!').css('color','red');
  }}}
  
  h1. Using CoreQuery with Views
  
  Usually you will not want to just blindly edit the HTML content in your
  application.  Instead, you will use CoreQuery to update the portion of the
  page managed by your SC.View instances.  Every SC.View instance has a $()
  property just like SC.$().  The difference is that this function will start
  searching from the root of the view.  For example, you could use the 
  following code in your updateDisplay method to set your content and color:
  
  {{{
    updateDisplay: function() {
      this.$().text(this.get('value')).css('color','red');
    }
  }}}
  
  You could also work on content within your view, for example this will 
  change the title on your view held in the span.title element:
  
  {{{
    updateDisplay: function() {
      this.$('span.title').text('Hello World');
      this.$().setClassName('sc-enabled', YES) ;
    }
  }}}

  @class
  @extends SC.Builder.fn
*/
SC.CoreQuery = (function() {
  // Define CoreQuery inside of its own scope to support some jQuery idioms.
  
  // A simple way to check for HTML strings or ID strings
  // (both of which we optimize for)
  var quickExpr = /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,
  // Is it a simple selector
  isSimple = /^.[^:#\[\.]*$/,
  undefined ;

  var styleFloat = SC.browser.msie ? "styleFloat" : "cssFloat";

  // used for the find() method.
  var chars = (SC.browser.safari && parseInt(SC.browser.version,0) < 417) ?
      "(?:[\\w*_-]|\\\\.)" :
      "(?:[\\w\u0128-\uFFFF*_-]|\\\\.)" ;
  var quickID = new RegExp("^(" + chars + "+)(#)(" + chars + "+)") ;
  var singleClass = new RegExp("^([#.]?)(" + chars + "*)");
  var quickSplit = new RegExp("([#.]?)(" + chars + "*)",'g');

  // Constants used in CQ.css()
  var LEFT_RIGHT = ["Left", "Right"];
  var TOP_BOTTOM = ["Top", "Bottom"];
  var CSS_DISPLAY_PROPS = {  
    position: "absolute", visibility: "hidden", display:"block" 
  } ;

  var getWH = function getWH(elem, name, which) {
    var val = name == "width" ? elem.offsetWidth : elem.offsetHeight;
    var padding = 0, border = 0, loc=which.length, dim;
    while(--loc>=0) {
      dim = which[loc];
      padding += parseFloat(CQ.curCSS( elem, "padding" + dim, true)) || 0;
      border += parseFloat(CQ.curCSS( elem, "border" + dim + "Width", true)) ||0;   
    }
    val -= Math.round(padding + border);
    return val;
  } ;

  var expando = SC.guidKey, uuid = 0, windowData = {},
    // exclude the following css properties to add px
    exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
    // cache defaultView
    defaultView = document.defaultView || {};

  // A helper method for determining if an element's values are broken
  var styleIsBorked = function styleIsBorked( elem ) {
    if ( !SC.browser.safari ) return false;

    // defaultView is cached
    var ret = defaultView.getComputedStyle( elem, null );
    return !ret || ret.getPropertyValue("color") == "";
  } ;

  

  // Helper function used by the dimensions and offset modules
  function num(elem, prop) {
    return elem[0] && parseInt( CQ.curCSS(elem[0], prop, true), 10 ) || 0;
  } ;

  var CoreQuery, CQ ;
  
  // implement core methods here from jQuery that we want available all the
  // time.  Use this area to implement jQuery-compatible methods ONLY.
  // New methods should be added at the bottom of the file, where they will
  // be installed as plugins on CoreQuery or jQuery. 
  CQ = CoreQuery = SC.Builder.create( /** @scope SC.CoreQuery.fn */ {
    
    /** Indicates that this is a jQuery-like object. */
    jquery: 'SC.CoreQuery',
    
    /** 
      Called on a new CoreQuery instance when it is first created.  You
      can pass a variety of options to the CoreQuery constructor function 
      including:
      
      - a simple selector: this will find the element and return it
      - element or array of elements - this will return a query with them
      - html-string: this will convert to DOM.
      
      @returns {CoreQuery} CoreQuery instance
    */
    init: function( selector, context ) {
      
      // Make sure that a selection was provided
      selector = selector || document;

      // Handle $(DOMElement)
      if ( selector.nodeType ) {
        this[0] = selector;
        this.length = 1;
        return this ;

      // Handle HTML strings
      } else if ( typeof selector === "string" ) {
        // Are we dealing with HTML string or an ID?
        var match = quickExpr.exec( selector );

        // Verify a match, and that no context was specified for #id
        if ( match && (match[1] || !context) ) {

          // HANDLE: $(html) -> $(array)
          if ( match[1] )
            selector = CQ.clean( [ match[1] ], context );

          // HANDLE: $("#id")
          else {
            var elem = document.getElementById( match[3] );

            // Make sure an element was located
            if ( elem ){
              // Handle the case where IE and Opera return items
              // by name instead of ID
              if ( elem.id != match[3] ) return CQ().find( selector );

              // Otherwise, we inject the element directly into the jQuery object
              return CQ( elem );
            }
            selector = [];
          }

        // HANDLE: $(expr, [context])
        // (which is just equivalent to: $(content).find(expr)
        } else return CQ( context ).find( selector );

      // HANDLE: $(function)
      // Shortcut for document ready
      } else if (SC.typeOf(selector) === SC.T_FUNCTION) {
        return SC.ready(selector);
      }

      return this.setArray(CQ.makeArray(selector));
    },

    /** Return the number of elements in the matched set. */
    size: function() { return this.length; },

    /** Return the nth element of the working array OR return a clean array
      with the result set, if no number is passed.
      
      @param {Number} num (Optional)
      @returns {Object|Array}
    */
    get: function( num ) {
      return num === undefined ? CQ.makeArray(this) : this[num];
    },

    /** 
      Find subelements matching the passed selector.  Note that CoreQuery
      supports only a very simplified selector search method.  See 
      CoreQuery.find() for more information.
      
      @param {String} selector
      @returns {CoreQuery} new instance with match
    */
    find: function( selector ) {
      var elems = CQ.map(this, function(elem){
        return CQ.find( selector, elem );
      });

      return this.pushStack(elems);
    },

    /**
      Filters the matching set to include only those matching the passed 
      selector.  Note that CoreQuery supports only a simplified selector 
      search method.  See CoreQuery.find() for more information.
      
      Also note that CoreQuery implements SC.Enumerable, which means you can
      also call this method with a callback and target and the callback will
      be executed on every element in the matching set to return a result.
    
      @param {String} selector
      @returns {CoreQuery}
    */
    filter: function( selector ) {
      return this.pushStack(
        (SC.typeOf(selector) === SC.T_FUNCTION) &&
        CQ.grep(this, function(elem, i){
          return selector.call( elem, i );
        }) || CQ.multiFilter( selector, this ) );
    },

    /**
      Returns the results not matching the passed selector.  This is the 
      opposite of filter.
      
      
      @param {String} selector
      @returns {CoreQuery}
    */
    not: function( selector ) {
      if ( typeof selector === "string" ) {
        // test special case where just one selector is passed in
        if ( isSimple.test( selector ) )
          return this.pushStack( CQ.multiFilter( selector, this, true ) );
        else
          selector = CQ.multiFilter( selector, this );
      }

      var isArrayLike = selector.length && selector[selector.length - 1] !== undefined && !selector.nodeType;
      return this.filter(function() {
        return isArrayLike ? CQ.inArray( this, selector ) < 0 : this != selector;
      });
    },
    
    /**    
      Force the current matched set of elements to become the specified array 
      of elements (destroying the stack in the process) You should use 
      pushStack() in order to do this, but maintain the stack.
      
      This method is mostly used internally.  You will not need to use it 
      yourself very often.
      
      @param {Array} elems
      @returns {CoreQuery} receiver
    */
    setArray: function( elems ) {
      // Resetting the length to 0, then using the native Array push
      // is a super-fast way to populate an object with array-like properties
      this.length = 0;
      Array.prototype.push.apply( this, elems );
      return this;
    },
    
    /** 
      Executes the passed function on every element in the CoreQuery object.
      Returns an array with the return values.  Note that null values will
      be omitted from the resulting set.  This differs from SC.Enumerable and
      the JavaScript standard. 
      
      The callback must have the signature:
      
      {{{
        function(currentElement, currentIndex) { return mappedValue; }
      }}}
      
      Note that "this" on the function will also be the currentElement.
      
      @param {Function} callback
      @returns {CoreQuery} results
    */
    map: function( callback ) {
      return this.pushStack( CQ.map(this, function(elem, i){
        return callback.call( elem, i, elem );
      }));
    },
    
    /**    
      Execute a callback for every element in the matched set. (You can seed 
      the arguments with an array of args, but this is only used internally.)
      
      @param {Function} callback
      @param {Object} args
      @returns {CoreQuery} receiver
    */
    each: function( callback, args ) {
      return CQ.each( this, callback, args );
    },

    /** 
      Determine the position of an element within a matched set of elements.
      jQuery-compatible name for indexOf().
      
      @param {Element} elem
      @returns {Number} location
    */
    index: function( elem ) {
      if (elem && elem.jquery) elem = elem[0];
      return Array.prototype.indexOf.call(this, elem);
    },

    /**
      Returns a new CoreQuery object that contains just the matching item.
      
      @param {Number} i
      @returns {CoreQuery}
    */
    eq: function( i ) {
      return this.slice( i, +i + 1 );
    },

    /** 
      Slice the CoreQuery result set just like you might slice and array.
      Returns a new CoreQuery object with the result set.

      @returns {CoreQuery}
    */
    slice: function() {
      return this.pushStack( Array.prototype.slice.apply( this, arguments ) );
    },

    /** Adds the relevant elements to the existing matching set. */
    add: function( selector ) {
      return this.pushStack( CQ.merge(
        this.get(),
        typeof selector === 'string' ?
          CQ( selector ) :
          CQ.makeArray( selector )
      ).uniq()) ;
    },
    
    /** 
      Get to set the named attribute value on the element.  You can either
      pass in the name of an attribute you would like to read from the first
      matched element, a single attribute/value pair to set on all elements
      or a hash of attribute/value pairs to set on all elements.
      
      @param {String} name attribute name
      @param {Object} value attribute value
      @param {String} type ?
      @returns {CoreQuery} receiver
    */
    attr: function( name, value, type ) {
      var options = name;

      // Look for the case where we're accessing a style value
      if ( typeof name === "string" )
        if ( value === undefined )
          return this[0] && CQ[ type || "attr" ]( this[0], name );

        else {
          options = {};
          options[ name ] = value;
        }

      // Check to see if we're setting style values
      return this.each(function(i){
        // Set all the styles
        for ( name in options )
          CQ.attr(
            (type)?this.style:this,
            name, CQ.prop( this, options[ name ], type, i, name ));
      });
    },
    
    html: function( value ) {
      return value === undefined ?
      			(this[0] ?
      				this[0].innerHTML.replace(/ CQ\d+="(?:\d+|null)"/g, "") :
      				null) :
      			this.empty().append( value );
      // return value == undefined ?
      //  (this[0] ? this[0].innerHTML : null) :
      //  this.empty().append( value );
    },

    andSelf: function() { return this.add( this.prevObject ); },

    /** 
      Returns YES if every element in the matching set matches the passed
      selector.  Remember that only simple selectors are supported in 
      CoreQuery.
      
      @param {String} selector
      @return {Boolean} 
    */
    is: function( selector ) {
      return !!selector && CQ.multiFilter( selector, this ).length > 0;
    },

    /**
      Returns YES if every element in the matching set has the named CSS
      class.
      
      @param {String} className
      @returns {Boolean}
    */
    hasClass: function( className ) {
      return Array.prototype.every.call(this, function(elem) {
        return (elem.nodeType!=1) || CQ.className.has(elem, className) ;
      });
    },

    /** 
      Provides a standardized, cross-browser method to get and set the 
      value attribute of a form element.  Optionally pass a value to set or
      no value to get.
      
      @param {Object} value
      @return {Object|CoreQuery}
    */
    val: function( value ) {
      
      // get the value
      if ( value === undefined ) {     
        var elem = this[0];
        if (elem) {
          if(CQ.nodeName(elem, 'option'))
            return (elem.attributes.value || {}).specified ? elem.value : elem.text;

          // We need to handle select boxes special
          if ( CQ.nodeName( elem, "select" ) ) {
            var index = elem.selectedIndex,
              values = [],
              options = elem.options,
              one = elem.type == "select-one";

            // Nothing was selected
            if ( index < 0 ) return null;

            // Loop through all the selected options
            var i, max = one ? index+1:options.length;
            for (i = one ? index : 0; i < max; i++ ) {
              var option = options[ i ];
              if ( option.selected ) {
                value = CQ(option).val(); // get value
                if (one) return value; // We don't need an array for one
                values.push( value ); // Multi-Selects return an array
              }
            }

            return values;        
          }

          // Everything else, we just grab the value
          return (elem.value || "").replace(/\r/g, "");
        }
        return undefined;
        
      // otherwise set the value
      } else {
        if( typeof value === "number" ) value += ''; // force to string
        this.each(function(){
          if ( this.nodeType != 1 ) return;
          
          // handle radio/checkbox.  set the checked value
          if (SC.typeOf(value) === SC.T_ARRAY && (/radio|checkbox/).test(this.type)) {
            this.checked = (CQ.inArray(this.value, value) >= 0 ||
              CQ.inArray(this.name, value) >= 0);
              
          // handle selects
          } else if ( CQ.nodeName( this, "select" ) ) {
            var values = CQ.makeArray(value);
            CQ( "option", this ).each(function(){
              this.selected = (CQ.inArray( this.value, values ) >= 0 ||
                CQ.inArray( this.text, values ) >= 0);
            });

            if (!values.length) this.selectedIndex = -1;

          // otherwise, just set the value property
          } else this.value = value;
        });       
      }
      return this ;
    },

    /** 
      Returns a clone of the matching set of elements.  Note that this will
      NOT clone event handlers like the jQuery version does becaue CoreQuery
      does not deal with events.
    */
    clone: function() {
      // Do the clone
      var ret = this.map(function(){
        if ( SC.browser.msie && !CQ.isXMLDoc(this) ) {
          // IE copies events bound via attachEvent when
          // using cloneNode. Calling detachEvent on the
          // clone will also remove the events from the orignal
          // In order to get around this, we use innerHTML.
          // Unfortunately, this means some modifications to
          // attributes in IE that are actually only stored
          // as properties will not be copied (such as the
          // the name attribute on an input).
          var clone = this.cloneNode(true),
            container = document.createElement("div");
          container.appendChild(clone);
          return CQ.clean([container.innerHTML])[0];
        } else return this.cloneNode(true);
      });

      // Need to set the expando to null on the cloned set if it exists
      // removeData doesn't work here, IE removes it from the original as well
      // this is primarily for IE but the data expando shouldn't be copied 
      // over in any browser
      var clone = ret.find("*").andSelf().each(function(){
        if ( this[ SC.guidKey ] !== undefined )
          this[ SC.guidKey ] = null;
      });

      // Return the cloned set
      return ret;
    },

    /** 
      Set or retrieve the specified CSS value.  Pass only a key to get the
      current value, pass a key and value to change it.
      
      @param {String} key
      @param {Object} value
      @returns {Object|CoreQuery}
    */
    css: function( key, value ) {
      // ignore negative width and height values
      if ((key == 'width' || key == 'height') && parseFloat(value,0) < 0 ) {
        value = undefined;
      }
      return this.attr( key, value, "curCSS" );
    },

    /**
      Set or retrieve the text content of an element.  Pass a text element to
      update or set to end it.
      
      @param {String} text
      @returns {String|CoreQuery}
    */
    text: function( text ) {
      if ( typeof text !== "object" && text != null )
        return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );

      var ret = "";

      CQ.each( text || this, function(){
        CQ.each( this.childNodes, function(){
          if ( this.nodeType != 8 )
            ret += this.nodeType != 1 ?
              this.nodeValue : CQ.fn.text( [ this ] );
        });
      });

      return ret;
    },

    /** Simple method to show elements without animation. */
    show: function() {
      var isVisible = SC.$.isVisible;
      this.each(function() {
        if (!isVisible(this)) {
          
          // try to restore to natural layout as defined by CSS
          this.style.display = this.oldblock || '';
          
          // handle edge case where the CSS style is none so we can't detect
          // the natural display state.
          if (CQ.css(this,'display') == 'none') {
            var elem = CQ('<' + this.tagName + '/>');
            CQ('body').append(elem);
            this.style.display = elem.css('display');
            // edge case where we still can't get the display
            if (this.style.display === 'none') this.style.display = 'block';
            elem.remove(); elem = null;
          }
        }
      }) ;
      return this ;
    },

    /** Simple method to hide elements without animation. */
    hide: function() {
      var isVisible = SC.$.isVisible;
      this.each(function() {
        if (isVisible(this)) {
          this.oldblock = this.oldblock || CQ.css(this,'display');
          this.style.display = 'none';
        }
      }) ;
      return this ;
    },
    
    /** 
      Low-level dom manipulation method used by append(), before(), after()
      among others.  Unlike the jQuery version, this version does not execute
      <script> tags.  That is generally not a good way to input scripts.
    */
    domManip: function( args, table, reverse, callback ) {
      var clone = this.length > 1, elems;

      return this.each(function(){
        if ( !elems ) {
          elems = CQ.clean( args, this.ownerDocument );
          if (reverse) elems.reverse();
        }

        var obj = this;
        if ( table && CQ.nodeName( this, "table" ) && CQ.nodeName( elems[0], "tr" ) ) {
          obj = this.getElementsByTagName("tbody")[0] || this.appendChild( this.ownerDocument.createElement("tbody") );
        }

        CQ.each(elems, function(){
          var elem = clone ? CQ( this ).clone( true )[0] : this;
          // Inject the elements into the document
          callback.call( obj, elem );
        });
      });
    },
    
    append: function() {
      return this.domManip(arguments, true, false, function(elem){
        if (this.nodeType == 1)
          this.appendChild( elem );
      });
    },

    prepend: function() {
      return this.domManip(arguments, true, true, function(elem){
        if (this.nodeType == 1)
          this.insertBefore( elem, this.firstChild );
      });
    },

    before: function() {
      return this.domManip(arguments, false, false, function(elem){
        this.parentNode.insertBefore( elem, this );
      });
    },

    after: function() {
      return this.domManip(arguments, false, true, function(elem){
        this.parentNode.insertBefore( elem, this.nextSibling );
      });
    },

    replaceWith: function( value ) {
      return this.after( value ).remove();
    },

    removeData: function( key ){
      return this.each(function(){ SC.removeData( this, key ); });
    }

  }) ;
  
  // add useful helper methods to CoreQuery
  CoreQuery.mixin(/** @scope SC.CoreQuery */ {
    
    nodeName: function( elem, name ) {
      return elem.nodeName && elem.nodeName.toUpperCase() == name.toUpperCase();
    },
    
    /**
      Execute the passed callback on the elems array, returning an array with
      the mapped values.  Note that null return values are left out of the
      resulting mapping array.  This differs from the standard map() function
      defined by SC.Enumerable and the JavaScript standard.
      
      The callback must have the signature:
      
      {{{
        function(currentElement, currentIndex) { return mappedValue; }
      }}}
      
      Note that "this" on the function will also be the currentElement.
      
      @param {Array} elems
      @param {Function} callback
      @returns {Array} mapped elements
    */
    map: function( elems, callback ) {
      var ret = [];

      // Go through the array, translating each of the items to their
      // new value (or values).
      for ( var i = 0, length = elems.length; i < length; i++ ) {
        var value = callback( elems[ i ], i );

        if ( value != null )
          ret[ ret.length ] = value;
      }
      
      return ret.concat.apply([],ret) ;
    },

    /** 
      Executes the passed callback on each item in the iterable object
      passed.  This deviates from the standard getEach() method defined in
      SC.Enumerable and in the JavaScript standards.
      
      @param {Array} object
      @param {Function} callback
      @param {Object} args internal use only
      @returns {Object} object
    */
    each: function( object, callback, args ) {
      var name, i = 0, length = object.length;

      if ( args ) {
        if ( length === undefined ) {
          for ( name in object )
            if ( callback.apply( object[ name ], args ) === false )
              break;
        } else
          for ( ; i < length; )
            if ( callback.apply( object[ i++ ], args ) === false )
              break;

      // A special, fast, case for the most common use of each
      } else {
        if ( length === undefined ) {
          for ( name in object )
            if ( callback.call( object[ name ], name, object[ name ] ) === false )
              break;
        } else
          for ( var value = object[0];
            i < length && callback.call( value, i, value ) !== false; value = object[++i] ){}
      }

      return object;
    },
    
    isXMLDoc: function( elem ) {
      return elem.documentElement && !elem.body ||
        elem.tagName && elem.ownerDocument && !elem.ownerDocument.body;
    },
    
    clean: function( elems, context ) {
      var ret = [];
      context = context || document;
      // !context.createElement fails in IE with an error but returns typeof 'object'
      if (typeof context.createElement == 'undefined') {
        context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
      }

      CQ.each(elems, function(i, elem){
        if ( typeof elem === 'number' ) elem += '';
        if ( !elem ) return;

        // Convert html string into DOM nodes
        if ( typeof elem === "string" ) {
          // Fix "XHTML"-style tags in all browsers
          elem = elem.replace(/(<(\w+)[^>]*?)\/>/g, function(all, front, tag){
            return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ?
              all :
              front + "></" + tag + ">";
          });

          // Trim whitespace, otherwise indexOf won't work as expected
          var tags = elem.replace(/^\s+/, "").substring(0, 10).toLowerCase(), 
              div = context.createElement("div");

          var wrap =
            // option or optgroup
            !tags.indexOf("<opt") &&
            [ 1, "<select multiple='multiple'>", "</select>" ] ||

            !tags.indexOf("<leg") &&
            [ 1, "<fieldset>", "</fieldset>" ] ||

            tags.match(/^<(thead|tbody|tfoot|colg|cap)/) &&
            [ 1, "<table>", "</table>" ] ||

            !tags.indexOf("<tr") &&
            [ 2, "<table><tbody>", "</tbody></table>" ] ||

            // <thead> matched above
            (!tags.indexOf("<td") || !tags.indexOf("<th")) &&
            [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ] ||

            !tags.indexOf("<col") &&
            [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ] ||

            // IE can't serialize <link> and <script> tags normally
            SC.browser.msie &&
            [ 1, "div<div>", "</div>" ] ||

            [ 0, "", "" ];

          // Go to html and back, then peel off extra wrappers
          div.innerHTML = wrap[1] + elem + wrap[2];

          // Move to the right depth
          while ( wrap[0]-- ) div = div.lastChild;

          // Remove IE's autoinserted <tbody> from table fragments
          if ( SC.browser.msie ) {

            // String was a <table>, *may* have spurious <tbody>
            var tbody = !tags.indexOf("<table") && tags.indexOf("<tbody") < 0 ?
              div.firstChild && div.firstChild.childNodes :

              // String was a bare <thead> or <tfoot>
              wrap[1] == "<table>" && tags.indexOf("<tbody") < 0 ?
                div.childNodes :
                [];

            for ( var j = tbody.length - 1; j >= 0 ; --j )
              if ( CQ.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length )
                tbody[ j ].parentNode.removeChild( tbody[ j ] );

            // IE completely kills leading whitespace when innerHTML is used
            if ( /^\s/.test( elem ) )
              div.insertBefore( context.createTextNode( elem.match(/^\s*/)[0] ), div.firstChild );

          }

          elem = CQ.makeArray( div.childNodes );
        }

        if (elem.length === 0 && (!CQ.nodeName( elem, "form" ) && !CQ.nodeName( elem, "select" ))) return;

        if (elem[0] === undefined || CQ.nodeName( elem, "form" ) || elem.options) ret.push( elem );

        else ret = CQ.merge( ret, elem );

      });

      return ret;
    },
    
    /** 
      Core element finder function in SC.CoreQuery.  CoreQuery supports only
      a very simple set of finders.  Namely, you can specify the following
      simple types of selectors:
      
      - .class-name: this will find all elements with the matching class name
      - #id: this will find all elements matching the ID
      - tagname: this will find all elements with the matching tags.
      
      You can also do some basic joined expressions like:
      
      {{{
        tagname.class-name and tagname#id
      }}}
      
      Finally, you can do simple compound searches like
      
      {{{
        tagname .class-name tagname#id
      }}}
      
      You can also pass multiple selectors separated by commas.  The return
      set will be the OR of all the result set.
      
      {{{
        #item1,#item2,#item3
      }}}
      
      You cannot do any child searches, psuedo-selectors or other complex 
      searches.  These are only the kinds of selectors that can be parsed
      quickly and use built-in methods on the browser.
      
      @param {String} t selector
      @param {Element} context
      @returns {Array} matched elements
    */
    find: function( t, context ) {
      
      // Quickly handle non-string expressions
      if ( typeof t != "string" ) return [ t ];

      // if the selector contains commas, then we actually want to search
      // multiple selectors.
      if (t.indexOf(',')>=0) {
        var ret = t.split(',').map(function(sel) {
          return CQ.find(sel,context);
        });

        // flatten arrays
        return ret.concat.apply([],ret).uniq() ;
      }
      
      // check to make sure context is a DOM element or a document
      if ( context && context.nodeType != 1 && context.nodeType != 9) {
        return [];
      }

      // Set the correct context (if none is provided)
      context = context || document;

      // Initialize the search.  split the selector into pieces
      var ret = [context], nodeName, inFindMode = YES;
      var parts = t.match(quickSplit), len = parts.length, m ;
      
      // loop through each part and either find or filter as needed
      for(var idx=0;idx<len;idx++) {
        t = parts[idx]; // the current selector to parse
        
        // handle space separators.  this just resets to find mode
        if (t === ' ' || t === '') {
          inFindMode = YES ;
          
        // if we are in find mode, then use the current selector to
        // find new elements that are children. at the end, leave findMode.
        } else if (inFindMode) {

          // split into parts to test result
          m = singleClass.exec(t);
          
          // handle special case where we get a tag name followed by an ID.
          // in this case, just swap the two and proceed.
          if ((m[1] === '') && (idx<(len-1)) && (parts[idx+1].charAt(0)==='#')) {
            t = parts[idx+1]; parts[idx+1] = parts[idx]; // swap
            m = singleClass.exec(t); // reparse
          }

          // now loop through and find elements based on tag
          var next = [], retlen = ret.length, retidx, cur, val = m[2], found;
          for(retidx=0;retidx<retlen;retidx++) {
            cur = ret[retidx]; 
            switch(m[1]) {
            case '': // tag
              if (!val) val = '*';
              // Handle IE7 being really dumb about <object>s
              if ( val == "*" && cur.nodeName.toLowerCase() == "object" ) {
                val = "param";
              }
              
              next = CQ.merge(next, cur.getElementsByTagName(val));
              break;
              
            case '#': // id
              // handle special case where we are searching the document
              if (cur === document) {
                found = document.getElementById(val) ;
                
                // if this is IE, verify that it didn't search by name
                if (SC.browser.msie && found && found.getAttribute('id')!==val){
                  found = NO; // clear
                } else {
                  if (found) next.push(found) ;
                  found = YES ; // do not do slow search
                }
              } else found = NO;
              
              // Otherwise, we have to do a slow search
              if (!found) {
                // the return value of getElementsByTagName is not an Array
                // so we need to fake it.
                found = cur.getElementsByTagName('*') ;
                found = Array.prototype.find.call(found, function(el){
                  return el.getAttribute && (el.getAttribute('id')===val);
                }) ;
                if (found) next.push(found) ;
              }
              break ;
              
            case '.': // class
              if (cur.getElementsByClassName) {
                next = CQ.merge(next, cur.getElementsByClassName(val));
              } else {
                next = CQ.merge(next, 
                  CQ.classFilter(cur.getElementsByTagName('*'),val));
              }
              break;
            default:
              // do nothing
            }
          }
          delete ret; ret = next ; // swap array
          inFindMode = NO;
          
        // if we are not in findMode then simply filter the results.
        } else ret = CQ.filter(t, ret) ;
      }
      
      // remove original context if still there
      if (ret && ret[0] == context) ret.shift();
      return ret.uniq() ; // make sure no duplicated are returned
    },

    classFilter: function(r,m,not){
      m = " " + m + " ";
      var tmp = [];
      for ( var i = 0; r[i]; i++ ) {
        var pass = (" " + r[i].className + " ").indexOf( m ) >= 0;
        if ( !not && pass || not && !pass )
          tmp.push( r[i] );
      }
      return tmp;
    },
    
    /** 
      Filters a set of elements according to those matching the passed
      selector.  The selector can contain only tag, class, and id options.
      
      The CoreQuery filter function is only capable of handling simple querys
      such as a tag, class or ID.  You cannot combine them.  Instead call
      filter several times.
      
      @param {String} t the selector to filter by
      @param {Array} r the element to filter
      @param {Boolean} not invert filter
      @returns {Array} filtered array
    */
    filter: function(t,r,not) {
      // split into parts to test result
      var m = singleClass.exec(t), val = m[2], kind = m[1], filter ;
      if (kind === '.') { // special case class
        return CQ.classFilter(CQ.makeArray(r), val, not) ;
      } else {
        if (kind === '#') { // id
          filter = function(el) {
            var ret=el && el.getAttribute && (el.getAttribute('id') === val);
            return (not) ? !ret : ret ;
          } ;
          
        } else { // tag
          filter = function(el) {
            var ret= CQ.nodeName(el, val);
            return (not) ? !ret : ret ;
          } ;
        }
        
        // the return value may not be a real instance of Array, so fake it.
        return Array.prototype.filter.call(CQ.makeArray(r), filter) ;
      }
    },

    /** @private Accepts filters separated by commas. */
    multiFilter: function( expr, elems, not ) {
      expr = (expr.indexOf(',')) ? expr.split(',') : [expr];
      var loc=expr.length,cur,ret=[];
      while(--loc >= 0) { // unit tests expect reverse iteration
        cur = CQ.filter(expr[loc].trim(), elems, not) ;
        ret = not ? elems = cur : CQ.merge(cur,ret);
      }
      return ret ;
    },

    /** 
      Merge two result sets together.  This method knows how to handle 
      the special iterables returned by IE as well.  Used internally.
    */
    merge: function(first, second) {
      // We have to loop this way because IE & Opera overwrite the length
      // expando of getElementsByTagName
      var i = 0, elem, pos = first.length;
      // Also, we need to make sure that the correct elements are being 
      // returned (IE returns comment nodes in a '*' query)
      if ( SC.browser.msie ) {
        while ( elem = second[ i++ ] ) {
          if ( elem.nodeType != 8 ) first[ pos++ ] = elem;
        }

      } else {
        while ( elem = second[ i++ ] ) first[ pos++ ] = elem;
      }

      return first;
    },
    
    // makeArray is the CoreQuery version of $A().
    makeArray: function(array) {
      var ret = [];

      if( array != null ){
        var i = array.length;
        // The window, strings (and functions) also have 'length'
        if( i == null || typeof array === 'string' || array.setInterval )
          ret[0] = array;
        else
          while( i )
            ret[--i] = array[i];
      }

      return ret;
    },

    inArray: function(elem,array) {
      return (array.indexOf) ? array.indexOf(elem) : Array.prototype.indexOf.call(array, elem);
    },
    
    // Check to see if the W3C box model is being used
    boxModel: !SC.browser.msie || document.compatMode == "CSS1Compat",

    props: {
      "for": "htmlFor",
      "class": "className",
      "float": styleFloat,
      cssFloat: styleFloat,
      styleFloat: styleFloat,
      readonly: "readOnly",
      maxlength: "maxLength",
      cellspacing: "cellSpacing",
      rowspan: "rowSpan"
    },
    
    /** @private Prepares a property string for insertion. */
    prop: function( elem, value, type, i, name ) {
      // Handle executable functions
      if (SC.typeOf(value) === SC.T_FUNCTION) value = value.call(elem, i);

      // Handle passing in a number to a CSS property
      return value && (typeof value === "number") && type == "curCSS" && !exclude.test( name ) ? value + "px" : value;
    },
    
    
    grep: function( elems, callback, inv ) {
      var ret = [];

      // Go through the array, only saving the items
      // that pass the validator function
      for ( var i = 0, length = elems.length; i < length; i++ ) {
        if ( !inv != !callback( elems[ i ], i ) ) ret.push( elems[ i ] );
      }
      return ret;
    },
    
    /** @private internal use only */
    className: {

      // internal only, use addClass("class")
      add: function( elem, classNames ) {
        var has = CQ.className.has ;
        CQ.each((classNames || "").split(/\s+/), function(i, className){
          if ( elem.nodeType == 1 && !has( elem.className, className ) )
            elem.className += (elem.className ? " " : "") + className;
        });
      },

      // internal only, use removeClass("class")
      remove: function( elem, classNames ) {
        if (elem.nodeType == 1) {
          elem.className = classNames !== undefined ?
            CQ.grep(elem.className.split(/\s+/), function(className){
              return !CQ.className.has( classNames, className );
            }).join(" ") : "";
        }
      },

      // internal only, use hasClass("class")
      has: function( elem, className ) {
        return elem && CQ.inArray( className, (elem.className || elem).toString().split(/\s+/) ) > -1;
      }
    },
    
    /** @private A method for quickly swapping in/out CSS properties to get 
      correct calculations */
    swap: function( elem, options, callback, direction, arg ) {
      var old = {};
      // Remember the old values, and insert the new ones
      for ( var name in options ) {
        old[ name ] = elem.style[ name ];
        elem.style[ name ] = options[ name ];
      }

      var ret = callback(elem, direction, arg );

      // Revert the old values
      for ( var name in options ) elem.style[ name ] = old[ name ];
      return ret ;
    },
    
    /** returns a normalized value for the specified style name. */
    css: function( elem, name, force ) {
      // handle special case for width/height
      if ( name == "width" || name == "height" ) {
        var val, which = (name == "width") ? LEFT_RIGHT : TOP_BOTTOM,
        props = CSS_DISPLAY_PROPS;

        val = SC.$.isVisible(elem) ? getWH(elem,name,which) : CQ.swap(elem,props,getWH,name,which) ;

        return Math.max(0, val);
      }

      return CQ.curCSS( elem, name, force );
    },

    /** @private internal method to retrieve current CSS. */
    curCSS: function( elem, name, force ) {
      var ret, style = elem.style;

      // We need to handle opacity special in IE
      if ( name == "opacity" && SC.browser.msie ) {
        ret = CQ.attr( style, "opacity" );
        return ret == "" ? "1" : ret;
      }
      
      // Opera sometimes will give the wrong display answer, this fixes it, 
      // see #2037
      if ( SC.browser.opera && name === "display" ) {
        var save = style.outline;
        style.outline = "0 solid black";
        style.outline = save;
      }

      // Make sure we're using the right name for getting the float value
      var isFloat = name.match(/float/i); 
      if (isFloat) name = styleFloat;

      // simple case to collect the value
      if ( !force && style && style[ name ] ) {
        ret = style[ name ];

      // otherwise try to use cached computed value
      } else if ( defaultView.getComputedStyle ) {

        // Only "float" is needed here
        if (isFloat) name = "float";

        name = name.replace( /([A-Z])/g, "-$1" ).toLowerCase();

        // get the computed style and verify its not broken.
        var computedStyle = defaultView.getComputedStyle( elem, null );
        if ( computedStyle && !styleIsBorked(elem, defaultView) ) {
          ret = computedStyle.getPropertyValue( name );

        // If the element isn't reporting its values properly in Safari
        // then some display: none elements are involved
        } else {
          var swap = [], stack = [], a = elem, i = 0, swLen, stLen;

          // Locate all of the parent display: none elements
          for ( ; a && styleIsBorked(a); a = a.parentNode ) stack.unshift(a);

          // Go through and make them visible, but in reverse
          // (It would be better if we knew the exact display type that they 
          // had)
          for (stLen = stack.length ; i < stLen; i++ ) {
            if (styleIsBorked(stack[i])) {
              swap[i] = stack[i].style.display;
              stack[i].style.display = "block";
            }
          }

          // Since we flip the display style, we have to handle that
          // one special, otherwise get the value
          ret = (name == "display" && swap[stack.length-1]!=null) ? "none" :
            (computedStyle && computedStyle.getPropertyValue(name)) || "";

          // Finally, revert the display styles back
          for ( i = 0, swLen = swap.length; i < swLen; i++ ) {
            if (swap[i]!=null) stack[i].style.display = swap[i];
          }
        }

        // We should always get a number back from opacity
        if (name == "opacity" && ret == "") ret = "1";

      } else if (elem.currentStyle) {
        // var camelCase = name.camelize();

        ret = elem.currentStyle[ name ] || elem.currentStyle[ name.camelize() ];

        // From the awesome hack by Dean Edwards
        // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
        // If we're not dealing with a regular pixel number
        // but a number that has a weird ending, we need to convert it to 
        // pixels
        if (!(/^\d+(px)?$/i).test(ret) && (/^\d/).test(ret)) {
          // Remember the original values
          var left = style.left, rsLeft = elem.runtimeStyle.left;

          // Put in the new values to get a computed value out
          elem.runtimeStyle.left = elem.currentStyle.left;
          style.left = ret || 0;
          ret = style.pixelLeft + "px";

          // Revert the changed values
          style.left = left;
          elem.runtimeStyle.left = rsLeft;
        }
      }

      return ret;
    },

    /** @private
      returns all of the actual nodes (excluding whitespace, comments, etc) in 
      the passed element.
    */
    dir: function( elem, dir ){
      var matched = [], cur = elem[dir];
      while ( cur && cur != document ) {
        if ( cur.nodeType == 1 ) matched.push( cur );
        cur = cur[dir];
      }
      return matched;
    },

    /** @private
      Returns the nth actual node (not whitespace, comment, etc) in the passed
      element.
    */
    nth: function(cur,result,dir,elem){
      result = result || 1;
      var num = 0;
      for ( ; cur; cur = cur[dir] ) {
        if ( cur.nodeType == 1 && ++num == result ) break;
      }
      return cur;
    },

    /** @private Finds the regular element-style siblings. */
    sibling: function( n, elem ) {
      var r = [];
      for ( ; n; n = n.nextSibling ) {
        if ( n.nodeType == 1 && n != elem ) r.push( n );
      }
      return r;
    },
    
    /** Primitive helper can read or update an attribute on an element. */
    attr: function( elem, name, value ) {
      // don't set attributes on text and comment nodes
      if (!elem || elem.nodeType == 3 || elem.nodeType == 8) return undefined;

      var notxml = !CQ.isXMLDoc( elem ),
        set = value !== undefined,
        msie = SC.browser.msie;

      // Try to normalize/fix the name
      name = notxml && CQ.props[ name ] || name;

      // Only do all the following if this is a node (faster for style)
      // IE elem.getAttribute passes even for style
      if ( elem.tagName ) {

        // These attributes require special treatment
        var special = /href|src|style/.test( name );

        // Safari mis-reports the default selected property of a hidden option
        // Accessing the parent's selectedIndex property fixes it
        if ( name == "selected" && elem.parentNode ) {
          elem.parentNode.selectedIndex;
        }

        // If applicable, access the attribute via the DOM 0 way
        if ( name in elem && notxml && !special ) {
          if ( set ){
            // We can't allow the type property to be changed (since it causes 
            // problems in IE)
            if ( name == "type" && CQ.nodeName( elem, "input" ) && elem.parentNode ) {
              throw "type property can't be changed";
            }

            elem[ name ] = value;
          }

          // browsers index elements by id/name on forms, give priority to 
          // attributes.
          if( CQ.nodeName( elem, "form" ) && elem.getAttributeNode(name) ) {
            return elem.getAttributeNode( name ).nodeValue;
          }
          
          // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
          // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
          if ( name == "tabIndex" ) {
          	var attributeNode = elem.getAttributeNode( "tabIndex" );
          	return attributeNode && attributeNode.specified
          				? attributeNode.value
          				: elem.nodeName.match(/(button|input|object|select|textarea)/i)
          					? 0
          					: elem.nodeName.match(/^(a|area)$/i) && elem.href
          						? 0
          						: undefined;
          }

          return elem[ name ];
        }

        if ( msie && notxml &&  name === "style" )
          return CQ.attr( elem.style, "cssText", value );

        // convert the value to a string (all browsers do this but IE) see 
        // #1070 (jQuery)
        if ( set ) elem.setAttribute( name, "" + value );

        // Some attributes require a special call on IE
        var attr = (msie && notxml && special)
            ? elem.getAttribute( name, 2 )
            : elem.getAttribute( name );

        // Non-existent attributes return null, we normalize to undefined
        return attr === null ? undefined : attr;
      }

      // elem is actually elem.style ... set the style

      // IE uses filters for opacity
      if ( msie && name == "opacity" ) {
        if ( set ) {
          // IE has trouble with opacity if it does not have layout
          // Force it by setting the zoom level
          elem.zoom = 1;

          // Set the alpha filter to set the opacity
          elem.filter = (elem.filter || "").replace( /alpha\([^)]*\)/, "" ) +
            (parseInt(value,0) + '' == "NaN" ? "" : "alpha(opacity=" + value * 100 + ")");
        }

        return elem.filter && elem.filter.indexOf("opacity=") >= 0 ?
          (parseFloat( elem.filter.match(/opacity=([^)]*)/)[1] ) / 100) + '':
          "";
      }

      name = name.camelize();
      if ( set ) elem[ name ] = value;

      return elem[ name ];
    }
        
  }) ;
  
  CQ.fn.init.prototype = CQ.fn;
  
  // Create a new generic handlers. 
  CQ.each({
    parent: function(elem){return elem.parentNode;},

    parents: function(elem){return CQ.dir(elem,"parentNode");},

    next: function(elem){return CQ.nth(elem,2,"nextSibling");},

    prev: function(elem){return CQ.nth(elem,2,"previousSibling");},
    
    nextAll: function(elem){
      return CQ.dir(elem,"nextSibling");
    },
    
    prevAll: function(elem){
      return CQ.dir(elem,"previousSibling");
    },
    
    siblings: function(elem){
      return CQ.sibling(elem.parentNode.firstChild,elem);
    },
    
    children: function(elem){return CQ.sibling(elem.firstChild);},
    
    contents: function(elem){
      return CQ.nodeName(elem,"iframe") ?
      elem.contentDocument||elem.contentWindow.document :
      CQ.makeArray(elem.childNodes);
    }
    
  }, function(name, fn){
    CQ.fn[ name ] = function( selector ) {
      var ret = CQ.map( this, fn );

      if ( selector && typeof selector == "string" )
        ret = CQ.multiFilter( selector, ret );

      return this.pushStack(ret.uniq());
    };
  });
  
  CQ.each({
    appendTo: "append",
    prependTo: "prepend",
    insertBefore: "before",
    insertAfter: "after",
    replaceAll: "replaceWith"
  }, function(name, original){
    CQ.fn[ name ] = function() {
      var args = arguments;

      return this.each(function(){
        for ( var i = 0, length = args.length; i < length; i++ )
          CQ( args[ i ] )[ original ]( this );
      });
    };
  });
  
  CQ.each({
    removeAttr: function( name ) {
      CQ.attr( this, name, "" );
      if (this.nodeType == 1) this.removeAttribute( name );
    },

    addClass: function( classNames ) {
      CQ.className.add( this, classNames );
    },

    removeClass: function( classNames ) {
      CQ.className.remove( this, classNames );
    },

    toggleClass: function( classNames ) {
      CQ.className[ CQ.className.has( this, classNames ) ? "remove" : "add" ]( this, classNames );
    },

    /**  
      Removes either all elements or elements matching the selector.  Note
      that this does NOT account for event handling, since events are not
      managed by CoreQuery, unlike jQuery.
    */
    remove: function( selector ) {
      if ( !selector || CQ.filter( selector, [ this ] ).length ) {
        if (this.parentNode) this.parentNode.removeChild( this );
      }
    },

    /** 
      Removes the contents of the receiver, leaving it empty.  Note that this
      does NOT deal with Event handling since that is not managed by 
      CoreQuery.
    */
    empty: function() {
      while ( this.firstChild ) this.removeChild( this.firstChild );
    }
    
  }, function(name, fn){
    CQ.fn[name] = function(){ return this.each(fn, arguments); };
  });
  
  // Setup width and height functions
  CQ.each([ "Height", "Width" ], function(i, name){
    var type = name.toLowerCase();

    CQ.fn[ type ] = function( size ) {
      
      // Get window width or height
      if(this[0] === window) {
        
        // Opera reports document.body.client[Width/Height] properly in both 
        // quirks and standards
        if (SC.browser.opera) {
          ret = document.body["client" + name];

        // Safari reports inner[Width/Height] just fine (Mozilla and Opera 
        // include scroll bar widths)
        } else if (SC.browser.safari) {
          ret = window["inner" + name] ;

        // Everyone else use document.documentElement or document.body 
        // depending on Quirks vs Standards mode
        } else if (document.compatMode) {
          ret = documentElement['client' + name];
        } else ret = document.body['client' + name];
        
      // get document width or height
      } else if (this[0] === document) {
        // Either scroll[Width/Height] or offset[Width/Height], whichever is 
        // greater
        ret = Math.max(
          Math.max(document.body["scroll" + name], document.documentElement["scroll" + name]),
          Math.max(document.body["offset" + name], document.documentElement["offset" + name])) ;        
          
      // get/set element width/or height
      } else {
        if (size == undefined) {
          return this.length ? CQ.css(this[0], type) : null ;

          // Set the width or height on the element (default to pixels if value is unitless)
        } else {
          return this.css(type, (typeof size === "string") ? size : size+"px");
        }
      }
      return ret ;
    };
    
    var tl = i ? "Left"  : "Top",  // top or left
      br = i ? "Right" : "Bottom"; // bottom or right

    // innerHeight and innerWidth
    CQ.fn["inner" + name] = function(){
      return this[ name.toLowerCase() ]() +
        num(this, "padding" + tl) +
        num(this, "padding" + br);
    };

    // outerHeight and outerWidth
    CQ.fn["outer" + name] = function(margin) {
      return this["inner" + name]() +
        num(this, "border" + tl + "Width") +
        num(this, "border" + br + "Width") +
        (margin ? num(this, "margin" + tl) + num(this, "margin" + br) : 0);
    };
    
  });
    
  // The Offset Method
  // Originally By Brandon Aaron, part of the Dimension Plugin
  // http://jquery.com/plugins/project/dimensions
  
  /** Calculates the offset for the first passed element. */
  CoreQuery.fn.offset = function() {
    var left = 0, top = 0, elem = this[0], br = SC.browser, results;
    if (!elem) return undefined; 

    function border(elem) {
      add( CQ.curCSS(elem, "borderLeftWidth", true), CQ.curCSS(elem, "borderTopWidth", true) );
    }

    function add(l, t) {
      left += parseInt(l, 10) || 0;
      top += parseInt(t, 10) || 0;
    }

    var parent       = elem.parentNode,
        offsetChild  = elem,
        offsetParent = elem.offsetParent,
        doc          = elem.ownerDocument,
        safari2      = br.safari && parseInt(br.version,0) < 522 && !(/adobeair/i).test(br.userAgent),
        css          = CQ.curCSS,
        fixed        = CQ.css(elem, "position") == "fixed";

    // Use getBoundingClientRect if available
    if (!(br.mozilla && elem==document.body) && elem.getBoundingClientRect){
      var box = elem.getBoundingClientRect();

      // Add the document scroll offsets
      add(box.left + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
        box.top  + Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop));

      // IE adds the HTML element's border, by default it is medium which is 
      // 2px IE 6 and 7 quirks mode the border width is overwritable by the 
      // following css html { border: 0; } IE 7 standards mode, the border is 
      // always 2px This border/offset is typically represented by the 
      // clientLeft and clientTop properties
      // However, in IE6 and 7 quirks mode the clientLeft and clientTop 
      // properties are not updated when overwriting it via CSS
      // Therefore this method will be off by 2px in IE while in quirksmode
      add( -doc.documentElement.clientLeft, -doc.documentElement.clientTop );

    // Otherwise loop through the offsetParents and parentNodes
    } else {

      // Initial element offsets
      add( elem.offsetLeft, elem.offsetTop );

      // Get parent offsets
      while ( offsetParent ) {
        // Add offsetParent offsets
        add( offsetParent.offsetLeft, offsetParent.offsetTop );

        // Mozilla and Safari > 2 does not include the border on offset parents
        // However Mozilla adds the border for table or table cells
        if ( br.mozilla && !(/^t(able|d|h)$/i).test(offsetParent.tagName) || br.safari && !safari2 ) border( offsetParent );

        // Add the document scroll offsets if position is fixed on any 
        // offsetParent
        if (!fixed && css(offsetParent, "position") == "fixed") fixed = true;

        // Set offsetChild to previous offsetParent unless it is the body 
        // element
        offsetChild  = (/^body$/i).test(offsetParent.tagName) ? offsetChild : offsetParent;
        // Get next offsetParent
        offsetParent = offsetParent.offsetParent;
      }

      // Get parent scroll offsets
      while ( parent && parent.tagName && !(/^body|html$/i).test(parent.tagName)) {
        
        // Remove parent scroll UNLESS that parent is inline or a table to 
        // work around Opera inline/table scrollLeft/Top bug
        if ( !(/^inline|table.*$/i).test(css(parent, "display")) ) {
          // Subtract parent scroll offsets
          add( -parent.scrollLeft, -parent.scrollTop );
        }

        // Mozilla does not add the border for a parent that has overflow != 
        // visible
        if ( br.mozilla && css(parent, "overflow") != "visible" ) border(parent);

        // Get next parent
        parent = parent.parentNode;
      }

      // Safari <= 2 doubles body offsets with a fixed position 
      // element/offsetParent or absolutely positioned offsetChild
      // Mozilla doubles body offsets with a non-absolutely positioned 
      // offsetChild
      if ((safari2 && (fixed || css(offsetChild, "position") == "absolute"))||
        (br.mozilla && css(offsetChild, "position") != "absolute") ) {
          add( -doc.body.offsetLeft, -doc.body.offsetTop );
        }

      // Add the document scroll offsets if position is fixed
      if ( fixed ) {
        add(Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
          Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop));
      }
    }

    // Return an object with top and left properties
    results = { top: top, left: left };

    return results;
  };

  CoreQuery.fn.mixin({
    position: function() {
      var left = 0, top = 0, results;

      if ( this[0] ) {
        // Get *real* offsetParent
        var offsetParent = this.offsetParent(),

        // Get correct offsets
        offset       = this.offset(),
        parentOffset = /^body|html$/i.test(offsetParent[0].tagName) ? { top: 0, left: 0 } : offsetParent.offset();

        // Subtract element margins
        // note: when an element has margin: auto the offsetLeft and marginLeft 
        // are the same in Safari causing offset.left to incorrectly be 0
        offset.top  -= num( this, 'marginTop' );
        offset.left -= num( this, 'marginLeft' );

        // Add offsetParent borders
        parentOffset.top  += num( offsetParent, 'borderTopWidth' );
        parentOffset.left += num( offsetParent, 'borderLeftWidth' );

        // Subtract the two offsets
        results = {
          top:  offset.top  - parentOffset.top,
          left: offset.left - parentOffset.left
        };
      }

      return results;
    },

    offsetParent: function() {
      var offsetParent = this[0].offsetParent || document.body;
      while ( offsetParent && (!(/^body|html$/i).test(offsetParent.tagName) && CQ.css(offsetParent, 'position') == 'static') ) {
        offsetParent = offsetParent.offsetParent;
      }
      return CQ(offsetParent);
    }
  }) ;


  // Create scrollLeft and scrollTop methods
  CQ.each( ['Left', 'Top'], function(i, name) {
    var method = 'scroll' + name;

    CQ.fn[ method ] = function(val) {
      if (!this[0]) return;

      return val != undefined ?

        // Set the scroll offset
        this.each(function() {
          this == window || this == document ?
            window.scrollTo(
              !i ? val : CQ(window).scrollLeft(),
               i ? val : CQ(window).scrollTop()
            ) :
            this[ method ] = val;
        }) :

        // Return the scroll offset
        this[0] == window || this[0] == document ?
          self[ i ? 'pageYOffset' : 'pageXOffset' ] ||
            CQ.boxModel && document.documentElement[ method ] ||
            document.body[ method ] : this[0][ method ];
    };
  });
  
  
  return CoreQuery ;
}()) ;

// Install CoreQuery or jQuery, depending on what is available, as SC.$().
SC.$ = (typeof jQuery == "undefined") ? SC.CoreQuery : jQuery ;

// Add some plugins to CoreQuery.  If jQuery is installed, it will get these
// also. -- test in system/core_query/additions
SC.mixin(SC.$.fn, /** @scope SC.CoreQuery.prototype */ {
  
  isCoreQuery: YES, // walk like a duck
  
  /** @private - better loggin */
  toString: function() {
    var values = [];
    var len = this.length, idx=0;
    for(idx=0;idx<len;idx++) {
      values[idx] = '%@: %@'.fmt(idx,(this[idx]) ? this[idx].toString() : '(null)');
    }
    return "<$:%@>(%@)".fmt(SC.guidFor(this),values.join(' , '));  
  },
  
  /** 
    Returns YES if all member elements are visible.  This is provided as a
    common test since CoreQuery does not support filtering by 
    psuedo-selector.
  */
  isVisible: function() {
    return Array.prototype.every.call(this, function(elem){
      return SC.$.isVisible(elem);
    });
  },
    
  /** Returns a new CQ object with only the first item in the object. */
  first: function() {
    return this.pushStack([this[0]]);
  },
  
  /** Returns a new CQ object with only the last item in the set. */
  last: function() {
    return this.pushStack([this[this.length-1]]);
  },
  
  /** 
    Attempts to find the views managing the passed DOM elements and returns
    them.   This will start with the matched element and walk up the DOM until
    it finds an element managed by a view.
    
    @returns {Array} array of views or null.
  */
  view: function() {
    return this.map(function() { 
      var ret=null, guidKey = SC.viewKey, dom = this, value;
      while(!ret && dom && (dom !== document)) {
        if (value = dom.getAttribute('id')) ret = SC.View.views[value] ;
        dom = dom.parentNode;
      }
      dom =null;
      return ret ;
    });
  },
  
  /**
    You can either pass a single class name and a boolean indicating whether
    the value should be added or removed, or you can pass a hash with all
    the class names you want to add or remove with a boolean indicating 
    whether they should be there or not.
    
    This is far more efficient than using addClass/removeClass.
    
    @param {String|Hash} className class name or hash of classNames + bools
    @param {Boolean} shouldAdd for class name if a string was passed
    @returns {SC.CoreQuery} receiver
  */
  setClass: function(className, shouldAdd) {
    if (SC.none(className)) return this; //nothing to do
    var isHash = SC.typeOf(className) !== SC.T_STRING ;
    var fix = this._fixupClass, key;
    this.each(function() {
      if (this.nodeType !== 1) return; // nothing to do
      
      // collect the class name from the element and build an array
      var classNames = this.className.split(/\s+/), didChange = NO;
      
      // loop through hash or just fix single className
      if (isHash) {
        for(var key in className) {
          if (!className.hasOwnProperty(key)) continue ;
          didChange = fix(classNames, key, className[key]) || didChange;
        } 
      } else didChange = fix(classNames, className, shouldAdd);

      // if classNames were changed, join them and set...
      if (didChange) this.className = classNames.join(' ');
    });
    return this ;
  },

  /** @private used by setClass */
  _fixupClass: function(classNames, name, shouldAdd) {
    var indexOf = classNames.indexOf(name);
    // if should add, add class...
    if (shouldAdd) {
      if (indexOf < 0) { classNames.push(name); return YES ; }
      
    // otherwise, null out class name (this will leave some extra spaces)
    } else if (indexOf >= 0) { classNames[indexOf]=null; return YES; }
    return NO ;
  },
  
  /**
    Returns YES if any of the matched elements have the passed element or CQ object as a child element.
  */
  within: function(el) {
    el = SC.$(el); // make into CQ object
    var ret, elCur, myCur, idx, len = el.length;
    var loc = this.length;
    while(!ret && (--loc >= 0)) {
      myCur = this[loc];
      for(idx=0; !ret && (idx<len); idx++) {
        elCur = el[idx];
        while(elCur && (elCur !== myCur)) elCur = elCur.parentNode;
        ret = elCur === myCur ;
      }
    }
    myCur = elCur = null ; // clear memory
    return ret ;
  }
  
});

/** 
  Make CoreQuery enumerable.  Since some methods need to be disambiguated,
  we will implement some wrapper functions here. 
  
  Note that SC.Enumerable is implemented on SC.Builder, which means the
  CoreQuery object inherits this automatically.  jQuery does not extend from
  SC.Builder though, so we reapply SC.Enumerable just to be safe.
*/
(function() {
  var original = {};
  
  var wrappers = {
    
    // if you call find with a selector, then use the jQuery way.  If you 
    // call with a function/target, use Enumerable way
    find: function(callback,target) {
      return (target !== undefined) ? SC.Enumerable.find.call(this, callback, target) : original.find.call(this, callback) ;
    },

    // ditto for filter - execute SC.Enumerable style if a target is passed.
    filter: function(callback,target) {
      return (target !== undefined) ? 
        this.pushStack(SC.Enumerable.filter.call(this, callback, target)) : 
        original.filter.call(this, callback) ;
    },
    
    // filterProperty is an SC.Enumerable thing, but it needs to be wrapped
    // in a CoreQuery object.
    filterProperty: function(key, value) {
      return this.pushStack(
        SC.Enumerable.filterProperty.call(this,key,value));
    },
    
    // indexOf() is best implemented using the jQuery index()
    indexOf: SC.$.index,
    
    // map() is a little tricky because jQuery is non-standard.  If you pass
    // a context object, we will treat it like SC.Enumerable.  Otherwise use
    // jQuery.
    map: function(callback, target) {
      return (target !== undefined) ?  
        SC.Enumerable.map.call(this, callback, target) : 
        original.map.call(this, callback);
    }
  };

  // loop through an update some enumerable methods.  If this is CoreQuery,
  // we just need to patch up the wrapped methods.  If this is jQuery, we
  // need to go through the entire set of SC.Enumerable.
  var isCoreQuery = SC.$.jquery === 'SC.CoreQuery';
  var fn = SC.$.fn, enumerable = isCoreQuery ? wrappers : SC.Enumerable ;
  for(var key in enumerable) {
    if (!enumerable.hasOwnProperty(key)) continue ;
    var value = enumerable[key];
    if (key in wrappers) {
      original[key] = fn[key]; value = wrappers[key];
    }
    fn[key] = value;
  }
})();

// Add some global helper methods.
SC.mixin(SC.$, {
  
  /** @private helper method to determine if an element is visible.  Exposed
   for use in testing. */
  isVisible: function(elem) {
    var CQ = SC.$;
    return ("hidden"!=elem.type) && (CQ.css(elem,"display")!="none") && (CQ.css(elem,"visibility")!="hidden");
  }
  
}) ;


