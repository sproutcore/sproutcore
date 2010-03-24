// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
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
    Class names for the theme. All controls using this theme will have these class names
    in their class names; for instance, if the value is ["ace", "light"], all views
    using this theme (including child views of views using this theme) will have class
    names like "sc-view sc-type-view sc-blah-blah ace light".
  */
  classNames: []
});

SC.mixin(SC.Theme, {
  /**@scope SC.Theme */
  /**
    Extends the theme, and makes sure theme.renderers points to the theme's prototype.
  */
  extend: function() {
    var result = SC.Object.extend.apply(this, arguments);
    result.renderers = result.prototype; // make a renderers object so you don't keep typing .prototype.whatever
    return result;
  },
  
  /* Theme management */
  themes: {},
  
  /**
    Finds a theme by name.
  */
  find: function(themeName) {
    var theme = SC.Theme.themes[themeName];
    if (SC.none(theme)) return null;
    return theme;
  },
  
  /**
    Registers a theme with SproutCore, creating an instance of it.
  */
  register: function(themeName, theme) {
    SC.Theme.themes[themeName] = theme.create();
  }
});