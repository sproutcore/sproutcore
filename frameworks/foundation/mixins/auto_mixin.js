// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  Use this mixin to automatically mix in a a collection of mixins into all
  child views created _by the view_ (that are created at view initialization).

  @since SproutCore 1.0
*/
SC.AutoMixin = {

  /**
    The mixins to automatically mix in.
    @property
  */
  autoMixins: [],

  /**
    @private
    Override createChildViews to mix in the mixins defined in autoMixins.
  */
  createChildView: function(view, attrs) {
    if (!view.isClass) {
      attrs = view;
    } else {
      // attrs should always exist...
      if (!attrs) { attrs = {}; }
      // clone the hash that was given so we do not pollute it if it's being reused
      else { attrs = SC.clone(attrs); }
    }

    attrs.owner = attrs.parentView = this;
    if (!attrs.page) attrs.page = this.page;

    if (view.isClass) {
      // Track that we created this view.
      attrs.createdByParent = true;

      var applyMixins = this.get("autoMixins");

      applyMixins = SC.clone(applyMixins);
      applyMixins.push(attrs);

      view = view.create.apply(view, applyMixins);
    }

    return view;
  }

};