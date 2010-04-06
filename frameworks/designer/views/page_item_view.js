// ==========================================================================
// SC.pageItemView
// ==========================================================================
/*globals SC */

/** @class

	Used for displaying page items

  @extends SC.ListItemVIew
  @author Mike Ball
  
*/

SC.pageItemView = SC.ListItemView.extend(
/** @scope SC.ListItemView.prototype */ { 
   isDropTarget: YES,
   
   dragEntered: function(drag, evt) {},

   /**
     Called periodically when a drag is over your droppable area.

     Override this method this to update various elements of the drag state, 
     including the location of ghost view.  You should  use this method to 
     implement snapping.

     This method will be called periodically, even if the user is not moving
     the drag.  If you perform expensive operations, be sure to check the
     mouseLocation property of the drag to determine if you actually need to
     update anything before doing your expensive work.

     The default implementation does nothing.

     @param {SC.Drag} drag The current drag object.
     @param {SC.Event} evt The most recent mouse move event. Use to get location
   */
   dragUpdated: function(drag, evt) {},

   /**
     Called when the user exits your droppable area or the drag ends
     and you were the last targeted droppable area.

     Override this method to perform any clean up on your UI such as hiding 
     a special highlight state or removing insertion points.

     The default implementation does nothing.

     @param {SC.Drag} drag The current drag object
     @param {SC.Event}   evt  The most recent mouse move event. Use to get location.
   */
   dragExited: function(drag, evt) {},

   /**
     Called on all drop targets when the drag ends.  

     For example, the user might have dragged the view off the screen and let 
     go or they might have hit escape.  Override this method to perform any 
     final cleanup.  This will be called instead of dragExited.

     The default implementation does nothing.

     @param {SC.Drag} drag The current drag object
     @param {SC.Event}   evt  The most recent mouse move event. Use to get location.
   */
   dragEnded: function(drag, evt) {},

   /**
     Called when the drag needs to determine which drag operations are
     valid in a given area.

     Override this method to return an OR'd mask of the allowed drag 
     operations.  If the user drags over a droppable area within another 
     droppable area, the drag will latch onto the deepest view that returns one 
     or more available operations.

     The default implementation returns SC.DRAG_NONE

     @param {SC.Drag} drag The current drag object
     @param {SC.Event} evt The most recent mouse move event.  Use to get 
       location 
     @returns {DragOps} A mask of all the drag operations allowed or 
       SC.DRAG_NONE
   */
   computeDragOperations: function(drag, evt) { return SC.DRAG_NONE; },

   /**
     Called when the user releases the mouse.

     This method gives your drop target one last opportunity to choose to 
     accept the proposed drop operation.  You might use this method to
     perform fine-grained checks on the drop location, for example.
     Return true to accept the drop operation.

     The default implementation returns YES.

     @param {SC.Drag} drag The drag instance managing this drag
     @param {DragOp} op The proposed drag operation. A drag constant

     @return {Boolean} YES if operation is OK, NO to cancel.
   */  
   acceptDragOperation: function(drag, op) { return YES; },

   /**
     Called to actually perform the drag operation.

     Overide this method to actually perform the drag operation.  This method
     is only called if you returned YES in acceptDragOperation(). 

     Return the operation that was actually performed or SC.DRAG_NONE if the 
     operation was aborted.

     The default implementation returns SC.DRAG_NONE

     @param {SC.Drag} drag The drag instance managing this drag
     @param {DragOp} op The proposed drag operation. A drag constant.

     @return {DragOp} Drag Operation actually performed
   */
   performDragOperation: function(drag, op) { return SC.DRAG_NONE; }
   
});

