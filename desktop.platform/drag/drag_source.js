// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('drag/drag') ;

/**
  @namespace

  The DataSource protocol is used to dynamically generate multiple types of
  data from a single object.  You must implement this protocol if you want to
  provide the data for a drag event.

*/
SC.DragSource = {

  /**  
  
    This method is called when the drag begins. You can use this to do any
    visual highlighting to indicate that the receive is the source of the 
    drag.
  
    @param {SC.Drag} drag The Drag instance managing this drag.
  
    @param {Point} atPoint  The point in *window* coordinates where the drag 
      began.  You can use convertOffsetFromView() to convert this to local 
      coordinates.
  */
  dragDidBegin: function(drag, atPoint) {},
  
  /**  
    This method is called when the drag ended. You can use this to do any
    cleanup.  The operation is the actual operation performed on the drag.
  
    @param {SC.Drag} drag The drag instance managing the drag.
  
    @param {Point} endPoint The point in WINDOW coordinates where the drag 
      ended. 
  
    @param {String} operation The drag operation that was performed. One of 
      SC.DRAG_COPY, SC.DRAG_MOVE, SC.DRAG_LINK, or SC.DRAG_NONE.
  
  */
  dragDidEnd: function(drag, endPoint, operation) {},
  
  /**
    This method is called whenever the drag image is moved.  This is
    similar to the dragUpdated() method called on drop targets.
  */
  dragDidMove: function(drag, newPoint) {},
  
  /**
    This method must be overridden for drag operations to be allowed. 
    Return a bitwise OR'd mask of the drag operations allowed on the
    specified target.  If you don't care about the target, just return a
    constant value.
  
    @param dropTarget The proposed target of the drop.
    @param drag The SC.Drag instance managing this drag.
  
  */
  dragSourceOperationMaskFor: function(dropTarget, drag) {
    return SC.DRAG_NONE ;
  },
  
  /**
    If this property is set to NO or is not implemented, then the user may
    modify the drag operation by changing the modifier keys they have 
    pressed.
  */
  ignoreModifierKeysWhileDragging: NO
    
} ;

