// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

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
    The scroller offset value.  This value will adjust between the minimum
    and maximum values that you set. Default is 0.

    @property
  */
  value: function(key, val) {
    if (val !== undefined) {
      // Don't enforce the maximum now, because the scroll view could change
      // height and we want our content to stay put when it does.
      if (val >= 0) {
        this._scs_value = val ;
      } else {
        this._scs_value = 0;
      }
    }

    var value = this._scs_value || 0 ; // default value is at top/left
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
  
  /**
    The width of the scrollbar.
    
    @property
  */
  scrollbarThickness: 14,
  
  /**
    The height or width of the cap that encloses the track.
    
    @property
  */
  capLength: 18,
  
  /**
    The amount by which the scroller overlaps the cap.
    
    @property
  */
  capOverlap: 17,

  /**
    The amount by which the scroller overlaps the arrow buttons.
    
    @property
  */
  buttonOverlap: 10,

  /**
    The height or width of the up/down or left/right arrow buttons.
  */
  buttonLength: 40,

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

  displayProperties: 'maximum isEnabled layoutDirection value frame'.w(),
  
  render: function(context, firstTime) {
    // We style based on the layout direction, so set a 
    // class name
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
      context.push('<div class="thumb"><div class="thumb-center"></div><div class="thumb-top"></div><div class="thumb-bottom"></div></div>');
      
      // default the thumb position to the top
      this._sc_thumbPos = this.capLength - this.capOverlap;
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
            this._sc_thumbPos = Math.ceil(pct * totalLen + (this.capLength - this.capOverlap));
            thumb.css('top', this._sc_thumbPos);
            break ;
          case SC.LAYOUT_HORIZONTAL:
            // layer.scrollLeft = v ;
            break ;
        }
      }
    }
  },

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
    return size - this.capLength + this.capOverlap - this.buttonLength + this.buttonOverlap;
  }.property(),

  mouseDown: function(evt) {
    var target = evt.target, value;
    if (target.className.indexOf('thumb') >= 0) {
      this._thumbOffset = this.convertFrameFromView({ y: evt.pageY }).y - this._sc_thumbPos ;
      this._startY = evt.pageY;
      this._startTop = this._sc_thumbPos;
      return YES;
    } else if (target.className.indexOf('button-top') >= 0) {
      this.decrementProperty('value', 30);
      this.setButtonActive('.button-top');
    } else if (target.className.indexOf('button-bottom') >= 0) {
      this.incrementProperty('value', 30);
      this.setButtonActive('.button-bottom');
    } else {
      // Page up/down
      var top = this._sc_thumbPos,
          f = this.convertFrameFromView({ x: evt.pageX, y: evt.pageY });
      var h = this.get('frame').height;
      if (f.y < top) {
        this.decrementProperty('value',h);
      } else {
        this.incrementProperty('value', h);
      }
    }
  },
  
  setButtonActive: function(element) {
    this.$(element).addClass('active');
    this._scs_buttonActive = element;
  },
  
  mouseUp: function(evt) {
    var active = this._scs_buttonActive;
    
    if (active) {
      this.$(active).removeClass('active');
      return YES;
    }
    
    return NO;
  },
  
  mouseDragged: function(evt) {
    this._sc_thumbPos = Math.max(0, this._startTop + (evt.pageY - this._startY));
    var frame = this.get('frame');
  this.set('value', Math.round((this._sc_thumbPos / (this.get('trackLength')-this._thumbHeight)) * (this.get('maximum')-frame.height)));
    return YES;
  },

  _sc_scroller_frameDidChange: function() {
    var max = this.get('maximum'), height = this.get('frame').height;
    height = Math.ceil(Math.max((height/max)*height, 20));
    this._thumbHeight = height;
    var thumb = this.$('.thumb');
    
    if (thumb) {
      thumb.css('height', height);
      this.$('.thumb .thumb-center').css('height', Math.max(height-20,0));
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
