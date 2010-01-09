// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** Vary based on current platform. */
SC.NATURAL_SCROLLER_THICKNESS = 16;

/** @class

  Displays a horizontal or vertical scroller.  You will not usually need to
  work with scroller views directly, but you may override this class to
  implement your own custom scrollers.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.ScrollerView = SC.View.extend({

  classNames: ['sc-scroller-view'],

  // ..........................................................
  // PROPERTIES
  //

  /**
   Used by the SC.ScrollView to properly layout the scrollers.
  */
  scrollerThickness: SC.NATURAL_SCROLLER_THICKNESS,

  /**
    The scroller offset value.  This value will adjust between the minimum
    and maximum values that you set. Default is 0.

    @property
  */
  value: function(key, val) {
    if (val !== undefined) {
      // Don't enforce the maximum now, because the scroll view could change
      // height and we want our content to stay put when it does.
      if (val >= 0) {
        this._value = val ;
      } else {
        this._value = 0;
      }
    }

    var value = this._value || 0 ; // default value is at top/left
    return Math.min(value, this.get('maximum')) ;
  }.property('maximum').cacheable(),

  /**
    The maximum offset value for the scroller.  This will be used to calculate
    the internal height/width of the scroller itself. It is not necessarily
    the same as the height of a scroll view's content view.

    When set less than the height of the scroller, the scroller is disabled.

    @property {Number}
  */
  maximum: 0,

  /**
    YES if enable scrollbar, NO to disable it.  Scrollbars will automatically
    disable if the maximum scroll width does not exceed their capacity.

    @property
  */
  isEnabled: YES,

  /**
    Determine the layout direction.  Determines whether the scrollbar should
    appear horizontal or vertical.  This must be set when the view is created.
    Changing this once the view has been created will have no effect.

    @property
  */
  layoutDirection: SC.LAYOUT_VERTICAL,
  // ..........................................................
  // DISPLAY METRICS
  // 
  
  capSize: 10,
  
  capOverlapSize: 7,
  
  downButtonSize: 17,
  
  upButtonSize: 23,
  
  trackLength: function() {
    var frame = this.get('frame'), size;
    
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        size = frame.height;
        break;
      case SC.LAYOUT_HORIZONTAL:
        size = frame.width;
        break;
    }
    return size - (this.capSize-this.capOverlapSize) - this.downButtonSize - (this.upButtonSize-this.capOverlapSize);
  }.property(),

  /**
    Returns the owner view property the scroller should modify.  If this
    property is non-null and the owner view defines this property, then the
    scroller will automatically update this property whenever its own value
    changes.

    The default value of this property is computed based on the
    layoutDirection.  You can override this property to provide your own
    calculation if necessary or to return null if you want to disable this
    behavior.

    @property {String}
  */
  ownerScrollValueKey: function() {
    var key = null ;
    switch(this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        key = 'verticalScrollOffset' ;
        break ;
      case SC.LAYOUT_HORIZONTAL:
        key = 'horizontalScrollOffset' ;
        break ;
      default:
        key = null ;
    }
    return key ;
  }.property('layoutDirection').cacheable(),

  // ..........................................................
  // INTERNAL SUPPORT
  //

  displayProperties: 'maximum isEnabled layoutDirection'.w(),
  
  render: function(context, firstTime) {
    context.addClass('sc-scroller');
    
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        context.addClass('vertical');
        break;
      case SC.LAYOUT_HORIZONTAL:
        context.addClass('horizontal');
        break;
    }
    if (firstTime) {
      context.push('<div class="track"></div>');
      context.push('<div class="button-bottom"></div>');
      context.push('<div class="button-top"></div>');
      context.push('<div class="cap"></div>');
      context.push('<div class="thumb"><div class="center"></div><div class="top"></div><div class="bottom"></div></div>');
      this._sc_thumbPos = this.capSize - this.capOverlapSize;
    } else {
      // Ensure that the scroll thumb is in the correct location
      var v = this.get('value');

      // If the value hasn't changed then don't bother moving the thumb
      if (v !== this._sc_scrollValue) {
        var thumb = this.$('.thumb'),
            max = this.get('maximum'),
            frame = this.get('frame'),
            totalLen = (this.get('trackLength')-this._thumbHeight),
            pct;

        switch (this.get('layoutDirection')) {
          case SC.LAYOUT_VERTICAL:
            pct = (v/(max-this.get('frame').height));
            if (pct > 1) pct = 1;
            this._sc_thumbPos = Math.ceil(pct * totalLen + 3);
            thumb.css('top', this._sc_thumbPos);
            break ;
          case SC.LAYOUT_HORIZONTAL:
            // layer.scrollLeft = v ;
            break ;
        }
    }
  },

  mouseDown: function(evt) {
    var target = evt.target;
    if (target.className.indexOf('thumb') >= 0 || target.parentElement.className.indexOf('thumb') >= 0) {
      this._thumbOffset = this.convertFrameFromView({ y: evt.pageY }).y - this._top ;
      this._startY = evt.pageY;
      this._startTop = this._top;
      return YES;
    }
  },
  
  mouseDragged: function(evt) {
    this._top = Math.max(0, this._startTop + (evt.pageY - this._startY));
    var frame = this.get('frame');
    // this.$('.thumb').css('top', this._top);
  this.set('value', Math.round((this._top / (this.get('trackLength')-this._thumbHeight)) * (this.get('maximum')-frame.height)));
    return YES;
  },

  _sc_scroller_frameDidChange: function() {
    var max = this.get('maximum'), height = this.get('frame').height;
    height = Math.ceil(Math.max((height/max)*height, 20));
    this._thumbHeight = height;
    var thumb = this.$('.thumb');
    
    if (thumb) {
      thumb.css('height', height);
      this.$('.thumb .center').css('height', Math.max(height-14,0));
    }
  }.observes('frame', 'maximum'),
  
  _sc_scroller_scrollDidChange: function() {
    var now = Date.now(), last = this._sc_lastScroll ;
    if (last && (now-last)<50) return this._sc_scroller_armScrollTimer() ;
    this._sc_scrollTimer = null ;
    this._sc_lastScroll = now ;

    SC.RunLoop.begin();

    if (!this.get('isEnabled')) return ; // nothing to do.

    var layer = this.get('layer'), scroll = 0 ;
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        this._sc_scrollValue = scroll = layer.scrollTop ;
        break ;

      case SC.LAYOUT_HORIZONTAL:
        this._sc_scrollValue = scroll = layer.scrollLeft ;
        break ;
    }
    this.set('value', scroll) ; // will now enforce minimum and maximum

    SC.RunLoop.end();
  }

});
