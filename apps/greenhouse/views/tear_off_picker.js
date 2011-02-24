// ==========================================================================
// Project:   Greenhouse.TearOffPicker
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @class

  @extends SC.PickerPane
*/
Greenhouse.TearOffPicker = SC.PickerPane.extend(
/** @scope Greenhouse.TearOffPicker.prototype */ {
    
  dragAction: '',
  
  mouseDragged: function(evt){
    
    Greenhouse.sendAction(this.get('dragAction'));
    this._blockedIframe = YES;
    Greenhouse.eventBlocker.set('isVisible', YES);
    
    return sc_super();
  },
  
  mouseUp: function(evt){
    if(this._blockedIframe){
      Greenhouse.eventBlocker.set('isVisible', NO);
      this._blockedIframe = NO;
    }
    return YES;
  },
  
  mouseDown: function(evt) {
    var f=this.get('frame');
    this._mouseOffsetX = f ? (f.x - evt.pageX) : 0;
    this._mouseOffsetY = f ? (f.y - evt.pageY) : 0;
    return this.modalPaneDidClick(evt);
  },
  
  modalPaneDidClick: function(evt) {
    var f = this.get("frame");
    if(!this.clickInside(f, evt)){ 
      Greenhouse.sendAction('cancel');
    }
    return YES ; 
  },
  
  computeAnchorRect: function(anchor) {
    var ret = SC.viewportOffset(anchor); // get x & y
    var cq = SC.$(anchor);
    var wsize = SC.RootResponder.responder.computeWindowSize() ;
    ret.width = cq.outerWidth();
    ret.height = (wsize.height-ret.y) < cq.outerHeight() ? (wsize.height-ret.y) : cq.outerHeight();
    ret.y = ret.y -11;
    return ret ;
  }
});
