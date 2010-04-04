// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace 

  A mixin that automatically mixes in a set of mixins into the child views created
  by this view (that go through createChildView).
  @since SproutCore 1.0
*/
SC.AutoMixin = {
  /**
    The mixins to automatically mix in.
  */
  autoMixins: [],
  
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