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
      }
    } else {
      var value = this._value || 0 ; // default value is at top/left
      return Math.min(value, this.get('maximum')) ;
    }
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
  
  /** @private
    Update the scroll location or inner height/width if needed.
  */
  render: function(context, firstTime) {
    var max = this.get('maximum') ;
    
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        context.addClass('sc-vertical') ;
        if (firstTime) {
          context.push('<div class="sc-inner" style="height: %@px;">&nbsp;</div>'.fmt(max)) ;
        } else {
          this.$('div')[0].style.height = max + "px";
        }
        break ;
      case SC.LAYOUT_HORIZONTAL:
        context.addClass('sc-horizontal') ;
        if (firstTime) {  
          context.push('<div class="sc-inner" style="width: %@px;">&nbsp;</div>'.fmt(max)) ;
        } else {
          this.$('div')[0].style.width = max + "px";
        }
        break ;
      default:
        throw "You must set a layoutDirection for your scroller class." ;
    }
    
    context.setClass('disabled', !this.get('isEnabled')) ;
  },
  
  didCreateLayer: function() {
    var callback = this._sc_scroller_scrollDidChange ;
    SC.Event.add(this.$(), 'scroll', this, callback) ;
    
    // set scrollOffset first time
    var amt = this.get('value') ;
    var layer = this.get('layer') ;
    
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        layer.scrollTop = amt ;
        break;
        
      case SC.LAYOUT_HORIZONTAL:
        layer.scrollLeft = amt ;
        break;
    }
  },
  
  willDestroyLayer: function() {
    var callback = this._sc_scroller_scrollDidChange ;
    SC.Event.remove(this.$(), 'scroll', this, callback) ;
  },
  
  // after 50msec, fire event again
  _sc_scroller_armScrollTimer: function() {
    if (!this._sc_scrollTimer) {
      SC.RunLoop.begin() ;
      var method = this._sc_scroller_scrollDidChange ;
      this._sc_scrollTimer = this.invokeLater(method, 50) ;
      SC.RunLoop.end() ;
    }
  },
  
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
  },
  
  /** @private */
  _sc_scroller_valueDidChange: function() {
    var v = this.get('value') ;
        
    if (v !== this._sc_scrollValue) {
      var layer = this.get('layer') ;
      if (layer) {
        switch (this.get('layoutDirection')) {
          case SC.LAYOUT_VERTICAL:
            layer.scrollTop = v;
            break ;
          
          case SC.LAYOUT_HORIZONTAL:
            layer.scrollLeft = v ;
            break ;
        }
      }
    }
  }.observes('value')
  
});
