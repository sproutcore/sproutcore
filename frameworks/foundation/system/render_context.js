// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('system/builder');

/** set update mode on context to replace content (preferred) */
SC.MODE_REPLACE = 'replace';

/** set update mode on context to append content */
SC.MODE_APPEND = 'append';

/** set update mode on context to prepend content */
SC.MODE_PREPEND = 'prepend';

/**
  @namespace
  
  A RenderContext is a builder that can be used to generate HTML for views or
  to update an existing element.  Rather than making changes to an element
  directly, you use a RenderContext to queue up changes to the element, 
  finally applying those changes or rendering the new element when you are
  finished.
  
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
SC.RenderContext = SC.Builder.create(/** SC.RenderContext.fn */ {
  
  SELF_CLOSING: SC.CoreSet.create().addEach('area base basefront br hr input img link meta'.w()),
  
  /** 
    When you create a context you should pass either a tag name or an element
    that should be used as the basis for building the context.  If you pass
    an element, then the element will be inspected for class names, styles
    and other attributes.  You can also call update() or replace() to 
    modify the element with you context contents.
    
    If you do not pass any parameters, then we assume the tag name is 'div'.
    
    A second parameter, parentContext, is used internally for chaining.  You
    should never pass a second argument.
    
    @param {String|DOMElement} tagNameOrElement 
    @returns {SC.RenderContext} receiver
  */
  init: function(tagNameOrElement, prevContext) {
    if (tagNameOrElement === undefined) tagNameOrElement = 'div';
    
    // if a prevContext was passed, setup with that first...
    if (prevContext) {
      this.prevObject = prevContext ;
      this.strings = prevContext.strings ;
      this.offset = prevContext.length + prevContext.offset ;
    } 

    if (!this.strings) this.strings = [] ;
    
    // if tagName is string, just setup for rendering new tagName
    this.needsContent = YES ;
    if (SC.typeOf(tagNameOrElement) === SC.T_STRING) {
      this._tagName = tagNameOrElement.toLowerCase();
      this._needsTag = YES ; // used to determine if end() needs to wrap tag
      
      // increase length of all contexts to leave space for opening tag
      var c = this;
      while(c) { c.length++; c = c.prevObject; }
      
      this.strings.push(null);
      this._selfClosing = this.SELF_CLOSING.contains(this._tagName);
    } else {
      this._elem = tagNameOrElement ;
      this._needsTag = NO ;
      this.length = 0 ;
      this.needsContent = NO ;
    }
    
    return this ;
  },
  
  // ..........................................................
  // PROPERTIES
  // 
  
  // NOTE: We store this as an actual array of strings so that browsers that
  // support dense arrays will use them.
  /** 
    The current working array of strings.
    
    @property {Array}
  */
  strings: null,
  
  /** 
    this initial offset into the strings array where this context instance
    has its opening tag.
    
    @property {Number}
  */
  offset: 0,
  
  /**  
    the current number of strings owned by the context, including the opening
    tag.
    
    @property {Number}
  */
  length: 0,
  
  /**
    Specify the method that should be used to update content on the element.
    In almost all cases you want to replace the content.  Very carefully 
    managed code (such as in CollectionView) can append or prepend content
    instead.
    
    You probably do not want to change this propery unless you know what you
    are doing.
    
    @property {String}
  */
  updateMode: SC.MODE_REPLACE,

  /**
    YES if the context needs its content filled in, not just its outer 
    attributes edited.  This will be set to YES anytime you push strings into
    the context or if you don't create it with an element to start with.
  */
  needsContent: NO,
  
  // ..........................................................
  // CORE STRING API
  // 
  
  /**
    Returns the string at the designated index.  If you do not pass anything
    returns the string array.  This index is an offset from the start of the
    strings owned by this context.
    
    @param {Number} idx the index
    @returns {String|Array}
  */
  get: function(idx) {
    var strings = this.strings || [];
    return (idx === undefined) ? strings.slice(this.offset, this.length) : strings[idx+this.offset];
  },
  
  /**
    Adds a string to the render context for later joining.  Note that you can
    pass multiple arguments to this method and each item will be pushed.
    
    @param {String} line the liene to add to the string.
    @returns {SC.RenderContext} receiver
  */
  push: function(line) {
    var strings = this.strings, len = arguments.length;
    if (!strings) this.strings = strings = []; // create array lazily
    
    if (len > 1) {
      strings.push.apply(strings, arguments) ;
    } else strings.push(line);
    
    // adjust string length for context and all parents...
    var c = this;
    while(c) { c.length += len; c = c.prevObject; }
    
    this.needsContent = YES; 
    
    return this;
  },
  
  /**
    Pushes the passed string onto the array, but first escapes the string
    to ensure that no user-entered HTML is processed as HTML.
    
    @param {String} line one or mroe lines of text to add
    @returns {SC.RenderContext} receiver
  */
  text: function(line) {
    var len = arguments.length, idx=0;
    for(idx=0;idx<len;idx++) {
      this.push(SC.RenderContext.escapeHTML(arguments[idx]));
    }
    return this ;
  },
  
  /**
    Joins the strings together, returning the result.  But first, this will
    end any open tags.
    
    @param {String} joinChar optional string to use in joins. def empty string
    @returns {String} joined string
  */
  join: function(joinChar) {

    // generate tag if needed...
    if (this._needsTag) this.end();
    
    var strings = this.strings;
    return strings ? strings.join(joinChar || '') : '' ;
  },
  
  // ..........................................................
  // GENERATING
  // 
  
  /**
    Begins a new render context based on the passed tagName or element.
    Generate said context using end().
    
    @returns {SC.RenderContext} new context
  */
  begin: function(tagNameOrElement) {
    // console.log('%@.begin(%@) called'.fmt(this, tagNameOrElement));
    return SC.RenderContext(tagNameOrElement, this);
  },
  
  /**
    If the current context targets an element, this method returns the 
    element.  If the context does not target an element, this method will 
    render the context into an offscreen element and return it.
    
    @returns {DOMElement} the element
  */
  element: function() {  
    if (this._elem) return this._elem;
    // create factory div if needed
    var ret, child;
    if (!SC.RenderContext.factory) {
      SC.RenderContext.factory = document.createElement('div');
    }
    SC.RenderContext.factory.innerHTML = this.join();
    
    // In IE something weird happens when reusing the same element.
    // After setting innerHTML, the innerHTML of the element in the previous view
    // turns blank. Seems that there is something weird with their garbage 
    // collection algorithm. I tried just removing the nodes after keeping a 
    // reference to the first child, but it didnt work. 
    // Ended up cloning the first child.
    
    if(SC.RenderContext.factory.innerHTML.length>0){
      child = SC.RenderContext.factory.firstChild.cloneNode(true);
      SC.RenderContext.factory.innerHTML = '';
    } else {
      child = null;
    }
    return child ;
  },
  
  /**
    Removes an element with the passed id in the currently managed element.
  */
  remove: function(elementId) {
    // console.log('remove('+elementId+')');
    if (!elementId) return ;
    
    var el, elem = this._elem ;
    if (!elem || !elem.removeChild) return ;
    
    el = document.getElementById(elementId) ;
    if (el) {
      el = elem.removeChild(el) ;
      el = null;
    }
  },
  
  /**
    If an element was set on this context when it was created, this method 
    will actually apply any changes to the element itself.  If you have not
    written any inner html into the context, then the innerHTML of the 
    element will not be changed, otherwise it will be replaced with the new
    innerHTML.
    
    Also, any attributes, id, classNames or styles you've set will be 
    updated as well.  This also ends the editing context session and cleans
    up.
    
    @returns {SC.RenderContext} previous context or null if top 
  */
  update: function() {
    var elem = this._elem, 
        mode = this.updateMode,
        key, value, styles, factory, cur, next, before;
    
    if (!elem) {
      // throw "Cannot update context because there is no source element";
      return ;
    }
    
    // console.log('%@#update() called'.fmt(this));
    // if (this.length>0) console.log(this.join());
    // else console.log('<no length>');
    
    // replace innerHTML
    if (this.length>0) {
      if (mode === SC.MODE_REPLACE) {
        elem.innerHTML = this.join();
      } else {
        factory = elem.cloneNode(false);
        factory.innerHTML = this.join() ;
        before = (mode === SC.MODE_APPEND) ? null : elem.firstChild;
        cur = factory.firstChild ;
        while(cur) {
          next = cur.nextSibling ;
          elem.insertBefore(cur, next);
          cur = next ;
        }
        cur = next = factory = before = null ; // cleanup 
      }
    }
    
    // note: each of the items below only apply if the private variable has
    // been set to something other than null (indicating they were used at
    // some point during the build)
    
    // if we have attrs, apply them
    if (this._attrsDidChange && (value = this._attrs)) {
      for(key in value) {
        if (!value.hasOwnProperty(key)) continue;
        if (value[key] === null) { // remove empty attrs
          elem.removeAttribute(key);
        } else {
          SC.$(elem).attr(key, value[key]);
        }
      }
    }
    
    // class="foo bar"
    if (this._classNamesDidChange && (value = this._classNames)) {
      SC.$(elem).attr('class', value.join(' '));
    }
    
    // id="foo"
    if (this._idDidChange && (value = this._id)) {
      SC.$(elem).attr('id', value);
    }
    
    // style="a:b; c:d;"
    if (this._stylesDidChange && (styles = this._styles)) {
      var pair = this._STYLE_PAIR_ARRAY, joined = this._JOIN_ARRAY;
      for(key in styles) {
        if (!styles.hasOwnProperty(key)) continue ;
        value = styles[key];
        if (value === null) continue; // skip empty styles
        if (typeof value === SC.T_NUMBER) value = value.toString() + "px";
        pair[0] = key.dasherize(); pair[1] = value;
        joined.push(pair.join(': '));
      }
      
      SC.$(elem).attr('style', joined.join('; '));
      joined.length = 0; // reset temporary object
    }
    
    // now cleanup element...
    elem = this._elem = null ;
    return this.prevObject || this ; 
  },
  
  // these are temporary objects are reused by end() to avoid memory allocs.
  _DEFAULT_ATTRS: {},
  _TAG_ARRAY: [],
  _JOIN_ARRAY: [],
  _STYLE_PAIR_ARRAY: [],
  
  /**
    Ends the current tag editing context.  This will generate the tag string
    including any attributes you might have set along with a closing tag.
    
    The generated HTML will be added to the render context strings.  This will
    also return the previous context if there is one or the receiver.
    
    If you do not have a current tag, this does nothing.
     
    @returns {SC.RenderContext} 
  */
  end: function() {
    // console.log('%@.end() called'.fmt(this));
    // NOTE: If you modify this method, be careful to consider memory usage
    // and performance here.  This method is called frequently during renders
    // and we want it to be as fast as possible.

    // generate opening tag.
    
    // get attributes first.  Copy in className + styles...
    var tag = this._TAG_ARRAY, pair, joined, key ;
    var attrs = this._attrs, className = this._classNames ;
    var id = this._id, styles = this._styles;
    
    // add tag to tag array
    tag[0] = '<';  tag[1] = this._tagName ;
    
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
          pair[0] = key.dasherize() ;
          pair[1] = styles[key];
          if (pair[1] === null) continue; // skip empty styles
          
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
        if (attrs[key] === null) continue ; // skip empty attrs
        tag.push(key);
        tag.push('="');
        tag.push(attrs[key]) ;
        tag.push('" ') ;
      }
      
      // if we are using the DEFAULT_ATTRS temporary object, make sure we 
      // reset.
      if (attrs === this._DEFAULT_ATTRS) {
        delete attrs.style;  delete attrs['class']; delete attrs.id;
      }
      
    }
    
    // this is self closing if there is no content in between and selfClosing
    // is not set to false.
    var strings = this.strings;
    var selfClosing = (this._selfClosing === NO) ? NO : (this.length === 1) ;
    tag.push(selfClosing ? ' />' : '>') ;
    
    // console.log('selfClosing == %@'.fmt(selfClosing));
    
    strings[this.offset] = tag.join('');
    tag.length = 0 ; // reset temporary object
    
    // now generate closing tag if needed...
    if (!selfClosing) {
      tag[0] = '</' ;
      tag[1] = this._tagName;
      tag[2] = '>';
      strings.push(tag.join(''));
      
      // increase length of receiver and all parents
      var c = this;
      while(c) { c.length++; c = c.prevObject; }
      tag.length = 0; // reset temporary object again
    }
    
    // if there was a source element, cleanup to avoid memory leaks
    this._elem = null;
    
    return this.prevObject || this ;
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
    
  // ..........................................................
  // BASIC HELPERS
  // 
  
  /**
    Reads outer tagName if no param is passed, sets tagName otherwise.
    
    @param {String} tagName pass to set tag name.
    @returns {String|SC.RenderContext} tag name or receiver
  */
  tagName: function(tagName) {
    if (tagName === undefined) {
      if (!this._tagName && this._elem) this._tagName = this._elem.tagName;
      return this._tagName;
    } else {
      this._tagName = tagName;
      this._tagNameDidChange = YES;
      return this ;
    }
  },
  
  /**
    Reads the outer tag id if no param is passed, sets the id otherwise.
    
    @param {String} idName the id or set
    @returns {String|SC.RenderContext} id or receiver
  */
  id: function(idName) {
    if (idName === undefined) {
      if (!this._id && this._elem) this._id = this._elem.id;
      return this._id ;
    } else {
      this._id = idName;
      this._idDidChange = YES;
      return this;
    }
  },
  
  // ..........................................................
  // CSS CLASS NAMES SUPPORT
  // 
  
  /**
    Reads the current classNames array or sets the array if a param is passed.
    Note that if you get the classNames array and then modify it, you MUST 
    call this method again to set the array or else it may not be copied to
    the element.

    If you do pass a classNames array, you can also pass YES for the 
    cloneOnModify param.  This will cause the context to clone the class names
    before making any further edits.  This is useful is you have a shared 
    array of class names you want to start with but edits should not change
    the shared array.
    
    @param {Array} classNames array 
    @param {Boolean} cloneOnModifiy
    @returns {Array|SC.RenderContext} classNames array or receiver
  */
  classNames: function(classNames, cloneOnModify) {
    if (classNames === undefined) {
      if (!this._classNames && this._elem) {
        this._classNames = (SC.$(this._elem).attr('class')||'').split(' ');
      }
      
      if (this._cloneClassNames) {
        this._classNames = (this._classNames || []).slice();
        this._cloneClassNames = NO ;
      }

      // if there are no class names, create an empty array but don't modify.
      if (!this._classNames) this._classNames = [];
      
      return this._classNames ;
    } else {
      this._classNames = classNames ;
      this._cloneClassNames = cloneOnModify || NO ;
      this._classNamesDidChange = YES ;
      return this ;
    }
  },
  
  /**
    Returns YES if the outer tag current has the passed class name, NO 
    otherwise.
    
    @param {String} className the class name
    @returns {Boolean}
  */
  hasClass: function(className) {
    return this.classNames().indexOf(className) >= 0;  
  },
  
  /**
    Adds the specified className to the current tag, if it does not already
    exist.  This method has no effect if there is no open tag.
    
    @param {String} className the class to add
    @returns {SC.RenderContext} receiver
  */
  addClass: function(className) {
    var classNames = this.classNames() ; // handles cloning ,etc.
    if (classNames.indexOf(className)<0) {
      classNames.push(className);
      this._classNamesDidChange = YES ;
    }
    return this;
  },
  
  /**
    Removes the specified className from the current tag.  This method has 
    no effect if there is not an open tag.
    
    @param {String} className the class to add
    @returns {SC.RenderContext} receiver
  */
  removeClass: function(className) {
    var classNames = this._classNames, idx;
    if (!classNames && this._elem) {
      classNames = this._classNames = 
        (SC.$(this._elem).attr('class')||'').split(' ');
    }

    if (classNames && (idx=classNames.indexOf(className))>=0) {
      if (this._cloneClassNames) {
        classNames = this._classNames = classNames.slice();
        this._cloneClassNames = NO ;
      }

      // if className is found, just null it out.  This will end up adding an
      // extra space to the generated HTML but it is faster than trying to 
      // recompact the array.
      classNames[idx] = null;
      this._classNamesDidChange = YES ;
    }
    
    return this;
  },
  
  /**
    Removes all classnames from the currentContext.  
    
    @returns {SC.RenderContext} receiver
  */
  resetClassNames: function() {
    this._classNames = [];
    this._classNamesDidChange = YES ;
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
    var classNames, idx, key, didChange;
    
    // simple form
    if (shouldAdd !== undefined) {
      return shouldAdd ? this.addClass(className) : this.removeClass(className);
      
    // bulk form
    } else {
      
      classNames = this._classNames ;
      if (!classNames && this._elem) {
        classNames = this._classNames = 
          (SC.$(this._elem).attr('class')||'').split(' ');
      }
      if (!classNames) classNames = this._classNames = [];
    
      if (this._cloneClassNames) {
        classNames = this._classNames = classNames.slice();
        this._cloneClassNames = NO ;
      }

      didChange = NO;
      for(key in className) {
        if (!className.hasOwnProperty(key)) continue ;
        idx = classNames.indexOf(key);
        if (className[key]) {
          if (idx<0) { classNames.push(key); didChange = YES; }
        } else {
          if (idx>=0) { classNames[idx] = null; didChange = YES; }
        }
      }
      if (didChange) this._classNamesDidChange = YES;
    }
    
    return this ;
  },
  
  // ..........................................................
  // CSS Styles Support
  // 
    
  _STYLE_REGEX: /\s*([^:\s]+)\s*:\s*([^;\s]+)\s*;?/g,
  
  /**
    Retrieves or sets the current styles for the outer tag.  If you retrieve
    the styles hash to edit it, you must set the hash again in order for it 
    to be applied to the element on rendering.
    
    Optionally you can also pass YES to the cloneOnModify param to cause the
    styles has to be cloned before it is edited.  This is useful if you want
    to start with a shared style hash and then optionally modify it for each
    context.
    
    @param {Hash} styles styles hash
    @param {Boolean} cloneOnModify
    @returns {Hash|SC.RenderContext} styles hash or receiver
  */
  styles: function(styles, cloneOnModify) {
    var attr, regex, match;
    if (styles === undefined) {
      
      // no styles are defined yet but we do have a source element.  Lazily
      // extract styles from element.
      if (!this._styles && this._elem) {
        // parse style...
        attr = SC.$(this._elem).attr('style');
        
        if (attr && (attr = attr.toString()).length>0) {
          if(SC.browser.msie){ 
            attr = attr.toLowerCase();
          }
          styles = {};
          
          regex = this._STYLE_REGEX ;
          regex.lastIndex = 0;
          
          while(match = regex.exec(attr)) styles[match[1].camelize()] = match[2];
          
          this._styles = styles;
          this._cloneStyles = NO;
          
        } else {
          this._styles = {};
        }
        
      // if there is no element or we do have styles, possibly clone them
      // before returning.
      } else {
        if (!this._styles) {
          this._styles = {};
        } else {
          if (this._cloneStyles) {
            this._styles = SC.beget(this._styles);
            this._cloneStyles = NO ;
          }
        }
      }
      
      return this._styles ;
      
    // set the styles if passed.
    } else {
      this._styles = styles ;
      this._cloneStyles = cloneOnModify || NO ;
      this._stylesDidChange = YES ;
      return this ;
    }
  },
  
  /**
    Apply the passed styles to the tag.  You can pass either a single key
    value pair or a hash of styles.  Note that if you set a style on an 
    existing element, it will replace any existing styles on the element.
    
    @param {String|Hash} nameOrStyles the style name or a hash of styles
    @param {String|Number} value style value if string name was passed
    @returns {SC.RenderContext} receiver
  */
  addStyle: function(nameOrStyles, value) {
    
    // get the current hash of styles.  This will extract the styles and 
    // clone them if needed.  This will get the actual styles hash so we can
    // edit it directly.
    var key, didChange = NO, styles = this.styles();
    
    // simple form
    if (typeof nameOrStyles === SC.T_STRING) {
      if (value === undefined) { // reader
        return styles[nameOrStyles];
      } else { // writer
        if (styles[nameOrStyles] !== value) {
          styles[nameOrStyles] = value ;
          this._stylesDidChange = YES ;
        }
      }
      
    // bulk form
    } else {
      for(key in nameOrStyles) {
        if (!nameOrStyles.hasOwnProperty(key)) continue ;
        value = nameOrStyles[key];
        if (styles[key] !== value) {
          styles[key] = value;
          didChange = YES;
        }
      }
      if (didChange) this._stylesDidChange = YES ;
    }
    
    return this ;
  },
  
  /**
    Removes the named style from the style hash.
    
    Note that if you delete a style, the style will not actually be removed
    from the style hash.  Instead, its value will be set to null.
    
    @param {String} styleName
    @returns {SC.RenderContext} receiver
  */
  removeStyle: function(styleName) {
    // avoid case where no styles have been defined
    if (!this._styles && !this._elem) return this;
    
    // get styles hash.  this will clone if needed.
    var styles = this.styles();
    if (styles[styleName]) {
      styles[styleName] = null;
      this._stylesDidChange = YES ;
    }
  },
  
  // ..........................................................
  // ARBITRARY ATTRIBUTES SUPPORT
  // 
  
  /**
    Sets the named attribute on the tag.  Note that if you set the 'class'
    attribute or the 'styles' attribute, it will be ignored.  Use the 
    relevant class name and style methods instead.
    
    @param {String|Hash} nameOrAttrs the attr name or hash of attrs.
    @param {String} value attribute value if attribute name was passed
    @returns {SC.RenderContext} receiver
  */
  attr: function(nameOrAttrs, value) {
    var key, attrs = this._attrs, didChange = NO ;
    if (!attrs) this._attrs = attrs = {} ;
    
    // simple form
    if (typeof nameOrAttrs === SC.T_STRING) {
      if (value === undefined) { // getter
        return attrs[nameOrAttrs];
      } else { // setter
        if (attrs[nameOrAttrs] !== value) {
          attrs[nameOrAttrs] = value ;
          this._attrsDidChange = YES ;
        }
      }
      
    // bulk form
    } else {
      for(key in nameOrAttrs) {
        if (!nameOrAttrs.hasOwnProperty(key)) continue ;
        value = nameOrAttrs[key];
        if (attrs[key] !== value) {
          attrs[key] = value ;
          didChange = YES ;
        }
      }
      if (didChange) this._attrsDidChange = YES ;
    }
    
    return this ;
  }
  
});

