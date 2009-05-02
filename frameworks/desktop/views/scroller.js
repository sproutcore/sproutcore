// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
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
    and maximum values that you set.
    
    @property
  */
  value: 0,
  
  /**
    The minimum offset value for the scroller.  When the scroller is at the 
    top/left, it will have this value.
    
    @property
  */
  minimum: 0,
  
  /**
    The maximum offset value for the scroller.  This will be used to calculate
    the internal height/width of the scroller itself.
    
    @property
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
    var key = null;
    switch(this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        key = 'verticalScrollOffset' ;
        break;
      case SC.LAYOUT_HORIZONTAL:
        key = 'horizontalScrollOffset' ;
        break;
      default:
        key = null ;
    }
    return key ;  
  }.property('layoutDirection').cacheable(),
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  displayProperties: 'minimum maximum isEnabled'.w(),
  
  /** @private
    Update the scroll location or inner height/width if needed.
  */
  render: function(context, firstTime) {
    // console.log('%@.render(context=%@, firstTime=%@)'.fmt(this, context, firstTime?'YES':'NO'));
    var dir = this.get('layoutDirection') ;
    var min = this.get('minimum'), max = this.get('maximum') ;
    var enabled = this.get('isEnabled'), value = this.get('value') ;
    
     // calculate required size...
    var size = (enabled) ? max-min-2 : 0 ;
    
    switch (dir) {
      case SC.LAYOUT_VERTICAL:
        // if (firstTime) context.addClass('sc-vertical') ;
        context.addClass('sc-vertical') ;
        context.push('<div class="sc-inner" style="height: %@px;">\
          </div>'.fmt(size)) ;
        break ;
      case SC.LAYOUT_HORIZONTAL:
        // if (firstTime) context.addClass('sc-horizontal') ;
        context.addClass('sc-horizontal') ;
        context.push('<div class="sc-inner" style="width: %@px;">\
          </div>'.fmt(size)) ;
        break ;
      default:
        throw "You must set a layoutDirection for your scroller class." ;
    }
  },
  
  didCreateLayer: function() {
    // console.log('%@.didCreateLayer called'.fmt(this));
    var callback = this._sc_scroller_armScrollTimer ;
    SC.Event.add(this.$(), 'scroll', this, callback) ;
    
    // set scrollOffset first time
    var amt = this.get('value') - this.get('minimum') ;
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
    // console.log('%@.willDestroyLayer()'.fmt(this));
    var callback = this._sc_scroller_armScrollTimer ;
    SC.Event.remove(this.$(), 'scroll', this, callback) ;
  },
  
  _sc_scroller_armScrollTimer: function() {
    if (!this._sc_scrollTimer) {
      SC.RunLoop.begin();
      var method = this._sc_scroller_scrollDidChange ;
      this._sc_scrollTimer = this.invokeLater(method, 1) ;
      SC.RunLoop.end();
    }
  },
  
  _sc_scroller_scrollDidChange: function() {
    // console.log('%@._sc_scroller_scrollDidChange called'.fmt(this));
    this._sc_scrollTimer = null ; // clear so we can fire again
    
    if (!this.get('isEnabled')) return ; // nothing to do.
    
    var layer = this.get('layer'), loc = 0 ;
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        this._sc_scrollValue = loc = layer.scrollTop ;
        break ;
        
      case SC.LAYOUT_HORIZONTAL:
        this._sc_scrollValue = loc = layer.scrollLeft ;
        break ;
    }
    
    this.set('value', loc + this.get('minimum')) ;
  },
  
  /** @private */
  _sc_scroller_valueDidChange: function() {
    // console.log('%@._sc_scroller_valueDidChange called'.fmt(this));
    if (this.get('value') !== this._sc_scrollValue) {
      this.displayDidChange() ; // re-render
    }
    
    // notify owner if it has a different scroll value
    var key = this.get('ownerScrollValueKey');
    if (key && this.owner && (this.owner[key] !== undefined)) {
      this.owner.setIfChanged(key, this.get('value')) ;
    }
  }.observes('value')
  
});
