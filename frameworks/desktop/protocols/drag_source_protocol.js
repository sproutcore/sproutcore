// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/drag') ;

/** @namespace
  The `SC.DragSourceProtocol` protocol defines the properties and methods that you may implement in
  your drag source objects in order to access additional functionality of SproutCore's drag support.

  If you implement the `SC.DragSourceProtocol` protocol on your drag's source, it will receive a
  series of callbacks throughout the course of the drag, and be consulted about what operations to
  allow on a particular candidate drop target. Note that when you initiate a drag you must also
  provide an object implementing `SC.DragDataSourceProtocol`, which includes some *required*
  methods. A single object may serve as both the drag's source and its data source.

  *Note: Do not mix `SC.DragSourceProtocol` into your classes. As a protocol, it exists only for
  reference sake. You only need define any of the properties or methods listed below in order to use
  this protocol.*
*/
SC.DragSourceProtocol = {

  /**
    Return a bitwise OR'd mask of the drag operations allowed on the
    specified target.  If you don't care about the target, just return a
    constant value. If a drag's source does not implement this method,
    it will assume that any drag operation (SC.DRAG_ANY) is allowed.

    @param {SC.Drag} drag The SC.Drag instance managing this drag.
    @param {SC.View} dropTarget The proposed target of the drop.
  */
  dragSourceOperationMaskFor: function(drag, dropTarget) {
    return SC.DRAG_ANY;
  },

  /**
    If this property is set to `NO` or is not implemented, then the user may
    modify the drag operation by changing the modifier keys they have
    pressed.

    @type Boolean
    @default NO
  */
  ignoreModifierKeysWhileDragging: NO,

  /**
    This method is called when the drag begins. You can use this to do any
    visual highlighting to indicate that the receiver is the source of the
    drag.

    @param {SC.Drag} drag The Drag instance managing this drag.
    @param {Point} loc The point in *window* coordinates where the drag
      began.  You can use convertOffsetFromView() to convert this to local
      coordinates.
  */
  dragDidBegin: function(drag, loc) {},

  /**
    This method is called whenever the drag image is moved.  This is
    similar to the `dragUpdated()` method called on drop targets.

    @param {SC.Drag} drag The Drag instance managing this drag.
    @param {Point} loc  The point in *window* coordinates where the drag
      mouse is.  You can use convertOffsetFromView() to convert this to local
      coordinates.
  */
  dragDidMove: function(drag, loc) {},

  /**
    This method is called if the drag ends and is successfully handled by a
    drop target (i.e. the drop target returns any operation other than
    SC.DRAG_NONE).

    @param {SC.Drag} drag The drag instance managing the drag.
    @param {Point} loc The point in WINDOW coordinates where the drag
      ended.
    @param {DragOp} op The drag operation that was performed. One of
      SC.DRAG_COPY, SC.DRAG_MOVE, or SC.DRAG_LINK.
  */
  dragDidSucceed: function(drag, loc, op) {},

  /**
    This method is called if the drag ends without being handled, or if a drop
    target handles it but returns SC.DRAG_NONE.

    @param {SC.Drag} drag The drag instance managing the drag.
    @param {Point} loc The point in WINDOW coordinates where the drag
      ended.
    @param {DragOp} op Provided for consistency. Always SC.DRAG_NONE.
  */
  dragDidCancel: function(drag, loc, op) {},

  /**
    This method is called when the drag ended, regardless of whether it succeeded
    or not. You can use this to do any cleanup.

    @param {SC.Drag} drag The drag instance managing the drag.
    @param {Point} loc The point in WINDOW coordinates where the drag
      ended.
    @param {DragOp} op The drag operation that was performed. One of
      SC.DRAG_COPY, SC.DRAG_MOVE, SC.DRAG_LINK, or SC.DRAG_NONE.
  */
  dragDidEnd: function(drag, loc, op) {},

  /**
    If a drag is canceled or not handled, and has its slideBack property set
    to YES, then the drag's ghost view will slide back to its initial location.
    dragDidEnd is called immediately upon mouseUp; dragSlideBackDidEnd is called
    after the slide-back animation completes.

    @param {SC.Drag} drag The drag instance managing the drag.
  */
  dragSlideBackDidEnd: function(drag) {}

};