/**
  html is an alias for push().  Makes thie object more CoreQuery like
*/
SC.RenderContext.fn.html = SC.RenderContext.fn.push;

/**
  css is an alias for addStyle().  This this object more CoreQuery like.
*/
SC.RenderContext.fn.css = SC.RenderContext.fn.addStyle;

/** 
  Helper method escapes the passed string to ensure HTML is displayed as 
  plain text.  You should make sure you pass all user-entered data through
  this method to avoid errors.  You can also do this with the text() helper
  method on a render context.
*/


if (!SC.browser.isSafari || parseInt(SC.browser.version, 10) < 526) {
  SC.RenderContext._safari3 = YES;
}

SC.RenderContext.escapeHTML = function(text) {
  var elem, node, ret ;
  
  if (SC.none(text)) return text; // ignore empty
  
  elem = this.escapeHTMLElement;
  if (!elem) elem = this.escapeHTMLElement = document.createElement('div');
  
  node = this.escapeTextNode;
  if (!node) {
    node = this.escapeTextNode = document.createTextNode('');
    elem.appendChild(node);
  }
  
  node.data = text ;
  ret = elem.innerHTML ;
  
  // Safari 3 does not escape the '>' character
  if (SC.RenderContext._safari3) { ret = ret.replace(/>/g, '&gt;'); }

  node = elem = null;
  return ret ;
};
