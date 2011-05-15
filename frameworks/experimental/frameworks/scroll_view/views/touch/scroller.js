// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/scroller');

/**
  @class
  @extends SC.TouchScrollerView
*/
SC.TouchScrollerView = SC.ScrollerView.extend(
  /** @scope SC.TouchScrollerView.prototype */{

  /**
    @type Array
    @default ['sc-touch-scroller-view']
    @see SC.View#classNames
  */
  classNames: ['sc-touch-scroller-view'],
  
  /**
    @type Number
    @default 12
  */
  scrollbarThickness: 12,
  
  /**
    @type Number
    @default 5
  */
  capLength: 5,
  
  /**
    @type Number
    @default 0
  */
  capOverlap: 0,
  
  /**
    @type Boolean
    @default NO
  */
  hasButtons: NO,
  
  /**
    @type Number
    @default 36
  */
  buttonOverlap: 36,
  
  /** @private */
  adjustThumb: function(thumb, position, length) {
    var thumbInner = this.$('.thumb-inner');
    var max = this.get("scrollerLength") - this.capLength, min = this.get("minimum") + this.capLength;
    
    if (position + length > max) {
      position = Math.min(max - 20, position);
      length = max - position;
    }
    
    if (position < min) {
      length -= min - position;
      position = min;
    }
    
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        if (this._thumbPosition !== position) thumb.css('-webkit-transform', 'translate3d(0px,' + position + 'px,0px)');
        if (this._thumbSize !== length) {
          thumbInner.css('-webkit-transform', 'translate3d(0px,' + Math.round(length - 1044) + 'px,0px)');
        }
        break;
      case SC.LAYOUT_HORIZONTAL:
        if (this._thumbPosition !== position) thumb.css('-webkit-transform', 'translate3d(' + position + 'px,0px,0px)');
        if (this._thumbSize !== length) {
          thumbInner.css('-webkit-transform', 'translate3d(' + Math.round(length - 1044) + 'px,0px,0px)');
        }
        break;
    }

    this._thumbPosition = position;
    this._thumbSize = length;
  },
  
  /** @private */
  render: function(context, firstTime) {
    var classNames = [],
        buttons = '',
        thumbPosition, thumbLength, thumbCenterLength, thumbElement,
        value, max, scrollerLength, length, pct;

    // We set a class name depending on the layout direction so that we can
    // style them differently using CSS.
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        classNames.push('sc-vertical');
        break;
      case SC.LAYOUT_HORIZONTAL:
        classNames.push('sc-horizontal');
        break;
    }

    // The appearance of the scroller changes if disabled
    if (!this.get('isEnabled')) classNames.push('disabled');
    // Whether to hide the thumb and buttons
    if (this.get('controlsHidden')) classNames.push('controls-hidden');

    // Change the class names of the DOM element all at once to improve
    // performance
    context.addClass(classNames);

    // Calculate the position and size of the thumb
    thumbLength = this.get('thumbLength');
    thumbPosition = this.get('thumbPosition');

    // If this is the first time, generate the actual HTML
    if (firstTime) {
      if (this.get('hasButtons')) {
        buttons = '<div class="button-bottom"></div><div class="button-top"></div>';
      } else {
        buttons = '<div class="endcap"></div>';
      }

      switch (this.get('layoutDirection')) {
        case SC.LAYOUT_VERTICAL:
        context.push('<div class="track"></div>',
                      '<div class="cap"></div>',
                      buttons,
                      '<div class="thumb">',
                      '<div class="thumb-top"></div>',
                      '<div class="thumb-clip">',
                      '<div class="thumb-inner" style="-webkit-transform: translateY('+(thumbLength-1044)+'px);">',
                      '<div class="thumb-center"></div>',
                      '<div class="thumb-bottom"></div></div></div></div>');
        break;
        case SC.LAYOUT_HORIZONTAL:
        context.push('<div class="track"></div>',
                      '<div class="cap"></div>',
                      buttons,
                      '<div class="thumb">',
                      '<div class="thumb-top"></div>',
                      '<div class="thumb-clip">',
                      '<div class="thumb-inner" style="-webkit-transform: translateX('+(thumbLength-1044)+'px);">',
                      '<div class="thumb-center"></div>',
                      '<div class="thumb-bottom"></div></div></div></div>');
      }
    } else {
      // The HTML has already been generated, so all we have to do is
      // reposition and resize the thumb

      // If we aren't displaying controls don't bother
      if (this.get('controlsHidden')) return;

      thumbElement = this.$('.thumb');

      this.adjustThumb(thumbElement, thumbPosition, thumbLength);
    }
  }
  
});
