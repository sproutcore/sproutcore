// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

SC.BORDER_BEZEL  = 'sc-bezel-border';
SC.BORDER_BLACK  = 'sc-black-border';
SC.BORDER_GRAY   = 'sc-gray-border';
SC.BORDER_TOP    = 'sc-top-border';
SC.BORDER_BOTTOM = 'sc-bottom-border';
SC.BORDER_NONE   = null ;

/**
  @namespace

  The Border mixin can be applied to any view to give it a visual border.
  In addition to specifying the mixing itself, you should specify the border
  style with the borderStyle property on your view.  
  
  border style can be any predefined CSS class name or a border color.  If 
  you specify a CSS class name, it must end in -border.  
  
  SproutCore pre-defines several useful border styles including:
  
  * SC.BORDER_BEZEL  - displays an inlaid bezel
  * SC.BORDER_BLACK  - displays a black border
  * SC.BORDER_GRAY   - displays a gray border
  * SC.BORDER_TOP    - displays a border on the top only
  * SC.BORDER_BOTTOM - displays a border on the bottom only
  * SC.BORDER_NONE   - disables the border
  
  Note that borders do not count in the dimensions of the view.  You may need
  to adjust your layout to make room for it.
  
  @since SproutCore 1.0
*/
SC.Border = {
  
  borderStyle: SC.BORDER_GRAY,
  
  _BORDER_REGEXP: (/-border$/),
  
  renderMixin: function(context, firstTime) {
    var style = this.get('borderStyle');
    if (style) {
      if (this._BORDER_REGEXP.exec(style)) {
        context.addClass(style);
      } else content.addStyle('border', '1px %@ solid'.fmt(style));
    }
  }
  
};