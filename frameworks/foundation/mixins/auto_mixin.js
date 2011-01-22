// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
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
  createChildView: function(v, attrs) {
    if (!attrs) attrs = {};
    attrs.owner = attrs.parentView = this;
    attrs.isVisibleInWindow = this.get('isVisibleInWindow');
    if (!attrs.page) attrs.page = this.page;
    
    var applyMixins = this.get("autoMixins");
    applyMixins.push(attrs);
    
    v = v.create.apply(v, applyMixins);
    return v;
  }
};