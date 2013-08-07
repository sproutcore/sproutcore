// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @namespace

  Mix this into any view to indicate that it is a drag handle, and should initiate
  drags under more circumstances. For example, SC.CollectionView#canReorderContent
  doesn't allow reordering on touch devices due to event handling collision (tap-
  drag is used for scrolling). Adding this mixin to a subview of your exampleView
  allows the view to intelligently communicate when to scroll and when to drag.

  Adds a "doesWantDrag" flag to any mouse or touch event which passes through
  it, indicating to downstream responders that a drag operation is desired. (It
  remains up to the downstream responders to decide to initiate a drag.)

  
  @since SproutCore 1.0
*/
SC.DragHandle = {
  // TODO: the business
}