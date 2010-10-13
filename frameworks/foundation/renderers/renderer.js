// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// technically, _we_ don't need it. But the individual renderers that sc_require this
// DO need it.
sc_require("system/theme");

/** @class
  Renderers handle rendering to a RenderContext and using jQuery to update
  what they rendered.

  SC.Renderer has a few built-in helpers. It has built-in classNames support;
  to integrate those classNames, just call renderClassNames(context) from
  your render() method, and updateClassNames(query) from your update() method.

  SC.Renderer also has some built-in ability to handle sizes. First, if the
  'size' parameter is set on the renderer (by the view), and it is a string,
  that string will be added as a class name.

  However, SC.Renderer also supports 'automatic' sizing. If the renderer
  is supplied with a frame (containing width and height properties), and
  the renderer also has a "sizes" property (see docs for "sizes"), the smallest
  size that will fit the frame will be used.

  Finally, SC.Renderer keeps track of what properties have changed. Whenever
  a property is changed through .attr(), it will be marked; if you then call
  hasChanged(property), it will return YES. To reset all of the flags, just
  call this.resetChanges().

  Using a Renderer
  --------------------------------------------
  You may use a renderer from inside a view, or even from inside another
  renderer:

      // using inside an SC.View
      render: function(context, firstTime) {

        // first, prepare some settings for the renderer. Here are some
        // typical settings you might prepare:
        var size = this.get('controlSize');
        var settings = {
          title: this.get('title'),
          icon: this.get('icon'),
          classNames: {
            selected: this.get('isSelected')
          },
          size: size === SC.AUTO_CONTROL_SIZE ? this.get('frame') : size
        };

        // now, instantiate and render the renderer, or just update it.
        if (firstTime) {
          this._buttonRenderer = this.get('theme').renderer(SC.BUTTON_RENDERER);
          this._buttonRenderer.attr(settings);
          this._buttonRenderer.render(context);
        } else {
          // note that update() takes a jQuery/CoreQuery object, NOT
          // a RenderContext, as it updates DOM more directly.
          this._buttonRenderer.attr(settings);
          this._buttonRenderer.update(context.$());
        }
      },

      // using from an SC.Renderer
      render: function(context) {
        sc_super(); // gets class names, size, etc.

        context.push('<span class = "title">');
        this._titleRenderer = this.theme.renderer(SC.TITLE_RENDERER);
        this._titleRenderer.attr({ title: this.title, icon: this.icon });
        this._titleRenderer.render(context);
        context.push('</span>');
      },

      update: function(query) {
        this.updateClassNames(query);
        this._titleRenderer.update(query.find('.title'));
      }

*/
SC.Renderer = {
  /**
    All Renderers must have a name. This name will be used to reference them
    in their parent theme (theme.getRenderer(rendererName)), and will also
    be added as a class name. For performance reasons, it will NOT be
    present in the classNames CoreSet. Instead, it will be added as a
    class name by the base render() method.
  */
  name: '(unnamed)',

  /**
    This describes what style this element is in. It consists of the theme
    class names plus the renderer name plus any class names you add.

    The theme class names are added when you register the renderer with the
    theme.

    You can add class names during renderer definition by setting the
    classNames property to a string (which may be a single class name
    or multiple separated by spaces), an array, an SC.CoreSet, or a
    hash (which also allows you to remove class names in case you need
    some wacky hack-- not recommended).
  */
  classNames: SC.CoreSet.create(),

  /**
    Sizes, if present, should be an array of hashes. Each hash should
    have a name, and either a width, a height, or both a width and height.

    If supplied with a size property that is a frame (a hash containing 
    a width and height), SC.Renderer will loop through these hashes until
    it finds one that the supplied frame may fit inside of.

    'sizes' may be left null; in this case, no automatic size processing
    will occur.

    Example Code:
    
        #js
        sizes: [
          { name: SC.REGULAR_CONTROL_SIZE, height: 24 },
          { name: SC.HUGE_CONTROL_SIZE, height: 32 }
        ]

        // if 'size' is set to SC.SMALL_CONTROL_SIZE, SC.SMALL_CONTROL_SIZE
        // will be used.
        //
        // if 'size' is set to { width: 30, height: 20 },
        // SC.REGULAR_CONTROL_SIZE will be used.
        //
        // if 'size' is set to { width: 30, height: 32 },
        // SC.HUGE_CONTROL_SIZE will be used.
   */
  sizes: null,

  /**
    The size, if any, in which to render this control.
   */
  size: null,

  /**
    Based on the 'size' and 'sizes' property, returns the name of
    the size for this renderer.
  */
  calculateSize: function() {
    var size = this.get(size);
    if (!size) return null;
    if (typeof size === "string") return size;

    // note that the calculation won't change unless size changes,
    // and as such, we can replace size with the calculated string
    // for caching.
    var sizes = this.sizes;
    if (!sizes) return null;

    // we just return the first one that fits.
    var idx, len = sizes.length, s;
    for (idx = 0; idx < len; idx++) {
      s = sizes[idx];

      if (s.width && size.width > s.width) continue;
      if (s.height && size.height > s.height) continue;

      this.size = s.name;
      return s.name;
    }
  },

  /**
    Sets the renderer's class names to the context. This is a helper
    you may call from render.

    This does diffing to ensure that all class names in the previously
    rendered classNames set are included or excluded, in case the render
    did or did not clear the class names.
   */
  renderClassNames: function(context) {
    var cn = {}, size = this.calculateSize();

    // do diffing by setting all of last to NO, then
    // setting all of this time to YES
    var last = this._LAST_CLASS_NAMES, current = this.classNames,
        len, idx;

    if (last) {
      len = last.length;
      for (idx = 0; idx < len; idx++) cn[last[idx]] = NO;
    } else {
      // we don't need one for diffing, but we'll need _LAST_CLASS_NAMES
      // to store the current class names for later.
      last = this._LAST_CLASS_NAMES = SC.CoreSet.create();
    }

    // we don't need any of the old entries anymore.
    last.clear();

    // NOTE: we don't need to diff name, because it should stay the same.
    len = current.length;
    for (idx = 0; idx < len; idx++) {
      cn[current[idx]] = YES;
      last.add(cn[current[idx]]);
    }

    if (size) {
      cn[size] = YES;
      last.add(size);
    }

    cn[this.name] = YES;
    context.setClass(cn);
    return cn;
  },

  /**
    Like renderClassNames, but for use from update() method.
   */
  updateClassNames: function(query) {
    var cn = {}, size = this.calculateSize();

    // do diffing by setting all of last to NO, then
    // setting all of this time to YES
    var last = this._LAST_CLASS_NAMES, current = this.classNames,
        len, idx;

    if (last) {
      len = last.length;
      for (idx = 0; idx < len; idx++) cn[last[idx]] = NO;
    } else {
      // we don't need one for diffing, but we'll need _LAST_CLASS_NAMES
      // to store the current class names for later.
      last = this._LAST_CLASS_NAMES = SC.CoreSet.create();
    }

    // we don't need any of the old entries anymore.
    last.clear();

    // NOTE: we don't need to diff name, because it should stay the same.
    len = current.length;
    for (idx = 0; idx < len; idx++) {
      cn[current[idx]] = YES;
      last.add(cn[current[idx]]);
    }


    if (size) {
      cn[size] = YES;
      last.add(size);
    }

    query.setClass(cn);
    return cn;
  },

  //
  // FUNCTIONS SUBCLASSES SHOULD/MAY IMPLEMENT
  //

  /**
    You should implement this to render to a RenderContext. You can use 
    this.propertyName to fetch the value of any renderer properties.

    The default implementation calls renderClassNames; you can call this
    yourself, or use sc_super();
  */
  render: function(context) {
    this.renderClassNames(context);
  },
  
  /**
    You should implement update() to update DOM directly. update() will
    be supplied with a CoreQuery object with which to update DOM.

    If you do not override update(), the default behavior is to create
    a render context and use it to call render().

    As SC.View will clear out class names, make sure that you
    always call query.setClass with ALL class names you could possibly
    set, as there is no guarantee as to whether the caller cleared
    the class names or not.
  */
  update: function(query) {
    var context = SC.RenderContext(query[0]);
    this.render(context);
    context.update();
  },
  
  /**
    @private May be used for pooling.
  */
  destroy: function() {
    
  },

  /**
    Extends the set of class names on this renderer with the class
    names supplied (which may be a set, a string, a hash, etc.)
   */
  extendClassNames: function(classNames) {
    // class names may be a CoreSet, array, string, or hash
    if (classNames) {
      if (SC.typeOf(classNames) === SC.T_HASH && !classNames.isSet) {
        for (className in classNames) {
          if (classNames[className]) this.classNames.add(className);
          else this.classNames.remove(className);
        }
      } else if (typeof classNames === "string") {
        this.classNames.addEach(classNames.split(' '));
      } else {
        // it must be an array or another CoreSet... same difference.
        this.classNames.addEach(classNames);
      }
    }
  },

  /**
    Extends the renderer with the supplied hash. You would usually
    call this from inside your init() method if you want to handle
    a hash of properties; this allows the hash passed to init to have
    functions that will work with sc_super, and that classNames will work.
   */
  extendSelf: function(ext) {
    this.classNames = SC.clone(this.classNames);
    if (ext.classNames) this.extendClassNames(ext.classNames);

    // mixin while enabling sc_super();
    var key, value, cur;
    for (key in ext) {
      if (key === 'classNames') continue; // already handled.
      if (!ext.hasOwnProperty(key)) continue;

      value = ext[key];
      if (value instanceof Function && !value.base && (value !== (cur=this[key]))) {
        value.base = cur;
      }

      this[key] = value;
    }
  },


  /**
    You know SC.Object.extend? This is like that, but for renderers.
   */
  extend: function(ext) {
    var ret = SC.beget(this);
    ret.extendSelf(ext);

    ret.superclass = this;

    return ret;
  },
 
  /**
   Creates an instance of the renderer.

   It calls the  init function with all arguments provided to create().
   This is slightly different .
  */
  create: function(attrs) {
    var ret = SC.beget(this);

    ret.init.apply(ret, arguments);

    return ret;
  },

  /**
    @private for now. At some point we'll encourage the constructor
    to be more powerful, but until we have a template, keeping it private.
  */
  init: function(attrs) {
    if (attrs) {
      this.extendSelf(attrs);
    }
  },
 
  /**
    Sets one or more attributes. Also marks the properties that have been
    changed so that you can update only what has changed in the update() method.
  */
  attr: function(key, value) {
    var changes = this.changes, didChange, opts, l, i;

    if (typeof key === SC.T_STRING) {
      if (value === undefined) return this[key];
      if (key === 'classNames') {
        this.extendClassNames(value);
        didChange = YES;
      } else if (this[key] !== value) {
        didChange = YES;
        this[key] = value;
      }

      if (!didChange) return this;

      if (!changes) changes = this.changes = SC.CoreSet.create();
      changes.add(key);
      return this;
    } else {
      opts = key;
      for(key in opts) {
        if (!opts.hasOwnProperty(key)) continue;
        value = opts[key];

        didChange = NO;
        if (key === 'classNames') {
          this.extendClassNames(value);
          didChange = YES;
        } else if (this[key] !== value) {
          this[key] = value;
          didChange = YES;
        }

        if (didChange) {
          if (!changes) changes = this.changes = SC.CoreSet.create();
          changes.add(key);
        }
      }
      return this;
    }
  },

  /**
    You may call this to see if _anything_ has changed.
   */
  hasChanges: function() {
    if (!this.changes || this.changes.length === 0) return NO;
    return YES;
  },

  /**
    You may call this to see if a specific property did change.
   */
  didChange: function(key){
    if (!this.changes) return NO;
    return this.changes.contains(key);
  },

  /**
    Resets the change tracking. You may do this, for instance, after
    you have processed all of the changes.
   */
  resetChanges: function() {
    if (this.changes) this.changes.clear();
  },

  toString: function() {
    return "SC.Renderer(" + this.name + ")#" + SC.guidFor(this);
  }
};
