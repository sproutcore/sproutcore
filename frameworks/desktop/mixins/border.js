// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


SC.BORDER_BEZEL  = 'sc-bezel-border';
SC.BORDER_BLACK  = 'sc-black-border';
SC.BORDER_GRAY   = 'sc-gray-border';
SC.BORDER_TOP    = 'sc-top-border';
SC.BORDER_BOTTOM = 'sc-bottom-border';
SC.BORDER_NONE   = null ;

/**
  @namespace
  @deprecated Border functionality is now included in SC.View.

  The `SC.Border` mixin has be deprecated in favour of applying border properties
  to an `SC.View`'s layout object. See {@link SC.View#layout}.

  The Border mixin can be applied to any view to give it a visual border.
  In addition to specifying the mixin itself, you should specify the border
  style with the borderStyle property on your view.

  Border style can be any predefined CSS class name or a border color.

  If you specify a CSS class name, it must end in "-border". Additionally,
  you should set the `borderTop`, `borderRight`, `borderBottom`, and
  `borderLeft` properties so SproutCore can accurately account for the size
  of your view.

  SproutCore pre-defines several useful border styles including:

   - `SC.BORDER_BEZEL`  -- displays an inlaid bezel
   - `SC.BORDER_BLACK`  -- displays a black border
   - `SC.BORDER_GRAY`   -- displays a gray border
   - `SC.BORDER_TOP`    -- displays a border on the top only
   - `SC.BORDER_BOTTOM` -- displays a border on the bottom only
   - `SC.BORDER_NONE`   -- disables the border

  @since SproutCore 1.0
*/
SC.Border = {

  /**
    The thickness of the top border.

    @type Number
    @commonTask Border Dimensions
  */
  borderTop: 0,

  /**
    The thickness of the right border.

    @type Number
    @commonTask Border Dimensions
  */
  borderRight: 0,

  /**
    The thickness of the bottom border.

    @type Number
    @commonTask Border Dimensions
  */
  borderBottom: 0,

  /**
    The thickness of the left border.

    @type Number
    @commonTask Border Dimensions
  */
  borderLeft: 0,

  /**
    The style of the border. You may specify a color string (like 'red' or
    '#fff'), a CSS class name, or one of:

      - SC.BORDER_BEZEL
      - SC.BORDER_BLACK
      - SC.BORDER_GRAY
      - SC.BORDER_TOP
      - SC.BORDER_BOTTOM
      - SC.BORDER_NONE

    If you specify a CSS class name, it must end in "-border".
  */
  borderStyle: SC.BORDER_GRAY,

  /**
    Walk like a duck

    @private
  */
  hasBorder: YES,

  /**
    Make sure we re-render if the `borderStyle` property changes.
    @private
  */
  displayProperties: ['borderStyle'],

  /** @private */
  _BORDER_REGEXP: (/-border$/),

  /** @private */
  initMixin: function() {
    //@if(debug)
    SC.warn("Developer Warning: SC.Border is deprecated, please set border in your layout");
    //@endif
    this._sc_border_borderStyleDidChange();
    this._sc_border_borderDimensionsDidChange();
  },

  /** @private */
  renderMixin: function(context, firstTime) {
    var style = this.get('borderStyle');
    if (style) {
      if (this._BORDER_REGEXP.exec(style)) {
        context.addClass(style);
      } else context.addStyle('border', '1px '+style+' solid');
    }
  },

  /** @private */
  _sc_border_borderStyleDidChange: function() {
    var borderStyle = this.get('borderStyle'),
        borderSize = SC.Border.dimensions[borderStyle];

    if (borderSize) {
      this.beginPropertyChanges();
      this.set('borderTop', borderSize);
      this.set('borderRight', borderSize);
      this.set('borderBottom', borderSize);
      this.set('borderLeft', borderSize);
      this.endPropertyChanges();
    }
  },

  /** @private */
  _sc_border_borderDimensionsDidChange: function(){
    var borderTop     = this.get('borderTop'),
        borderRight   = this.get('borderRight'),
        borderBottom  = this.get('borderBottom'),
        borderLeft    = this.get('borderLeft');
    this.adjust({ borderTop: borderTop, borderRight: borderRight, borderBottom: borderBottom, borderLeft: borderLeft });
  }.observes('borderTop', 'borderRight', 'borderBottom', 'borderLeft')

};

SC.mixin(SC.Border, {
  dimensions: {
    'sc-bezel-border': 1,
    'sc-black-border': 1,
    'sc-gray-border': 1,
    'sc-top-border': 1,
    'sc-bottom-border': 1
  }
});
