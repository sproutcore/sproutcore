// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('drag/drag');

/**
  @namespace
  
  Add the droppable mixin to your view to be able to accept drop events.  You
  should also override the methods below as needed to handle accepting of 
  events.
  
  See the method descriptions for more information on what you need to
  implement.
*/
SC.DropTarget = {

  /** Must be true when your view is instantiated.
  
    Drop targets must be specially registered in order to receive drop
    events.  SproutCore knows to register your view when this property
    is true on view creation.
  */  
  isDropTarget: true,
  
  /** 
    Called when the drag enters the droppable area.
  
    Override this method to return an OR'd mask of the allowed drag 
    operations.  If the user drags over a droppable area within another 
    droppable area, the drag will latch onto the deepest view that returns one 
    or more available operations.
  
    You can also use this method to perform any one-time changes to your view
    when a drop enters the area.  If you return anything other than DRAG_NONE 
    on this method, the dragUpdated() method will also be called immediately.
  
    Note that dragEntered may be called frequently during a drag, not just 
    when the drag first enters your view.  In particular, the Drag object may 
    use this method to determine which nested drop target should receive a 
    drop.  You should implement this method to determine as quickly as
    possible all of the possible operations that might be allowed by this 
    drop target.  You can use dragUpdated to determine the specific operation
    allowed by the user's current mouse location.
    
    You should implement your dragEntered method to always return the correct 
    drag operation, but only to perform any one-time setup the first time 
    dragEntered is called after a dragExited.
    
    The default implementation returns SC.DRAG_NONE
    
    @param drag {SC.Drag} The current drag object
    @param evt {Event} The most recent mouse move event.  Use to get 
      location 
    @returns {DragOps} A mask of all the drag operations allowed or 
      SC.DRAG_NONE
  */
  dragEntered: function(drag, evt) { return SC.DRAG_NONE; },
  
  /** Called periodically when a drag is over your droppable area.
  
    Override this method this to update various elements of the drag state, 
    including the location of ghost view.  You should  use this method to 
    implement snapping.
  
    This method will be called periodically, even if the user is not moving
    the drag.  If you perform expensive operations, be sure to check the
    mouseLocation property of the drag to determine if you actually need to
    update anything before doing your expensive work.

    The default implementation does nothing.
    
    @param {SC.Drag} drag The current drag object
    @param {Event}   evt  The most recent mouse move event.  Use to get  
      location 
  */
  dragUpdated: function(drag, evt) {},

  /**  
    Called when the user exists your droppable area.
  
    Override this method to perform any clean up on your UI such as hiding 
    a special highlight state or removing insertion points.
      
    The default implementation does nothing.
    
    @param {SC.Drag} drag The current drag object
    @param {Event}   evt  The most recent mouse move event.  Use to get location 
  */
  dragExited: function(drag, evt) {},
 
  /**  
    Called when the drag is cancelled for some reason.  
  
    For example, the user might have dragged the view off the screen and let go
    or they might have hit escape.  Override this method to perform any final
    cleanup.  This will be called instead of dragExisted.

    The default implementation does nothing.
    
    @param {SC.Drag} drag The current drag object
    @param {Event}   evt  The most recent mouse move event.  Use to get location 
  */
  dragEnded: function(drag, evt) {},
  
  /** 
    Called when the user releases the mouse.  
  
    This method gives your drop target one last opportunity to choose to 
    accept the proposed drop operation.  You might use this method to
    perform fine-grained checks on the drop location, for example.
    Return true to accept the drop operation.
    
    The default implementation returns true.

    @param {DragOp} operation The proposed drag operation. A drag constant
    @param {SC.Drag} drag     The drag instance managing this drag
    
    @return {Boolean} true if operation is OK, false to cancel.
  */  
  prepareForDragOperation: function(operation, drag) { return true; },
  
  /**  
    Called to actually perform the drag operation.  

    Overide this method to actually perform the drag operation.  This method
    is only called if you returned true to prepareForDragOperation(). 
    
    Return the operation that was actually performed or SC.DRAG_NONE if the 
    operation was aborted.
  
    The default implementation returns SC.DRAG_NONE

    @param {DragOp} operation The proposed drag operation. A drag constant
    @param {SC.Drag} drag     The drag instance managing this drag
    
    @return {DragOp} Drag Operation actually performed
  */
  performDragOperation: function(operation, drag) { return SC.DRAG_NONE; },
  
  /** 
    Called after a drag operation has completed or failed
  
    Override this method to perform any final cleanup from the drag operation.
    If you return SC.DRAG_NONE to performDragOperation() then this method
    will be called _after_ the drag image has slid back to its originating
    position. 
    
    You should use this method to remove any special highlights or UI.
    
    The default implementation does nothing.

    @param {DragOp} operation The drag operation that was performed (or SC.DRAG_NONE)
    @param {SC.Drag} drag     The drag instance managing this drag
  */  
  concludeDragOperation: function(operation, drag) {}
  
} ;
