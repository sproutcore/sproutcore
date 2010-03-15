// ==========================================================================
// Project:   SC - designPage
// Copyright: ©2009 Mike Ball
// ==========================================================================
/*globals SC */
/*jslint evil: true*/
/** 
  @class
  
  @extends SC.ContainerView
*/
SC.DesignerDropTarget = SC.ContainerView.extend(
  /** @scope SC.DesignerDropTarget.prototype */ {
  
  backgroundColor: 'white',
  // ..........................................................
  // Key Events
  // 
  acceptsFirstResponder: YES,
  
  keyDown: function(evt) {
    return this.interpretKeyEvents(evt);
  },
  
  keyUp: function(evt) {
    return YES; 
  },
  
  deleteForward: function(evt){
    var c = SC.designsController.getPath('page.designController');
    if(c) c.deleteSelection();
    return YES;
  },
  
  deleteBackward: function(evt){
    var c = SC.designsController.getPath('page.designController');
    if(c) c.deleteSelection();
    return YES;
  },

  moveLeft: function(sender, evt) {
    return YES;
  },
  
  moveRight: function(sender, evt) {   
    return YES;
  },
  
  moveUp: function(sender, evt) {
    return YES;
  },
  
  moveDown: function(sender, evt) {
    return YES;
  },

  // ..........................................................
  // Drag and drop code
  // 
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
        frame = drag.iframeFrame,
        design, size, newView;
    //size and location
    size = data.get('size');
    loc.x = loc.x - frame.x;
    loc.y = loc.y - frame.y;
    //setup design (use eval to make sure code comes from iframe)
    design = eval(data.get('scClass'));
    design = design.design({layout: {top: loc.y, left: loc.x, width: size.width, height: size.height}});
    newView = design.create({page: cv.get('page')});
    if(cv && newView) cv.appendChild(newView);
    
    return SC.DRAG_ANY; 
  }
  
  
});