// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

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

  emptyElement: '<%@1><div class="sc-inner"></div></%@1>',
  styleClass: 'sc-scroller-view',
  
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
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  displayProperties: 'value minimum maximum isEnabled'.w(),

  /** @private 
    when generating a view, setup the basic layout options for the inner div
  */
  prepareDisplay: function() {
    sc_super() ;
    var dir = this.get('layoutDirection');
    this.$().setClass({
      'sc-horizontal': dir===SC.LAYOUT_HORIZONTAL,
      'sc-vertical': dir===SC.LAYOUT_VERTICAL
    });
  },
  
  /** @private
    Update the scroll location or inner height/width if needed.
  */
  updateDisplay: function() {
    sc_super();
    
    var dir = this.get('layoutDirection');
    var min = this.get('minimum'), max = this.get('maximum');
    var enabled = this.get('isEnabled'), value = this.get('value');
    
    // calculate required size...
    var size = (enabled) ? max-min : 0 ;
    switch(dir) {
      case SC.LAYOUT_VERTICAL:
        this.$('.sc-inner').css('height', size);
        this.$().get(0).scrollTop = value-min;
        break;
        
      case SC.LAYOUT_HORIZONTAL:
        this.$('.sc-inner').css('width', size);
        this.$().get(0).scrollLeft = value-min;
        break;
      
      default:
        break;
    }
  },
  
  init: function() {
    sc_super();
    SC.Event.add(this.$(), 'scroll', this, this.scrollDidChange) ;
  },
  
  destroy: function() {
    sc_super();
    SC.Event.remove(this.$(), 'scroll', this, this.scrollDidChange) ;
  },

  /** 
    Whenever the scroll location changes, simply set a timer to fire to 
    update the scroll location and then exit.  It's important to minimize the
    actual work done during an onscroll change since it will block the UI
    from updating.
  */
  scrollDidChange: function() {
    this.invokeLater(this._scrollDidChange, 1);
  },
  
  _scrollDidChange: function() {
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
  }  
}) ;