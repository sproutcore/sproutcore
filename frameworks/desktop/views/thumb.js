// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  @deprecated Use a normal view and mix-in SC.SplitThumb.

  Kept to allow a modicum of backwards-compatibility. Please use
  a normal view and mix in SC.SplitThumb instead.

  @extends SC.View
  @author Alex Iskander
  @test in split
*/
SC.ThumbView = SC.View.extend(SC.SplitThumb,
/** @scope SC.ThumbView.prototype */ {
  classNames: ['sc-thumb-view'],

  init: function() {
    sc_super();
    //@if(debug)
    SC.warn("SC.ThumbView is deprecated. Please use a normal SC.View and mix in SC.SplitThumb instead.");
    //@endif
  }
});
