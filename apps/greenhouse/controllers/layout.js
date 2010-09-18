// ==========================================================================
// Project:   Greenhouse.layoutController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  Layout controller properties used by the layout palette.  The content should
  be bound to the current page design controller selection.

  @extends SC.ObjectController
*/
Greenhouse.layoutController = SC.ObjectController.create(
/** @scope Greenhouse.layoutController.prototype */ {

  contentBinding: "Greenhouse.pageController.designController.selection",
  allowsMultipleContent: YES, // palette like behavior

  /**
    Determines which set of dimensions should be visible in the layout 
    palette in the horizontal direction.
  */
  hDimNowShowing: function() {
    var loc = this.get('anchorLocation'),
        K   = SC.ViewDesigner, 
        ret = 'leftDimensions';
        
    if (loc & K.ANCHOR_LEFT) ret = 'leftDimensions';
    else if (loc & K.ANCHOR_RIGHT) ret = 'rightDimensions';
    else if (loc & K.ANCHOR_CENTERX) ret = 'centerXDimensions';
    else if (loc & K.ANCHOR_WIDTH) ret = 'widthDimensions';
    return ret ;
  }.property('anchorLocation').cacheable(),
  
  /**
    Determines which set of dimensions should be visible in the layout 
    palette in the vertical direction.
  */
  vDimNowShowing: function() {
    var loc = this.get('anchorLocation'),
        K   = SC.ViewDesigner, 
        ret = 'topDimensions';
        
    if (loc & K.ANCHOR_TOP) ret = 'topDimensions';
    else if (loc & K.ANCHOR_BOTTOM) ret = 'bottomDimensions';
    else if (loc & K.ANCHOR_CENTERY) ret = 'centerYDimensions';
    else if (loc & K.ANCHOR_HEIGHT) ret = 'heightDimensions';
    return ret ;
  }.property('anchorLocation').cacheable()
  
}) ;

