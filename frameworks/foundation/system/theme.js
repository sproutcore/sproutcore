// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class
  Represents a theme, and is also the core theme in which SC looks for
  other themes.

  If an SC.View has a theme of "ace", it will look in its parent's theme
  for the theme "ace". If there is no parent--that is, if the view is a
  frame--it will look in SC.Theme for the named theme. To find a theme,
  it calls find(themeName) on the theme.

  To be located, themes must be registered either as a root theme (by
  calling SC.Theme.addTheme) or as a child theme of another theme (by
  calling theTheme.addTheme).

  All themes are instances. However, new instances based on the current
  instance can always be created: just call .create(). This method is used
  by SC.View when you name a theme that doesn't actually exist: it creates
  a theme based on the parent theme.

  Renderers
  ---------------------------
  Themes are used to keep track of theme class names and, more important,
  to keep track of renderers.

  Renderers are added to a theme using theme.addRenderer(theRenderer). After
  this has been done, they may be instantiated using theme.renderer(rendererName).

  Instantiating with renderer() instantiates a version of that renderer
  specialized for this specific theme-- not any parent themes. The renderer
  will include all class names for _this_ theme. This means that you can
  theme controls differently without overriding any renderers: just subclass
  the original theme that _has_ the renderers, give it its own name, and
  all renderers will render with that name as a class name.

  Locating Child Themes
  ----------------------------
  Locating child themes is relatively simple for the most part: it looks in
  its own "themes" property, which is an object inheriting from its parent's
  "themes" set, so it includes all parent themes.

  However, it does _not_ include global themes. This is because, when find()
  is called, it wants to ensure any child theme is specialized. That is, the
  child theme should include all class names of the base class theme. This only
  makes sense if the theme really is a child theme of the theme or one of its
  base classes; if the theme is a global theme, those class names should not
  be included.

  This makes sense logically as well, because when searching for a renderer,
  it will locate it in any base theme that has it, but that doesn't mean
  class names from the derived theme shouldn't be included.

  @extends SC.Object
  @since SproutCore 1.1
  @author Alex Iskander
*/
SC.Theme = {
  /**
    Walks like a duck.
  */
  isTheme: YES,

  /**
    Class names for the theme.

    These class names include the name of the theme and the names
    of all parent themes. You can also add your own.
   */
  classNames: SC.CoreSet.create(),

  /**
    @private
    A helper to extend class names with another set of classnames. The
    other set of class names can be a hash, an array, a Set, or a space-
    delimited string.
  */
  _extend_class_names: function(classNames) {
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
    @private
    Helper method that extends this theme with some extra properties.

    Used during Theme.create();
   */
  _extend_self: function(ext) {
    if (ext.classNames) this._extend_class_names(ext.classNames);

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
    Creates a new theme based on this one. The name of the new theme will
    be added to the classNames set.
  */
  create: function() {
    var result = SC.beget(this);
    result.baseTheme = this;

    // if we don't beget themes, the same instance would be shared between
    // all themes. this would be bad: imagine that we have two themes:
    // "Ace" and "Other." Each one has a "capsule" child theme. If they
    // didn't have their own child themes hash, the two capsule themes
    // would conflict.
    if (this.themes === SC.Theme.themes) {
      result.themes = {};
    } else {
      result.themes = SC.beget(this.themes);
    }

    // the theme also specializes all renderers it creates so that they
    // have the theme's classNames and have their 'theme' property set.
    this._specializedRenderers = {};

    // also, the theme specializes all child themes as they are created
    // to ensure that all of the class names on this theme are included.
    this._specializedThemes = {};

    // we could put this in _extend_self, but we don't want to clone
    // it for each and every argument passed to create().
    result.classNames = SC.clone(this.classNames);

    var args = arguments, len = args.length, idx, mixin;
    for (idx = 0; idx < len; idx++) {
      result._extend_self(args[idx]);
    }

    if (result.name) result.classNames.add(result.name);

    return result;
  },

  /**
    Creates a subtheme based on this theme, with the given name,
    and automatically registers it as a child theme.
  */
  subtheme: function(name) {
    // extend the theme
    var t = this.create({ name: name });

    // add to our set of themes
    this.addTheme(t);

    // and return the theme class
    return t;
  },

  //
  // THEME MANAGEMENT
  //

  themes: {},

  /**
    Finds a theme by name within this theme (the theme must have
    previously been added to this theme or a base theme by using addTheme, or
    been registered as a root theme).

    If the theme found is not a root theme, this will specialize the theme so
    that it includes all class names for this theme.
  */
  find: function(themeName) {
    if (this === SC.Theme) return this.themes[themeName];
    var theme;

    // if there is a specialized version (the theme extended with our class names)
    // return that one
    theme = this._specializedThemes[themeName];
    if (theme) return theme;

    // otherwise, we may need to specialize one.
    theme = this.themes[themeName];
    if (theme && !this._specializedThemes[themeName]) {
      return this._specializedThemes[themeName] = theme.create({ classNames: this.classNames });
    }

    // and finally, if it is a root theme, we do nothing to it.
    theme = SC.Theme.themes[themeName];
    if (theme) return theme;

    return null;
  },

  /**
    Adds a child theme to the theme. This allows the theme to be located
    by SproutCore views and such later.

    Each theme is registered in the "themes" property by name. Calling
    find(name) will return the theme with the given name.

    Because the themes property is an object begetted from (based on) any
    parent theme's "themes" property, if the theme cannot be found in this
    theme, it will be found in any parent themes.
  */
  addTheme: function(theme) {
    this.themes[theme.name] = theme;
  },

  /**
    Adds a renderer to the theme. The renderer's name will be used to
    keep track of it and identify it later.

    The biggest responsibility of addRenderer is to ensure that renderer()
    can be used to instantiate that renderer. If a renderer is not instantiated
    through renderer(), it will not know its theme's classNames.
  */
  addRenderer: function(renderer) {
    this[renderer.name] = renderer;
  },

   /**
     Finds the named renderer and instantiates it, returning the result.
     It also ensures it is using a version of the renderer specialized for
     this theme. It keeps a cache of specialized versions of the renderer.

     Any arguments after the name are passed on to the instantiated
     renderer.
   */
  renderer: function(name) {
    var renderer = this._specializedRenderers[name], base = this[name];
    if (!renderer || renderer._specializedFrom !== base) {
      if (!base) return null;

      renderer = base.extend({ classNames: this.classNames, theme: this });
    }

    var args = SC.$A(arguments);
    args.shift();
    renderer = renderer.create.apply(renderer, args);
    return renderer;
  }
};

// SproutCore _always_ has its base theme. This is not quite
// optimal, but the reasoning is because of test running: the
// test runner, when running foundation unit tests, cannot load
// the theme. As such, foundation must include default versions of
// all of its renderers, and it does so in BaseTheme. All SproutCore
// controls have renderers in BaseTheme.
SC.BaseTheme = SC.Theme.create({
  name: "sc-base"
});

SC.Theme.addTheme(SC.BaseTheme);

