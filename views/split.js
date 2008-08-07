// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('mixins/delegate_support');

SC.HORIZONTAL = 'horizontal' ;
SC.VERTICAL = 'vertical' ;

/** 
  @class

  A split view is used to show views that the user can resize or collapse.
  To use the split view, you need to add the child views you want layed out
  separated by divider views (instances of SC.SplitDividerView).
  
  When the user clicks and drags on a divider view, it will automatically
  resize the views immediately before and after the view.  You can constrain
  the resizing allowed by the split view either by setting a minThickness and
  maxThickness property on the views themselves or by implementing methods
  on a delegate object.

  In addition to resizing views, users can also collapse views by double
  clicking on a divider view.  When a view is collapsed, it's isVisible 
  property is set to NO and its space it removed from the view.  Double
  clicking on a divider again will restore a collapse view.  A user can also
  start to drag the divider to show the collapsed view.
  
  You can programmatically control collapsing behavior by setting the
  canCollapseViews property on the SplitView, a canCollapse property on each
  child view, or by implementing the appropriate delegate method.
  
  Finally, SplitViews can layout their child views either horizontally or 
  vertically.  To choose the direction of layout set the layoutDirection
  property on the view.  This property should be set when the view is created.
  Changing it dynamically will have an unknown effect.
  
  @extends SC.View
  @extends SC.DelegateSupport
  
  @author Charles Jolley
*/
SC.SplitView = SC.View.extend(SC.DelegateSupport,
/** @scope SC.SplitView.prototype */ {

  emptyElement: '<div class="sc-split-view"></div>',
  
  /**
    delegate for controlling split view behavior.
  */
  delegate: null,
  
  /**
    Direction of layout.  Must be SC.HORIZONTAL || SC.VERTICAL.
  */
  layoutDirection: SC.HORIZONTAL,

  /**
    Set to NO to disable collapsing for all views.
  */
  canCollapseViews: YES,

  /**
    Used by split divider to decide if the view can be collapsed.
  */
  canCollapseView: function(view) {
    if (!this.get('canCollapseViews')) return NO ;
    if (view.get('canCollapse') === NO) return NO ;
    return this.invokeDelegateMethod(this.delegate, 'splitViewCanCollapse', this, view) ;
  },
  
  /**
    One view in your array must have a flexible width to allow proper
    resizing.  You can set this view manually with this outlet or you can
    just let the split view choose the center-most view.
    
    Views to the left/top of this view will be anchored to the left/top of
    the parent view.  Views to the right/bottom of this view will be anchored
    to the right/bottom.
  */
  flexibleView: null,
  
  /**
    Sets the thickness of the named view and then lays out the rest of the
    views.
    
    @param {SC.View} view the view to adjust. Must not be a divider.
    @param {Number} offset the new desired offset
    @returns the actual allowed offset
  */
  setThicknessForView: function(view, thickness) {
    if (view.get('parentNode') != this) {
      throw "view must belong to reciever (view: %@)".fmt(view);
    }

    var direction = this.get('layoutDirection') ;
    
    // constrain to thickness set on view.
    var max = view.get('maxThickness') ;
    var min = view.get('minThickness') ;
    if (max != null) thickness = Math.min(max, thickness) ; 
    if (min != null) thickness = Math.max(min, thickness) ;
    
    // constrain to thickness determined by delegate.
    thickness = this.invokeDelegateMethod(this.delegate, 'splitViewConstrainThickness', this, view, thickness) ;
    
    // thickness cannot be greater than the total of all the other views (
    // except for the flexibleView) added together.
  
    // available = total minus thickness of all views except "view" and 
    // "flexible view" that is the same as thickness 'view' plus thickness 
    // 'flexible view'
    var flexibleView = this.get('flexibleView');
    var available = this.thicknessForView(view) +   
        this.thicknessForView(flexibleView);
  
    thickness = Math.min(thickness, available) ;
    
    // cannot be less than 0
    thickness = Math.max(0, thickness) ;
    
    // now apply constrained value
    if (thickness != this.thicknessForView(view)) {
      
      // un-collapse if needed.
      view.set('isCollapsed', (thickness <= 0)) ;
      
      // set new frame
      var f = (direction === SC.HORIZONTAL) ? { width: thickness } : { height: thickness } ;
      view.set('frame', f) ;
      
      // and layout
      this.layout() ;
    }
    
  },

  /**
    Returns the thickness for a given view.
    
    @param {SC.View} view the view to get.
    @returns the view with the width.
  */
  thicknessForView: function(view) {
    var direction = this.get('layoutDirection') ;
    var ret = view.get('frame') ;
    return (direction === SC.HORIZONTAL) ? ret.width : ret.height ; 
  },
  
  /**
    Finds the flexible view.
    
    This will use the flexibleView property if you set it or use the center
    most view that is not a divider.
  */
  computeFlexibleView: function() {
    var flexibleView = this.get('flexibleView') ;
    var originalFlexibleView = flexibleView ;
    if (!flexibleView) {
      var views = this.get('childNodes') ;
      flexibleView = views[Math.ceil(views.length/2)] ;
    }
    
    // If the flexible view is a divider, find the first non-g.
    while(flexibleView && (flexibleView instanceof SC.SplitDividerView)) {
      flexibleView = flexibleView.get('nextSibling') ;
    }
    
    // save new flexible view if we had to fix it up.
    if (originalFlexibleView !== flexibleView) {
      this.set('flexibleView', flexibleView);
    }
    
    return flexibleView;
  }, 
  
  /**
    Layout the views.
    
    This method needs to be called anytime you change the view thicknesses
    to make sure they are arranged properly.  This will setup the views so
    that they can resize appropriately.
  */
  layout: function() {

    var views = this.get('childNodes') ;
    
    // find the flexible view, if it is not set.  
    var flexibleView = this.computeFlexibleView();

    // everything before the flexible view is anchored to the left/top
    var direction = this.get('layoutDirection') ;
    var view = views[0];
    var offset = 0 ;
    while(view && (view !== flexibleView)) {
      var isCollapsed = view.get('isCollapsed') || NO ;
      view.setIfChanged('isVisible', !isCollapsed) ;
      if (!isCollapsed) {
        view.viewFrameWillChange() ;
        if (direction == SC.HORIZONTAL) {
          view.setIfChanged('styleLeft', offset) ;
          view.setIfChanged('styleRight', null) ;
        } else {
          view.setIfChanged('styleTop', offset) ;
          view.setIfChanged('styleBottom', null) ;
        }
        view.viewFrameDidChange() ;

        offset += this.thicknessForView(view) ;
      }
      view = view.get('nextSibling') ;
    }

    var flexHead = offset ;
    
    // everything after the flexible view is anchored to the right/bottom.
    var view = views.last() ;
    var offset = 0;
    while(view && (view !== flexibleView)) {
      var isCollapsed = view.get('isCollapsed') || NO ;
      view.setIfChanged('isVisible', !isCollapsed) ;
      if (!isCollapsed) {
        view.viewFrameWillChange() ;
        if (direction == SC.HORIZONTAL) {
          view.setIfChanged('styleLeft', null) ;
          view.setIfChanged('styleRight', offset) ;
        } else {
          view.setIfChanged('styleTop', null) ;
          view.setIfChanged('styleBottom', offset) ;
        }
        view.viewFrameDidChange() ;

        offset += this.thicknessForView(view) ;
      }
      view = view.get('previousSibling') ;
    }
    
    var flexTail = offset ;
    
    if (flexibleView) {
      view = flexibleView ;
      view.viewFrameWillChange() ;
      if (direction == SC.HORIZONTAL) {
        view.setIfChanged('styleLeft', flexHead) ;
        view.setIfChanged('styleRight', flexTail) ;
        view.setIfChanged('styleWidth', null) ;
      } else {
        view.setIfChanged('styleTop', flexHead) ;
        view.setIfChanged('styleBottom', flexTail) ;
        view.setIfChanged('styleHeight', null) ;
      }
      view.viewFrameDidChange() ;
    }
    
  },

  /**
    (DELEGATE) Control whether a view can be collapsed.
    
    The default implemention returns YES.
    
    @param {SC.SplitView} splitView the split view
    @param {SC.View} view the view we want to collapse.
    @returns {Boolean} YES to allow collapse.
  */
  splitViewCanCollapse: function(splitView, view) { return YES; },

  /**
    (DELEGATE) Constrain a views allowed thickness.
    
    The default implementation allows any thickness.  The view will
    automatically constrain the view to not allow views to overflow the 
    visible area.
    
    @param {SC.SplitView} splitView the split view
    @param {SC.View} view the view in question
    @param {Number} proposedThickness the proposed thickness.
    @returns the allowed thickness
  */
  splitViewConstrainThickness: function(splitView, view, proposedThickness) {
    return proposedThickness;
  },
  
  /** @private */
  init: function() {
    sc_super() ;
    this.addClassName(this.get('layoutDirection')) ;
  }
  
  
}) ;


