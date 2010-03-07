// ==========================================================================
// Project:   SC - designPage
// Copyright: ©2009 Mike Ball
// ==========================================================================
/*globals SC */

SC.DesignerDropTarget = {
  
  isDropTarget: YES,
  
  targetIsInIFrame: YES,
  
  dragStarted: function(drag, evt) {
  },
  
  dragEntered: function(drag, evt) {
  },
  
  dragUpdated: function(drag, evt) {},
  
  dragExited: function(drag, evt) {},
  
  dragEnded: function(drag, evt) {},
  

  computeDragOperations: function(drag, evt) { 
    return SC.DRAG_ANY; 
  },
  

  acceptDragOperation: function(drag, op) { 
    return YES;
  },
  
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
  performDragOperation: function(drag, op) { 
    var data = drag.dataForType('SC.View'),
        cv = this.get('contentView'),
        loc = drag.get('location'),
        frame = drag.iframeFrame;
    loc.x = loc.x - frame.x;
    loc.y = loc.y - frame.y;
    if(cv) cv.appendChild(data.get('scClass').design({layout: {top: loc.y, left: loc.x, width: 100, height: 25}}).create());
    return SC.DRAG_ANY; 
  }
  
  
};