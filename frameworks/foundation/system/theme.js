// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  Represents a theme. Also is the singleton theme manager.
  
  @extends SC.Object
  @since SproutCore 1.1
*/
SC.Theme = SC.Object.extend({
  /**@scope SC.Theme.prototype */
  concatenatedProperties: "classNames".w(),
  
  /**
    Walks like a duck.
  */
  isTheme: YES,
  
  /**
    Class names for the theme. All controls using this theme will have these class names
    in their class names; for instance, if the value is ["ace", "light"], all views
    using this theme (including child views of views using this theme) will have class
    names like "sc-view sc-type-view sc-blah-blah ace light".
  */
  classNames: [],
  
  /**
    Finds a theme within this theme or any parent theme.
  */
  find: function(name) {
    var p = this.themeClass, theme = null;

    // call find on our class and each parent.
    while (p && !theme) {
      theme = p.find(name); // this is on the class, mind, not the instance
      p = p.baseTheme;
    }
    
    return theme;
  }
  
});

SC.mixin(SC.Theme, {
  /**@scope SC.Theme */
  /**
    Extends the theme, and makes sure theme.renderers points to the theme's prototype.
  */
  extend: function() {
    var result = SC.Object.extend.apply(this, arguments);
    result.themes = {}; // make sure each has their own theme set
    result.baseTheme = this;
    result.prototype.themeClass = result; // a convenience.
    result.renderers = result.prototype; // make a renderers object so you don't keep typing .prototype.whatever
    return result;
  },
  
  /**
    Creates a light subtheme based on this theme with the specified class names. 
    This basically is a shortcut for extending in certain simple cases.
    
    It automatically adds it to the parent theme (this).
  */
  subtheme: function(name, classNames) {
    // extend the theme
    var t = this.extend({
      classNames: SC.$A(classNames)
    });
    
    // add to our set of themes
    this.register(name, t);
    
    // and return the theme class
    return t;
  },
  
  /* Theme management */
  themes: {},
  
  /**
    Finds a theme by name.
  */
  find: function(themeName) {
    var theme = this.themes[themeName];
    if (SC.none(theme)) return null;
    return theme;
  },
  
  /**
    Registers a theme with SproutCore, creating an instance of it.
  */
  register: function(themeName, theme) {
    var t = theme.create();
    this.themes[themeName] = t;
    return t;
  }
});

// SproutCore _always_ has its base theme (worst case scenario, eh?)
SC.BaseTheme = SC.Theme.extend({
  classNames: []
});

SC.Theme.register("sc-base", SC.BaseTheme);
SC.defaultTheme = 'sc-base';
