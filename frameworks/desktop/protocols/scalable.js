// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @namespace

  This view-layer protocol implements support for applying a scale to a view when, for example, it
  is changed on a scroll view via a pinch gesture.
*/
SC.Scalable = {

  /**
    Quack like a duck.
  */
  isScalable: YES,

  /**
    Implement this method to apply the passed scale to this view.
  */
  applyScale: function(scale) {}
};
