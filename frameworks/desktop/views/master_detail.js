// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  Master/Detail view is a simple view which manages a master view and a detail view.
  This is not all that different from a SplitView, except that, for the moment (this
  will hopefully change when SplitView becomes more palatable) the split point is not 
  actually changeable and the split is always vertical.
  
  So, why use it when it is limited? Well, simple: it can hide the left side. Completely.
  As in, there will be no split divider anymore. There will be no nothing. It will be gone.
  Removed from DOM. Gone on to meet its maker, bereft of life, it rests in peace. If it weren't
  for the possibility of opening it up in a picker it would be pushing up the daisies!
  
  Yes, it has a built-in option for opening the master portion in a PickerPane. This is THE KILLER
  FEATURES. It is a command on the view: popupMasterPicker. And it is really really easy to call:
  make a toolbar button with an action "popupMasterPicker". That's it.
  
  An interesting feature is that it sets the master and detail views' masterIsVisible settings,
  allowing them to know if the master is visible.
  
  @since SproutCore 1.2
*/
require("views/workspace");
require("views/toolbar");

SC.VERTICAL_ORIENTATION = "vertical";
SC.HORIZONTAL_ORIENTATION = "horizontal";

SC.MasterDetailView = SC.View.extend({
  classNames: ["sc-master-detail-view"],
  
  /**
    The master view. For your development pleasure, it defaults to a
    WorkspaceView with a top toolbar.
  */
  masterView: SC.WorkspaceView.extend({
    topToolbar: SC.ToolbarView.extend({
    }),
    contentView: SC.View.extend({ backgroundColor: "white" })
  }),
  
  /**
    The detail view. For your development experience, it defaults to holding
    a top toolbar view with a button that closes/shows master. Come take a peek at
    the code to see what it looks like--it is so simple.
  */
  detailView: SC.WorkspaceView.extend({
    topToolbar: SC.ToolbarView.extend({
      childViews: "showHidePicker".w(),
      showHidePicker: SC.ButtonView.extend({
        layout: { left: 7, centerY: 0, height: 30, width: 100 },
        controlSize: SC.AUTO_CONTROL_SIZE,
        title: "Picker",
        action: "toggleMasterPicker",
        isVisible: NO,
        isVisibleBinding: ".parentView.masterIsHidden"
      })
    })
  }),
  
  /**
    Whether to automatically hide the master panel in portrait orientation. 
    
    By default, this property is a computed property based on whether the browser is a touch
    browser. Your purpose in overriding it is either to disable it from automatically
    disappearing on iPad and other touch devices, or force it to appear when a desktop
    browser changes.
  */
  autoHideMaster: function() {
    if (SC.platform.touch) return YES;
    return NO;
  }.property().cacheable(),
  
  /**
    The width of the master view.
    @default 250
  */
  masterWidth: 250,
  
  /**
    A property (computed) that says whether the master view is hidden.
  */
  masterIsHidden: function() {
    if (!this.get("autoHideMaster")) return NO;
    if (this.get("orientation") === SC.HORIZONTAL_ORIENTATION) return NO;
    return YES;
  }.property("autoHideMaster", "orientation"),
  
  /**
    Tracks the orientation of the view.
  */
  orientation: SC.VERTICAL_ORIENTATION,
  
  _scmd_frameDidChange: function() {
    var f = this.get("frame"), ret;
    if (f.width > f.height) ret = SC.HORIZONTAL_ORIENTATION;
    else ret = SC.VERTICAL_ORIENTATION;
    
    this.setIfChanged('orientation', ret);
  }.observes('frame'),
  
  // have to calculate the initial orientation when added to parent at
  // startup (frame doesn't invalidate in this case)
  init: function() {
    sc_super();
    this._scmd_frameDidChange();
    this._scmd_masterIsHiddenDidChange();
  },
  
  /**
    If the master is hidden, this toggles the master picker pane.
    
    Of course, since pickers are modal, this actually only needs to handle showing.
  */
  toggleMasterPicker: function(view) {
    if (!this.get("masterIsHidden")) return;
    if (this._picker && this._picker.get("isVisibleInWindow")) {
      this.hideMasterPicker();
    } else {
      this.showMasterPicker(view);
    }
  },
  
  showMasterPicker: function(view) {
    if (this._picker && this._picker.get("isVisibleInWindow")) return;
    if (!this._picker) {
      var pp = this.get("pickerPane");
      this._picker = pp.create({ });
    }
    
    this._picker.set("contentView", this.get("masterView"));
    this._picker.set("extraRightOffset", this.get("pointerDistanceFromEdge"));
    
    this.showPicker(this._picker, view);
  },
  
  hideMasterPicker: function() {
    if (this._picker && this._picker.get("isVisibleInWindow")) {
      this.hidePicker(this._picker);
    }
  },
  
  showPicker: function(p, view) {
    p.popup(view, SC.PICKER_POINTER, [3, 0, 1, 2, 3], [9, -9, -18, 18]);
  },
  
  hidePicker: function(p) {
    p.remove();
  },
  
  /**
    The picker pane class from which to create a picker pane.
    
    This defaults to one with a special theme.
  */
  pickerPane: SC.PickerPane.extend({
    layout: { width: 250, height: 480 },
    themeName: 'popover'
  }),
  
  /// INTERNAL CODE. HERE, THERE BE MONSTERS!
  _picker: null,
  pointerDistanceFromEdge: 46,
  
  
  renderDelegateName: 'masterDetailRenderDelegate',
  
  /**
    @private
    Updates masterIsHidden in child views.
  */
  _scmd_masterIsHiddenDidChange: function() {
    var mih = this.get("masterIsHidden");
    this.get("masterView").set("masterIsHidden", mih);
    this.get("detailView").set("masterIsHidden", mih);
  }.observes("masterIsHidden"),
  
  /**
    @private
    When the frame changes, we don't need to do anything. We use smart positioning.
    However, if the orientation were to change, well, then we might need to do something.
  */
  _scmd_orientationDidChange: function() {
    this.invokeOnce("_scmd_tile");
  }.observes("orientation"),
  
  /**
    Observes properties which require retiling.
  */
  _scmd_retileProperties: function() {
    this.invokeOnce("_scmd_tile");
  }.observes("masterIsHidden", "masterWidth"),
  
  /**
    Creates the child views. Specifically, instantiates master and detail views.
  */
  createChildViews: function() {
    var master = this.get("masterView");
    master = this.masterView = this.createChildView(master);

    var detail = this.get("detailView");
    detail = this.detailView = this.createChildView(detail);
    this.appendChild(detail);

    this.invokeOnce("_scmd_tile");
  },
  
  _masterIsDrawn: NO, // whether the master is in the view
  /**
    @private
    Tiles the views as necessary.
  */
  _scmd_tile: function() {
    // first, determine what is and is not visible.
    var masterIsVisible = !this.get('masterIsHidden');
    
    // now, tile
    var masterWidth = this.get('masterWidth'),
        master = this.get('masterView'),
        detail = this.get('detailView');
    
    if (masterIsVisible) {
      // hide picker if needed
      this.hideMasterPicker();
      
      // draw master if needed
      if (!this._masterIsDrawn) {
        if (this._picker) this._picker.set('contentView', null);
        this.appendChild(master);
        this._masterIsDrawn = YES;
      }
      
      // set master layout
      master.set('layout', {
        left: 0, top: 0, bottom: 0, width: masterWidth
      });
      
      // and child, naturally
      var extra = this.getThemedProperty('dividerWidth', 'MASTER_DETAIL_DIVIDER_WIDTH');
      detail.set("layout", { left: masterWidth + extra, right: 0, top: 0, bottom: 0 });
    } else {
      // remove master if needed
      if (this._masterIsDrawn) {
        this.removeChild(master);
        this._masterIsDrawn = NO;
      }
      
      // and child, naturally
      detail.set('layout', { left: 0, right: 0, top: 0, bottom: 0 });
    }
  }
});
