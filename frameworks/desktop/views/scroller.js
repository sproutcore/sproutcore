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
  
  // emptyElement: '<%@1><div class="sc-inner"></div></%@1>',
  emptyElement: '<%@1></%@1>',
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
    The minimum offset value for the scroller.  When the scroller is at the top/left, it will have this value.
    
    @property
  */
  minimum: 0,
  
  /**
    The maximum offset value for the scroller.  This will be used to calculate the internal height/width of the scroller itself.
    
    @property
  */
  maximum: 0,
  
  /**
    YES if enable scrollbar, NO to disable it.  Scrollbars will automatically disable if the maximum scroll width does not exceed their capacity.
    
    @property
  */
  isEnabled: YES,
  
  /**
    Determine the layout direction.  Determines whether the scrollbar should appear horizontal or vertical.  This must be set when the view is created.  Changing this once the view has been created will have no effect.
    
    @property
  */
  layoutDirection: SC.LAYOUT_VERTICAL,
  
  /**
    Returns the owner view property the scroller should modify.  If this property is non-null and the owner view defines this property, then the scroller will automatically update this property whenever its own value changes.
    
    The default value of this property is computed based on the layoutDirection.  You can override this property to provide your own calculation if necessary or to return null if you want to disable this behavior.
    
    @property {String}
  */
  ownerScrollValueKey: function() {
    var key = null;
    switch(this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        key = 'verticalScrollOffset';
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
  
  displayProperties: 'value minimum maximum isEnabled'.w(),

  /** @private
    Update the scroll location or inner height/width if needed.
  */
  render: function(context, firstTime) {
    // console.log('%@.render called'.fmt(this));
    sc_super();
    
    var dir = this.get('layoutDirection');
    var min = this.get('minimum'), max = this.get('maximum');
    var enabled = this.get('isEnabled'), value = this.get('value');
    
    if (firstTime) {
      context.addClass('sc-horizontal', dir===SC.LAYOUT_HORIZONTAL) ;
      context.addClass('sc-vertical', dir===SC.LAYOUT_VERTICAL) ;
    }
    
    // calculate required size...
    var size = (enabled) ? max-min-2 : 0 ;
    switch (dir) {
      case SC.LAYOUT_VERTICAL:
        context.push('<div class="sc-inner" style="height: %@px">'.fmt(size));
        context.addStyle('scrollTop', value-min) ;
        break;
        
      case SC.LAYOUT_HORIZONTAL:
        context.push('<div class="sc-inner" style="width: %@px">'.fmt(size));
        context.addStyle('scrollLeft', value-min) ;
        break;
      
      default:
        break;
    }
  },
  
  didCreateLayer: function() {
    SC.Event.add(this.$(), 'scroll', this, this.scrollDidChange) ;
  },
  
  didDestroyLayer: function() {
    SC.Event.remove(this.$(), 'scroll', this, this.scrollDidChange) ;
  },

  /** 
    Whenever the scroll location changes, simply set a timer to fire to 
    update the scroll location and then exit.  It's important to minimize the
    actual work done during an onscroll change since it will block the UI
    from updating.
  */
  scrollDidChange: function() {
    // schedule scrollDidChange to execute later if not already scheduled...
    if (!this._scrollTimer) {
      SC.RunLoop.begin();
      this._scrollTimer = this.invokeLater(this._scroll_scrollDidChange, 1);
      SC.RunLoop.end();
    }
  },
  
  _scroll_scrollDidChange: function() {
    this._scrollTimer = null; // clear so we can fire again
    
    if (!this.get('isEnabled')) return ; // nothing to do.
    var dir = this.get('layoutDirection');
    var loc = 0;
    switch(dir) {
      case SC.LAYOUT_VERTICAL:
        loc = this.$().get(0).scrollTop;
        break;
        
      case SC.LAYOUT_HORIZONTAL:
        loc = this.$().get(0).scrollLeft;
        break;
      
      default:
        break;
    }
    
    this.set('value', loc + this.get('minimum'));
  },

  /** @private Notify owner if it has a *ScrollOffset value */
  _scroller_valueDidChange: function() {
    var key = this.get('ownerScrollValueKey');
    if (key && this.owner && (this.owner[key] !== undefined)) {
      this.owner.setIfChanged(key, this.get('value'));
    }
  }.observes('value')
  
}) ;