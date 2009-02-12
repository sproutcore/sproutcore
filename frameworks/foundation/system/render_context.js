// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('system/builder');

/**
  A RenderContext is a builder that can be used to generate HTML for views.
  You will not usually create a render context yourself but you will be passed
  a render context as the first parameter of your render() method on custom
  views.
  
  Render contexts are essentially arrays of strings.  You can add a string to
  the context by calling push().  You can retrieve the entire array as a 
  single string using join().  This is basically the way the context is used 
  for views.  You are passed a render context and expected to add strings of
  HTML to the context like a normal array.  Later, the context will be joined
  into a single string and converted into real HTML for display on screen.
  
  In addition to the core push and join methods, the render context also 
  supports some extra methods that make it easy to build tags.  
  
  context.begin() <-- begins a new tag context
  context.end() <-- ends the tag context...
*/
SC.RenderContext = SC.Builder.create({
  
  // NOTE: We store this as an actual array of strings so that browsers that
  // support dense arrays will use them.
  /** 
    The current working array of strings.
  */
  strings: null,
  
  /**  the current number of strings in the context */
  length: 0,
  
  /**
    Returns the string at the designated index.  If you do not pass anything
    returns the string array.
    
    @param {Number} idx the index
    @returns {String|Array}
  */
  get: function(idx) {
    var strings = this.strings || [];
    return (idx === undefined) ? strings : strings[idx];
  },
  
  /**
    Adds a string to the render context for later joining.  Note that you can
    pass multiple arguments to this method and each item will be pushed.
    
    @param {String} line the liene to add to the string.
    @returns {SC.RenderContext} receiver
  */
  push: function(line) {
    var strings = this.strings;
    if (!strings) this.strings = strings = []; // create array lazily
    
    if (arguments.length > 1) {
      strings.push.apply(strings, arguments) ;
    } else strings.push(line);
    
    this.length = strings.length;
    return this;
  },
  
  /**
    Joins the strings together, returning the result.  But first, this will
    end any open tags.
    
    @param {String} joinChar optional string to use in joins. def empty string
    @returns {String} joined string
  */
  join: function(joinChar) {
    while (this.currentTag) this.end();
    var strings = this.strings;
    return strings ? strings.join(joinChar || '') : '' ;
  },
  
  /**
    Renders the HTML into an offscreen element and returns it.
  */
  element: function() {  
    // create factory div if needed
    var ret ;
    if (!SC.RenderContext.factory) {
      SC.RenderContext.factory = document.createElement('div');
    }
    
    SC.RenderContext.factory.innerHTML = this.join();
    return SC.RenderContext.factory.firstChild ;
  },
  
  /**
    Begins a new tag editing context.  This will save a spot on the 
    stack for the opening tag.  The tag will be filled in when you end the
    tag.  In the mean time you can push html that will be added to the 
    tag body, including other tags.
    
    @param {String} tagName optional tag name.  default 'div'
    @param {Hash} opts optional tag options.  defaults to empty options.
    @returns {SC.RenderContext} receiver 
  */
  begin: function(tagName, opts) {
    // save opts and tagName.  if string is passed for className make into 
    // array.  Always downcase tagName
    if (opts === undefined) opts = {};
    opts.tagName = (tagName || 'div').toLowerCase() ;
    if (opts.className && (typeof opts.className === SC.T_STRING)) {
      opts.className = opts.className.w();
    }

    // tag tag's spot on the stack...
    opts.tagIndex = this.length;
    this.push(null);

    // some tags cannot be selfclosing,  make sure they are not...
    if (opts.tagName === 'script') opts.selfClosing = NO ;
    
    // add tag to tag stack
    opts.parentTag = this.currentTag ;
    this.currentTag = opts; 
    
    return this ;
  },

  // these are temporary objects are reused by end() to avoid memory allocs.
  _DEFAULT_ATTRS: {},
  _TAG_ARRAY: [],
  _JOIN_ARRAY: [],
  _STYLE_PAIR_ARRAY: [],
  
  /**
    Ends the current tag editing context.  This will generate the tag string
    including any attributes you might have set along with a closing tag.
    
    If you do not have a current tag, this does nothing.
     
    @returns {SC.RenderContext} receiver
  */
  end: function() {
    // NOTE: If you modify this method, be careful to consider memory usage
    // and performance here.  This method is called frequently during renders
    // and we want it to be as fast as possible.
    var opts = this.currentTag;
    if (!opts) return this;

    // generate opening tag.
    
    // get attributes first.  Copy in className + styles...
    var tag = this._TAG_ARRAY, pair, joined, key, id = opts.id ;
    var attrs = opts.attrs, className = opts.classNames, styles = opts.styles;
    
    // add tag to tag array
    tag[0] = '<';  tag[1] = opts.tagName ;
    
    // add any attributes...
    if (attrs || className || styles || id) {
      if (!attrs) attrs = this._DEFAULT_ATTRS ;
      if (id) attrs.id = id ;
      if (className) attrs['class'] = className.join(' ');
    
      // add in styles.  note how we avoid memory allocs here to keep things 
      // fast...
      if (styles) {
        joined = this._JOIN_ARRAY ;
        pair = this._STYLE_PAIR_ARRAY;
        for(key in styles) {
          if(!styles.hasOwnProperty(key)) continue ;
          pair[0] = key ;
          pair[1] = styles[key];
          if(typeof pair[1] === SC.T_NUMBER) pair[1] = "%@px".fmt(pair[1]);
          joined.push(pair.join(': '));
        }
        attrs.style = joined.join('; ') ;
      
        // reset temporary object.  pair does not need to be reset since it 
        // is always overwritten
        joined.length = 0;
      }
      
      // now convert attrs hash to tag array...
      tag.push(' '); // add space for joining0
      for(key in attrs) {
        if (!attrs.hasOwnProperty(key)) continue ;
        tag.push(key);
        tag.push('="');
        tag.push(attrs[key]) ;
        tag.push('" ') ;
      }
      
    }
    
    // this is self closing if there is no content in between and selfClosing
    // is not set to false.
    var strings = this.strings;
    var selfClosing = (opts.selfClosing === NO) ? NO : (opts.tagIndex === this.strings.length-1) ;
    tag.push(selfClosing ? ' />' : '>') ;
    
    // join,save and reset temporary object
    strings[opts.tagIndex] = tag.join('');
    tag.length = 0 ;
    
    // now generate closing tag if needed...
    if (!selfClosing) {
      tag[0] = '</' ;
      tag[1] = opts.tagName;
      tag[2] = '>';
      strings.push(tag.join(''));
      this.length = strings.length ;
      tag.length = 0; // reset temporary object again
    }
    
    // pop tag context and return...
    this.currentTag = opts.parentTag;
    opts.parentTag = null;
    
    return this ;
  },
  
  /**
    Generates a with the passed options.  Like calling context.begin().end().
    
    @param {String} tagName optional tag name.  default 'div'
    @param {Hash} opts optional tag options.  defaults to empty options.
    @returns {SC.RenderContext} receiver 
  */
  tag: function(tagName, opts) {
    return this.begin(tagName, opts).end();
  },
    
  /**
    Sets the ID for the current tag.  If there is no currentTag this method
    has no effect.
    
    @param {String} idName the id
    @returns {SC.RenderContext} receiver
  */
  id: function(idName) {
    if (this.currentTag) this.currentTag.id = idName ;
    return this ;
  },
  
  // ..........................................................
  // CSS CLASS NAMES SUPPORT
  // 
  
  /**
    Returns the current classNames array so you can do work on it directly.
    
    @returns {Array} classNames array
  */
  classNames: function() {
    var currentTag = this.currentTag ;
    if (!currentTag) return null ; // nothing to do
    
    var classNames = currentTag.classNames;
    if (!classNames) classNames = currentTag.classNames = [] ;
    
    // optimizaton: clone class names...see SC.View
    if (currentTag.cloneClassNames) {
      classNames = currentTag.classNames = classNames.slice();
      currentTag.cloneClassNames = NO ;
    }
    
    return classNames ;
  },
  
  /**
    Adds the specified className to the current tag, if it does not already
    exist.  This method has no effect if there is no open tag.
    
    @param {String} className the class to add
    @returns {SC.RenderContext} receiver
  */
  addClass: function(className) {
    var currentTag = this.currentTag ;
    if (!currentTag) return this ;
    var classNames = currentTag.classNames;
    if (!classNames) classNames = currentTag.classNames = [] ;
    
    // optimizaton: clone class names...see SC.View
    if (currentTag.cloneClassNames) {
      classNames = currentTag.classNames = classNames.slice();
      currentTag.cloneClassNames = NO ;
    }
    
    if (classNames.indexOf(className) < 0) classNames.push(className);
    return this;
  },
  
  /**
    Removes the specified className from the current tag.  This method has 
    no effect if there is not an open tag.
    
    @param {String} className the class to add
    @returns {SC.RenderContext} receiver
  */
  removeClass: function(className) {
    var currentTag = this.currentTag ;
    if (!currentTag) return this ;
    
    var classNames = currentTag.classNames;
    if (!classNames) return this; // nothing to do

    // optimizaton: clone class names...see SC.View
    if (currentTag.cloneClassNames) {
      classNames = currentTag.classNames = classNames.slice();
      currentTag.cloneClassNames = NO ;
    }


    // if className is found, just null it out.  This will end up adding an
    // extra space to the generated HTML but it is faster than trying to 
    // recompact the array.
    var idx = classNames.indexOf(className);
    if (idx>=0) classNames[idx]= null;
    
    return this;
  },
  
  /**
    You can either pass a single class name and a boolean indicating whether
    the value should be added or removed, or you can pass a hash with all
    the class names you want to add or remove with a boolean indicating 
    whether they should be there or not.
    
    This is far more efficient than using addClass/removeClass.
    
    @param {String|Hash} className class name or hash of classNames + bools
    @param {Boolean} shouldAdd for class name if a string was passed
    @returns {SC.RenderContext} receiver
  */
  setClass: function(className, shouldAdd) {
    var currentTag = this.currentTag;
    if (!currentTag) return this ;
    
    var classNames, idx, key;
    
    // simple form
    if (shouldAdd !== undefined) {
      return shouldAdd ? this.addClass(className) : this.removeClass(className);
      
    // bulk form
    } else {
      classNames = currentTag.classNames ;
      if (!classNames) currentTag.classNames = classNames = [];
    
      // optimizaton: clone class names...see SC.View
      if (currentTag.cloneClassNames) {
        classNames = currentTag.classNames = classNames.slice();
        currentTag.cloneClassNames = NO ;
      }

      for(key in className) {
        if (!className.hasOwnProperty(key)) continue ;
        idx = classNames.indexOf(key);
        if (className[key]) {
          if (idx<0) classNames.push(key);
        } else {
          if (idx>=0) classNames[idx] = null;
        }
      }
    }
    
    return this ;
  },
  
  // ..........................................................
  // CSS Styles Support
  // 
    
  /**
    Apply the passed styles to the tag.  You can pass either a single key
    value pair or a hash of styles. 
    
    @param {String|Hash} nameOrStyles the style name or a hash of styles
    @param {String|Number} value style value if string name was passed
    @returns {SC.RenderContext} receiver
  */
  css: function(nameOrStyles, value) {
    if (!this.currentTag) return this ;
    var key, styles = this.currentTag.styles;
    if (!styles) this.currentTag.styles = styles = {} ;
    
    // simple form
    if (typeof nameOrStyles === SC.T_STRING) {
      styles[nameOrStyles] = value ;
      
    // bulk form
    } else {
      for(key in nameOrStyles) {
        if (!nameOrStyles.hasOwnProperty(key)) continue ;
        styles[key] = nameOrStyles[key] ;
      }
    }
    
    return this ;
  },
  
  // ..........................................................
  // ARBITRARY ATTRIBUTES SUPPORT
  // 
  
  /**
    Sets the named attribute on the tag.  Note that if you set the 'class'
    attribute or the 'styles' attribute, it will be overwritten by any 
    explicit class or css styles you set using helpers.
    
    @param {String|Hash} nameOrAttrs the attr name or hash of attrs.
    @param {String} value attribute value if attribute name was passed
    @returns {SC.RenderContext} receiver
  */
  attr: function(nameOrAttrs, value) {
    if (!this.currentTag) return this ;
    var key, attrs = this.currentTag.attrs;
    if (!attrs) this.currentTag.attrs = attrs = {} ;
    
    // simple form
    if (typeof nameOrAttrs === SC.T_STRING) {
      attrs[nameOrAttrs] = value ;
      
    // bulk form
    } else {
      for(key in nameOrAttrs) {
        if (!nameOrAttrs.hasOwnProperty(key)) continue ;
        attrs[key] = nameOrAttrs[key] ;
      }
    }
    
    return this ;
  }
  
});
