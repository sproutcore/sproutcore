// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/split_divider');

SC.RESIZE_BOTH = 'resize-both';
SC.RESIZE_TOP_LEFT = 'resize-top-left';
SC.RESIZE_BOTTOM_RIGHT = 'resize-bottom-right';

/**
  @class
  
  A split view is used to show views that the user can resize or collapse.
  To use a split view you need to set a topLeftView, a bottomRightView and,
  optionally, a splitDividerView.  You can also set various other properties
  to control the minimum and maximum thickness allowed for the flexible views.
  
  h2. Example
  
  {{{
    SC.SplitView.design({
      
      // the left view...
      topLeftView: SC.View.design({
        // view contents
      }),
      
      // the right view
      bottomRightView: SC.View.design({
        // view contents
      })
      
    })
  }}}
  
  When the user clicks and drags on a split divider view, it will
  automatically resize the views immediately before and after the split
  divider view. You can constrain the resizing allowed by the split view
  either by setting a minThickness and maxThickness property on the views
  themselves or by implementing the method splitViewConstrainThickness on
  a delegate object.
  
  In addition to resizing views, users can also collapse views by double
  clicking on a split divider view.  When a view is collapsed, it's isVisible
  property is set to NO and its space it removed from the view.  Double
  clicking on a divider again will restore a collapsed view.  A user can also
  start to drag the divider to show the collapsed view.
  
  You can programmatically control collapsing behavior using various 
  properties on either the split view or its child views, and/or by 
  implementing the method splitViewCanCollapse on a delegate object.
  
  Finally, SplitViews can layout their child views either horizontally or
  vertically.  To choose the direction of layout set the layoutDirection
  property on the view (or the :direction option with the view helper).
  This property should be set when the view is created. Changing it
  dynamically will have an unknown effect.
  
  In addition, the top/left and bottom/right child views can have these
  properties:
  
  @extends SC.View
  @since SproutCore 1.0
  
  @author Charles Jolley
  @author Lawrence Pit
  @author Erich Ocean
*/
SC.SplitView = SC.View.extend(
/** @scope SC.SplitView.prototype */ {
  
  classNames: ['sc-split-view'],
  
  displayProperties: ['layoutDirection'],
  
  /**
    delegate for controlling split view behavior.
  */
  delegate: null,
  
  /**
    Direction of layout.  Must be SC.LAYOUT_HORIZONTAL or SC.LAYOUT_VERTICAL.
    
    @property {String}
    @default SC.LAYOUT_HORIZONTAL
  */
  layoutDirection: SC.LAYOUT_HORIZONTAL,
  
  /**
    Set to NO to disable collapsing for all views.
    
    @property {Boolean}
    @default YES
  */
  canCollapseViews: YES,
  
  /*
    Configure which view(s) you want to autoresize when this split view's 
    layout changes.  Possible options are:
    
    | SC.RESIZE_BOTTOM_RIGHT | (default) resizes bottomRightView |
    | SC.RESIZE_TOP_LEFT | resized topLeftView |
    
    @property {String}
    @default SC.RESIZE_BOTTOM_RIGHT
  */
  autoresizeBehavior: SC.RESIZE_BOTTOM_RIGHT,
  
  /**
    Specifies how much space the fixed view should use when the view is setup.
    A number less than one will be treated as a percentage, while a number 
    greater than one will be treated as a pixel width.
    
    The thickness will be applied to the opposite view defined by 
    autoresizeBehavior.
    
    @property {Number}
    @default 0.5
  */
  defaultThickness: 0.5,

  /**
    Sets minimum thickness of topLeft view.

    @property {Number}
    @default null
  */
  topLeftMinThickness: null,

  /**
    Sets maximum thickness of topLeft view.

    @property {Number}
    @default null
  */
  topLeftMaxThickness: null,

  /**
    Sets minimum thickness of bottomRight view.

    @property {Number}
    @default null
  */
  bottomRightMinThickness: null,

  /**
    Sets maximum thickness of bottomRight view.

    @property {Number}
    @default null
  */
  bottomRightMaxThickness: null,

  /**
    Sets thickness of divider.

    @property {Number}
    @default null
  */
  dividerThickness: null,
 
  /**
    Yes, we're a split view.
    
    @property {Boolean}
    @default YES
  */
  isSplitView: YES,
  
  /**
    The view to use for the top left
    
    @property {SC.View}
    @default SC.View
  */
  topLeftView: SC.View,

  /**
    The view to use for the divider
    
    @property {SC.View}
    @default SC.SplitDividerView
  */
  dividerView: SC.SplitDividerView,
  
  /**
    The view to use for the bottom right
    
    @property {SC.View}
    @default SC.View
  */
  bottomRightView: SC.View,
  
  /**
    The current thickness for the topLeftView
    
    @property {Number}
    @isReadOnly
  */
  topLeftThickness: function() {
    var view = this.get('topLeftView');
    return view ? this.thicknessForView(view) : 0;
  }.property('topLeftView').cacheable(),

  /**
    The current thickness for the bottomRightView
    
    @property {Number}
    @isReadOnly
  */
  bottomRightThickness: function() {
    var view = this.get('bottomRightView');
    return view ? this.thicknessForView(view) : 0;
  }.property('bottomRightView').cacheable(),
  
  /**
    The cursor thumb views should use for themselves
    
    @property {SC.Cursor}
    @default null
  */
  thumbViewCursor: null,
  
  /**
    Used by split divider to decide if the view can be collapsed.
    
    @property {Boolean}
    @isReadOnly
  */
  canCollapseView: function(view) {
    return this.invokeDelegateMethod(this.delegate, 'splitViewCanCollapse', this, view);
  },
  
  /**
    Returns the thickness for a given view.
    
    @param {SC.View} view the view to get.
    @returns the view with the width.
  */
  thicknessForView: function(view) {
    var direction = this.get('layoutDirection'),
        ret = view.get('frame');
    return (direction === SC.LAYOUT_HORIZONTAL) ? ret.width : ret.height;
  },
  
  /**
    Creates the topLeftView/dividerView/bottomRightView and adds them to the
    childViews array
    
    @returns SC.View the SplitDivider view (this)
  */
  createChildViews: function() {
    var childViews = [],
        views = ['topLeftView', 'dividerView', 'bottomRightView'],
        l = views.length,
        view, i;
    
    for (i=0; i<l; ++i) {
      if (view = this.get(views[i])) {
        view = this[views[i]] = this.createChildView(view, {
          layoutView: this,
          rootElementPath: [i]
        });
        childViews.push(view);
      }
    }
    
    this.set('childViews', childViews);
    return this;
  },
  
  /**
    Layout the views.
    
    This method needs to be called anytime you change the view thicknesses
    to make sure they are arranged properly.  This will set up the views so
    that they can resize appropriately.
  */
  updateChildLayout: function() {
    var topLeftView = this.get('topLeftView'),
        bottomRightView = this.get('bottomRightView'),
        dividerView = this.get('dividerView'),
        autoresizeBehavior = this.get('autoresizeBehavior'),
        direction = this.get('layoutDirection'),
        frame = this.get('frame'),
        topLeftThickness = this._desiredTopLeftThickness,
        dividerThickness = this.get('dividerThickness'),
        splitViewThickness = (direction === SC.LAYOUT_HORIZONTAL) ? frame.width : frame.height,
        bottomRightThickness = splitViewThickness - dividerThickness - topLeftThickness,
        layout, isCollapsed;
    
    dividerThickness = (!SC.none(dividerThickness)) ? dividerThickness : 7;
    
    // top/left view
    isCollapsed = topLeftView.get('isCollapsed') || NO;
    topLeftView.setIfChanged('isVisible', !isCollapsed);
    layout = SC.clone(topLeftView.get('layout'));
    
    if (direction === SC.LAYOUT_HORIZONTAL) {
      layout.top = 0;
      layout.left = 0;
      layout.bottom = 0;
      
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
        case SC.RESIZE_TOP_LEFT:
          layout.right = bottomRightThickness + dividerThickness;
          delete layout.width;
          break;
        case SC.RESIZE_BOTTOM_RIGHT:
          delete layout.right;
          delete layout.height;
          layout.width = topLeftThickness;
          break;
      }
    } else {
      layout.top = 0;
      layout.left = 0;
      layout.right = 0;
      
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
        case SC.RESIZE_TOP_LEFT:
          layout.bottom = bottomRightThickness + dividerThickness;
          delete layout.height;
          break;
        case SC.RESIZE_BOTTOM_RIGHT:
          layout.height = topLeftThickness;
          delete layout.bottom;
          delete layout.width;
          break;
      }
    }
    topLeftView.set('layout', layout);
    
    // split divider view
    if (dividerView) {
      layout = SC.clone(dividerView.get('layout'));
      
      if (direction === SC.LAYOUT_HORIZONTAL) {
        layout.width = dividerThickness;
        layout.top = 0;
        layout.bottom = 0;
        delete layout.height;
        
        switch (autoresizeBehavior) {
          case SC.RESIZE_BOTH:
            throw "SC.RESIZE_BOTH is currently unsupported.";
            // delete layout.left ;
            // delete layout.right ;
            // layout.centerX = topLeftThickness + (dividerThickness / 2) ;
            // delete layout.centerY ;
            //break ;
          case SC.RESIZE_TOP_LEFT:
            layout.right = bottomRightThickness;
            delete layout.left;
            delete layout.centerX;
            delete layout.centerY;
            break;
          case SC.RESIZE_BOTTOM_RIGHT:
            layout.left = topLeftThickness;
            delete layout.right;
            delete layout.centerX;
            delete layout.centerY;
            break;
        }
      } else {
        layout.height = dividerThickness;
        layout.left = 0;
        layout.right = 0;
        delete layout.width;
        
        switch (autoresizeBehavior) {
          case SC.RESIZE_BOTH:
            throw "SC.RESIZE_BOTH is currently unsupported.";
            // delete layout.top ;
            // delete layout.bottom ;
            // delete layout.centerX ;
            // layout.centerY = topLeftThickness + (dividerThickness / 2) ;
            //break ;
          case SC.RESIZE_TOP_LEFT:
            layout.bottom = bottomRightThickness;
            delete layout.top;
            delete layout.centerX;
            delete layout.centerY;
            break ;
          case SC.RESIZE_BOTTOM_RIGHT:
            layout.top = topLeftThickness;
            delete layout.bottom;
            delete layout.centerX;
            delete layout.centerY;
            break ;
        }
      }
      dividerView.set('layout', layout);
    }
    
    // bottom/right view
    isCollapsed = bottomRightView.get('isCollapsed') || NO;
    bottomRightView.setIfChanged('isVisible', !isCollapsed);
    layout = SC.clone(bottomRightView.get('layout'));
    
    if (direction === SC.LAYOUT_HORIZONTAL) {
      layout.top = 0;
      layout.bottom = 0;
      layout.right = 0;
      
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
        case SC.RESIZE_BOTTOM_RIGHT:
          layout.left = topLeftThickness + dividerThickness;
          delete layout.width;
          break;
        case SC.RESIZE_TOP_LEFT:
          layout.width = bottomRightThickness;
          delete layout.left;
          break;
      }
    } else {
      layout.left = 0;
      layout.right = 0;
      layout.bottom = 0;
      
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
        case SC.RESIZE_BOTTOM_RIGHT:
          layout.top = topLeftThickness + dividerThickness;
          delete layout.height;
          break;
        case SC.RESIZE_TOP_LEFT:
          delete layout.top;
          layout.height = bottomRightThickness;
          break;
      }
    }
    bottomRightView.set('layout', layout);
    
    this
      .notifyPropertyChange('topLeftThickness')
      .notifyPropertyChange('bottomRightThickness');
  },
  
  /** @private */
  renderLayout: function(context, firstTime) {
    if (firstTime || this._recalculateDivider) {
      
      var layoutDirection = this.get('layoutDirection'),
          frame = this.get('frame'),
          elem = this.$(),
          desiredThickness = this.get('defaultThickness') ,
          autoResizeBehavior = this.get('autoresizeBehavior'),
          dividerThickness = this.get('dividerThickness'),
          splitViewThickness;
      
      if (!this.get('thumbViewCursor')) {
        this.set('thumbViewCursor', SC.Cursor.create());
      }
      
      dividerThickness = !SC.none(dividerThickness) ? dividerThickness : 7;
      
      // Turn a flag on to recalculate the spliting if the desired thickness
      // is a percentage
      if (this._recalculateDivider === undefined && desiredThickness < 1) {
        this._recalculateDivider = YES;
      } else if (this._recalculateDivider) {
        this._recalculateDivider = NO;
      }
      
      if (elem[0]) {
        splitViewThickness = (layoutDirection === SC.LAYOUT_HORIZONTAL) ? elem[0].offsetWidth : elem[0].offsetHeight;
      } else {
        splitViewThickness = (layoutDirection === SC.LAYOUT_HORIZONTAL) ? frame.width : frame.height;
      }
      
      // if default thickness is < 1, convert from percentage to absolute
      if (SC.none(desiredThickness) || (desiredThickness > 0 && desiredThickness < 1)) {
        desiredThickness = Math.floor((splitViewThickness - (dividerThickness)) * (desiredThickness || 0.5));
      }
      
      if (autoResizeBehavior === SC.RESIZE_BOTTOM_RIGHT) {
        this._desiredTopLeftThickness = desiredThickness;
      } else {
        this._desiredTopLeftThickness = splitViewThickness - dividerThickness - desiredThickness ;
      }
      
      // make sure we don't exceed our min and max values, and that collapse 
      // settings are respected
      // cached values are required by _updateTopLeftThickness() below...
      this._topLeftView = this.get('topLeftView');
      this._bottomRightView = this.get('bottomRightView');
      this._topLeftViewThickness = this.thicknessForView(this.get('topLeftView'));
      this._bottomRightThickness = this.thicknessForView(this.get('bottomRightView'));
      this._dividerThickness = this.get('dividerThickness');
      this._layoutDirection = this.get('layoutDirection');
      
      // this handles min-max settings and collapse parameters
      this._updateTopLeftThickness(0);
      
      // update the cursor used by thumb views
      this._setCursorStyle();
      
      // actually set layout for our child views
      this.updateChildLayout();
    }
    
    sc_super();
  },
  
  /** @private */
  render: function(context, firstTime) {
    sc_super();
    
    if (this._inLiveResize) this._setCursorStyle();
    
    if (this.get('layoutDirection') === SC.LAYOUT_HORIZONTAL) context.addClass('sc-horizontal');
    else context.addClass('sc-vertical');
  },
  
  /**
    Update the split view's layout based on mouse movement.
    
    Call this method in the mouseDown: method of your thumb view. The split view
    will begin tracking the mouse and will update its own layout to reflect the movement 
    of the mouse. As a result, the position of your thumb view will also be updated.
    
    @returns {Boolean}
  */
  mouseDownInThumbView: function(evt, thumbView) {
    var responder = this.getPath('pane.rootResponder');
    if (!responder) return NO; // nothing to do
      
    // we're not the source view of the mouseDown:, so we need to capture events manually to receive them
    responder.dragDidStart(this);
    
    // cache for later
    this._mouseDownX = evt.pageX;
    this._mouseDownY = evt.pageY;
    this._thumbView = thumbView;
    this._topLeftView = this.get('topLeftView');
    this._bottomRightView = this.get('bottomRightView');
    this._topLeftViewThickness = this.thicknessForView(this.get('topLeftView'));
    this._bottomRightThickness = this.thicknessForView(this.get('bottomRightView'));
    this._dividerThickness = this.get('dividerThickness');
    this._layoutDirection = this.get('layoutDirection');
    
    this.beginLiveResize();
    this._inLiveResize = YES;
    
    return YES;
  },
  
  mouseDragged: function(evt) {
    var offset = (this._layoutDirection === SC.LAYOUT_HORIZONTAL) ? evt.pageX - this._mouseDownX : evt.pageY - this._mouseDownY ;
    this._updateTopLeftThickness(offset);
    return YES;
  },
  
  mouseUp: function(evt) {
    if (this._inLiveResize === YES) {
    	this._thumbView = null; // avoid memory leaks
    	this._inLiveResize = NO;
    	this.endLiveResize();
    	return YES;
		}
		
		return NO;
  },
  
  touchesDragged: function(evt){
    return this.mouseDragged(evt);
  },
  
  touchEnd: function(evt){
    return this.mouseUp(evt);
  },
  
  doubleClickInThumbView: function(evt, thumbView) {
    var view = this._topLeftView,
        isCollapsed = view.get('isCollapsed') || NO;
    
    if (!isCollapsed && !this.canCollapseView(view)) {
      view = this._bottomRightView;
      isCollapsed = view.get('isCollapsed') || NO;
      if (!isCollapsed && !this.canCollapseView(view)) return NO;
    }
    
    if (!isCollapsed) {
      // remember thickness in it's uncollapsed state
      this._uncollapsedThickness = this.thicknessForView(view);
      // and collapse
      // this.setThicknessForView(view, 0) ;
      if (view === this._topLeftView) {
        this._updateTopLeftThickness(this.topLeftThickness()*-1);
      } else {
        this._updateBottomRightThickness(this.bottomRightThickness()*-1);
      }
      
      // if however the splitview decided not to collapse, clear:
      if (!view.get("isCollapsed")) {
        this._uncollapsedThickness = null;
      }
    } else {
      // uncollapse to the last thickness in it's uncollapsed state
      if (view === this._topLeftView) {
        this._updateTopLeftThickness(this._uncollapsedThickness);
      } else {
        this._updateBottomRightThickness(this._uncollapsedThickness);
      }
      view._uncollapsedThickness = null;
    }
    this._setCursorStyle();
    return true;
  },
  
  /** @private */
  _updateTopLeftThickness: function(offset) {
    var topLeftView = this._topLeftView,
        bottomRightView = this._bottomRightView,
        // the current thickness, not the original thickness
        topLeftViewThickness = this.thicknessForView(topLeftView), 
        bottomRightViewThickness = this.thicknessForView(bottomRightView),
        minAvailable = this._dividerThickness,
        maxAvailable = 0,
        proposedThickness = this._topLeftViewThickness + offset,
        direction = this._layoutDirection,
        bottomRightCanCollapse = this.canCollapseView(bottomRightView),
        thickness = proposedThickness,
        // constrain to thickness set on top/left
        max = this.get('topLeftMaxThickness'),
        min = this.get('topLeftMinThickness'),
        bottomRightThickness, tlCollapseAtThickness, brCollapseAtThickness;
    
    if (!topLeftView.get("isCollapsed")) {
      maxAvailable += topLeftViewThickness;
    }
    if (!bottomRightView.get("isCollapsed")) {
      maxAvailable += bottomRightViewThickness;
    }
    
    if (!SC.none(max)) thickness = Math.min(max, thickness);
    if (!SC.none(min)) thickness = Math.max(min, thickness);
    
    // constrain to thickness set on bottom/right
    max = this.get('bottomRightMaxThickness');
    min = this.get('bottomRightMinThickness');
    bottomRightThickness = maxAvailable - thickness;
    if (!SC.none(max)) {
      bottomRightThickness = Math.min(max, bottomRightThickness);
    }
    if (!SC.none(min)) {
      bottomRightThickness = Math.max(min, bottomRightThickness);
    }
    thickness = maxAvailable - bottomRightThickness;
    
    // constrain to thickness determined by delegate.
    thickness = this.invokeDelegateMethod(this.delegate, 
      'splitViewConstrainThickness', this, topLeftView, thickness);
    
    // cannot be more than what's available
    thickness = Math.min(thickness, maxAvailable);
    
    // cannot be less than zero
    thickness = Math.max(0, thickness);
    
    tlCollapseAtThickness = topLeftView.get('collapseAtThickness');
    if (!tlCollapseAtThickness) tlCollapseAtThickness = 0;
    brCollapseAtThickness = bottomRightView.get('collapseAtThickness');
    brCollapseAtThickness = SC.none(brCollapseAtThickness) ? maxAvailable : (maxAvailable - brCollapseAtThickness);
    
    if ((proposedThickness <= tlCollapseAtThickness) && this.canCollapseView(topLeftView)) {
      // want to collapse top/left, check if this doesn't violate the max thickness of bottom/right
      max = bottomRightView.get('maxThickness');
      if (!max || (minAvailable + maxAvailable) <= max) {
        // collapse top/left view, even if it has a minThickness
        thickness = 0;
      }
    } else if (proposedThickness >= brCollapseAtThickness && this.canCollapseView(bottomRightView)) {
      // want to collapse bottom/right, check if this doesn't violate the max thickness of top/left
      max = topLeftView.get('maxThickness');
      if (!max || (minAvailable + maxAvailable) <= max) {
        // collapse bottom/right view, even if it has a minThickness
        thickness = maxAvailable;
      }
    }
    
    // now apply constrained value
    if (thickness != this.thicknessForView(topLeftView)) {
      this._desiredTopLeftThickness = thickness;
      
      // un-collapse if needed.
      topLeftView.set('isCollapsed', thickness === 0);
      bottomRightView.set('isCollapsed', thickness >= maxAvailable);
      
      this.updateChildLayout(); // updates child layouts
      this.displayDidChange(); // updates cursor
    }
  },
  
  
  _updateBottomRightThickness: function(offset) {
    var topLeftView = this._topLeftView ,
        bottomRightView = this._bottomRightView,
        topLeftViewThickness = this.thicknessForView(topLeftView), // the current thickness, not the original thickness
        bottomRightViewThickness = this.thicknessForView(bottomRightView),
        minAvailable = this._dividerThickness,
        maxAvailable = 0,
        proposedThickness = this._topLeftViewThickness + offset,
        direction = this._layoutDirection,
        bottomRightCanCollapse = this.canCollapseView(bottomRightView),
        thickness = proposedThickness,
        // constrain to thickness set on top/left
        max = this.get('topLeftMaxThickness'),
        min = this.get('topLeftMinThickness'),
        bottomRightThickness, tlCollapseAtThickness, brCollapseAtThickness;
    
    if (!topLeftView.get("isCollapsed")) maxAvailable += topLeftViewThickness;
    if (!bottomRightView.get("isCollapsed")) maxAvailable += bottomRightViewThickness;
    
    if (!SC.none(max)) thickness = Math.min(max, thickness);
    if (!SC.none(min)) thickness = Math.max(min, thickness);
    
    // constrain to thickness set on bottom/right
    max = this.get('bottomRightMaxThickness');
    min = this.get('bottomRightMinThickness');
    bottomRightThickness = maxAvailable - thickness ;
    if (!SC.none(max)) bottomRightThickness = Math.min(max, bottomRightThickness);
    if (!SC.none(min)) bottomRightThickness = Math.max(min, bottomRightThickness);
    thickness = maxAvailable - bottomRightThickness;
    
    // constrain to thickness determined by delegate.
    thickness = this.invokeDelegateMethod(this.delegate, 'splitViewConstrainThickness', this, topLeftView, thickness);
    
    // cannot be more than what's available
    thickness = Math.min(thickness, maxAvailable);
    
    // cannot be less than zero
    thickness = Math.max(0, thickness);
    
    tlCollapseAtThickness = topLeftView.get('collapseAtThickness');
    if (!tlCollapseAtThickness) tlCollapseAtThickness = 0;
    brCollapseAtThickness = bottomRightView.get('collapseAtThickness');
    brCollapseAtThickness = SC.none(brCollapseAtThickness) ? maxAvailable : (maxAvailable - brCollapseAtThickness);
    
    if ((proposedThickness <= tlCollapseAtThickness) && this.canCollapseView(topLeftView)) {
      // want to collapse top/left, check if this doesn't violate the max thickness of bottom/right
      max = bottomRightView.get('maxThickness');
      if (!max || (minAvailable + maxAvailable) <= max) {
        // collapse top/left view, even if it has a minThickness
        thickness = 0;
      }
    } else if (proposedThickness >= brCollapseAtThickness && this.canCollapseView(bottomRightView)) {
      // want to collapse bottom/right, check if this doesn't violate the max thickness of top/left
      max = topLeftView.get('maxThickness');
      if (!max || (minAvailable + maxAvailable) <= max) {
        // collapse bottom/right view, even if it has a minThickness
        thickness = maxAvailable;
      }
    }
    
    // now apply constrained value
    if (thickness != this.thicknessForView(topLeftView)) {
      this._desiredTopLeftThickness = thickness;
      
      // un-collapse if needed.
      topLeftView.set('isCollapsed', thickness === 0);
      bottomRightView.set('isCollapsed', thickness >= maxAvailable);
      
      this.updateChildLayout(); // updates child layouts
      this.displayDidChange(); // updates cursor
    }
  },
  
  /** 
    This observes 'layoutDirection' to update the cursor style immediately
    after the value of the layoutDirection of Split view is changed

    @private 
  */
  _setCursorStyle: function() {
    var topLeftView = this._topLeftView,
        bottomRightView = this._bottomRightView,
        thumbViewCursor = this.get('thumbViewCursor'),
        // updates the cursor of the thumb view that called 
        // mouseDownInThumbView() to reflect the status of the drag
        tlThickness = this.thicknessForView(topLeftView),
        brThickness = this.thicknessForView(bottomRightView);
    this._layoutDirection = this.get('layoutDirection');
    if (topLeftView.get('isCollapsed') || 
        tlThickness === this.get("topLeftMinThickness") || 
        brThickness == this.get("bottomRightMaxThickness")) {
      thumbViewCursor.set('cursorStyle', this._layoutDirection === SC.LAYOUT_HORIZONTAL ? "e-resize" : "s-resize");
    } else if (bottomRightView.get('isCollapsed') || 
               tlThickness === this.get("topLeftMaxThickness") || 
               brThickness == this.get("bottomRightMinThickness")) {
      thumbViewCursor.set('cursorStyle', this._layoutDirection === SC.LAYOUT_HORIZONTAL ? "w-resize" : "n-resize");
    } else {
      if(SC.browser.msie) {
        thumbViewCursor.set('cursorStyle', this._layoutDirection === SC.LAYOUT_HORIZONTAL ? "e-resize" : "n-resize");
      }
      else {
        thumbViewCursor.set('cursorStyle', this._layoutDirection === SC.LAYOUT_HORIZONTAL ? "ew-resize" : "ns-resize");
      }
    }
  }.observes('layoutDirection'),
  
  /**
    (DELEGATE) Control whether a view can be collapsed.
    
    The default implemention returns NO if the split view property
    canCollapseViews is set to NO or when the given view has
    property canCollapse set to NO, otherwise it returns YES.
    
    @param {SC.SplitView} splitView the split view
    @param {SC.View} view the view we want to collapse.
    @returns {Boolean} YES to allow collapse.
  */
  splitViewCanCollapse: function(splitView, view) {
    if (splitView.get('canCollapseViews') === NO) return NO;
    if (view.get('canCollapse') === NO) return NO;
    return YES;
  },
  
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
  
  /* Force to rendering once the pane is attached */
  _forceSplitCalculation: function(){
    this.updateLayout(); 
  }.observes('*pane.isPaneAttached'),

  /**
    This method is invoked on the split view when the view resizes due to a layout
    change or due to the parent view resizing. It forces an update on topLeft and
    bottomRight thickness.

    @returns {void}
  */
  viewDidResize: function() {
    sc_super();
    this
      .notifyPropertyChange('topLeftThickness')
      .notifyPropertyChange('bottomRightThickness');
   }.observes('layout')

});

// TODO: This should be a mixin to the few classes that need it
SC.mixin(SC.View.prototype, {
  /**
    The current split view this view is embedded in (may be null).
    @property {SC.SplitView}
  */
  splitView: function() {
    var view = this ;
    while (view && !view.isSplitView) view = view.get('parentView') ;
    return view ;
  }.property('parentView').cacheable()
})

