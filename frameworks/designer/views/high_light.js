// ========================================================================
// SproutCore -- JavaScript Application Framework
// ========================================================================

/**
  This View is used by Greenhouse when application is in design mode
  It darkens the area around the rootDesigner
*/
SC.RootDesignerHighLight = SC.View.extend(
/** @scope SC.RootDesignerHighLight.prototype */ {

  /**
    The designer that owns this highlight
  */
  designer: null,
  
  classNames: 'high-light',
  
  render: function(context, firstTime) {
    var targetFrame = this.get('targetFrame');
    // render shadows
    if (firstTime){
      context
      .begin('div').classNames(['top', 'cover']).addStyle({top: 0, height: targetFrame.y, left:0, right: 0}).end()
      .begin('div').classNames(['bottom', 'cover']).addStyle({top: targetFrame.y + targetFrame.height, bottom:0, left: 0, right:0}).end()
      .begin('div').classNames(['left', 'cover']).addStyle({left: 0, width: targetFrame.x, top: targetFrame.y, height: targetFrame.height}).end()
      .begin('div').classNames(['right', 'cover']).addStyle({left: targetFrame.x + targetFrame.width, right:0, top: targetFrame.y, height: targetFrame.height}).end();
    }
    
  },

  // ..........................................................
  // EVENT HANDLING
  // 
  // By default just forward to designer
  
  mouseDown: function(evt) {
    var d = this.designer;
    return (d && d.mouseDown) ? d.mouseDown(evt) : null;
  },
  
  mouseUp: function(evt) {
    var d = this.designer;
    return (d && d.mouseUp) ? d.mouseUp(evt) : null;
  },
  
  mouseMoved: function(evt) {
    var d = this.designer;
    return (d && d.mouseMoved) ? d.mouseMoved(evt) : null;
  },
  
  mouseDragged: function(evt) {
    var d = this.designer;
    return (d && d.mouseDragged) ? d.mouseDragged(evt) : null;
  }
  
});