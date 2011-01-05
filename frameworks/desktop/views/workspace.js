// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  WorkspaceView manages a content view and two optional toolbars (top and bottom).
  You want to use WorkspaceView in one of two situations: iPhone apps where the toolbars
  need to change size automatically based on orientation (this does that, isn't that
  handy!) and iPad apps where you would like the masterIsHidden property to pass through.
  
  @since SproutCore 1.2
*/

require("views/toolbar");

SC.VERTICAL_ORIENTATION = "vertical";
SC.HORIZONTAL_ORIENTATION = "horizontal";

SC.WorkspaceView = SC.View.extend({
  classNames: ["sc-workspace-view"],
  /**
    The top toolbar. This defaults to an empty toolbar.
  */
  topToolbar: SC.ToolbarView.extend(),
  
  /**
    The bottom toolbar. Defaults to null (no toolbar).
  */
  bottomToolbar: null,
  
  /**
    The content. Must NOT be null. Defaults to an empty view.
  */
  contentView: SC.View.extend(),
  
  /**
    Whether to automatically resize toolbars.
    
    By default, this property is NO. If you want to automatically resize like iPhone
    apps should, set to YES.
  */
  autoResizeToolbars: NO,
  
  /**
    The default toolbar size. The default is 44, as that looks
    great on higher-resolution devices.
    
    TODO: move into a renderer or something.
  */
  defaultToolbarSize: 44,
  
  /**
    The large toolbar size.
  */
  largeToolbarSize: 44,
  
  /**
    The small toolbar size.
  */
  smallToolbarSize: 30,
  
  /**
    A property (computed) that says what size the toolbars are.
  */
  toolbarSize: function() {
    if (!this.get("autoResizeToolbars")) return this.get("defaultToolbarSize");
    if (this.get("orientation") === SC.HORIZONTAL_ORIENTATION) return this.get("smallToolbarSize");
    return this.get("largeToolbarSize");
  }.property("autoHideMaster", "orientation"),
  
  /**
    Tracks the orientation of the view. Is a computed property. Property, people, not a method.
  */
  orientation: function() {
    var f = this.get("frame");
    if (f.width > f.height) return SC.HORIZONTAL_ORIENTATION;
    else return SC.VERTICAL_ORIENTATION;
  }.property("frame").cacheable(),
  
  /**
    Thees property es passed throo too make eet zeemple for zee toolbar buttonz
    to hide and show theemselves.
  */
  masterIsHidden: NO,
  
  masterIsHiddenDidChange: function() {
    var t, mih = this.get("masterIsHidden");
    if (t = this.get("topToolbar")) t.set("masterIsHidden", mih);
    if (t = this.get("bottomToolbar")) t.set("masterIsHidden", mih);
  }.observes("masterIsHidden"),
  
  /// INTERNAL CODE. HERE, THERE BE MONSTERS!
  
  /**
    @private
    Whenever something that affects the tiling changes (for now, just toolbarSize, but if
    we allow dynamic changing of toolbars in future, this could include toolbars themselves),
    we need to update the tiling.
  */
  _scmd_tilePropertyDidChange: function() {
    this.invokeOnce("_scws_tile");
  }.observes("toolbarSize"),
  
  /**
    Creates the child views. Specifically, instantiates master and detail views.
  */
  createChildViews: function() {
    sc_super();
    
    var topToolbar = this.get("topToolbar");
    if (topToolbar) {
      topToolbar = this.topToolbar = this.activeTopToolbar = this.createChildView(topToolbar);
      this.appendChild(topToolbar); 
    }
    
    var bottomToolbar = this.get("bottomToolbar");
    if (bottomToolbar) {
      bottomToolbar = this.bottomToolbar = this.activeBottomToolbar = this.createChildView(bottomToolbar);
      this.appendChild(bottomToolbar); 
    }
    
    var content = this.get("contentView");
    content = this.contentView = this.activeContentView = this.createChildView(content);
    this.appendChild(content); 
    
    this.invokeOnce("_scws_tile");
  },
  
  /**
    @private
    Tiles the views as necessary.
  */
  _scws_tile: function() {
    var contentTop = 0, contentBottom = 0, 
        topToolbar = this.get("topToolbar"),
        bottomToolbar = this.get("bottomToolbar"),
        content = this.get("contentView"),
        toolbarSize = this.get("toolbarSize");
      
      // basically, if there is a top toolbar, we position it and change contentTop.
    if (topToolbar) {
      topToolbar.set("layout", {
        left: 0, right: 0, top: 0, height: toolbarSize
      });
      contentTop += toolbarSize;
    }
    
    // same for bottom
    if (bottomToolbar) {
      bottomToolbar.set("layout", {
        left: 0, right: 0, bottom: 0, height: toolbarSize
      });
      contentBottom += toolbarSize;
    }
    
    // finally, position content
    this.contentView.set("layout", {
      left: 0, right: 0, top: contentTop, bottom: contentBottom
    });
  },
  
  /**
    Returns YES if a top toolbar is present.
  */
  hasTopToolbar: function() {
    if (this.get("topToolbar")) return YES;
    return NO;    
  }.property("topToolbar").cacheable(),
  
  /**
    Returns YES if a bottom toolbar is present.
  */
  hasBottomToolbar: function() {
    if (this.get("bottomToolbar")) return YES;
    return NO;
  }.property("bottomToolbar").cacheable(),
  
  /**
    Called by the individual toolbar/contentView observers at runloop end when the toolbars change.
  */
  childDidChange: function() {
    this._scws_tile();
  },
  
  /**
    For subclassing, this is the currently displaying top toolbar.
  */
  activeTopToolbar: null,
  
  /**
    For subclassing, this is the currently displaying bottom toolbar.
  */
  activeBottomToolbar: null,
  
  /**
    For subclassing, this is the currently displaying content view.
  */
  activeContentView: null,
  
  /**
    Called when the top toolbar changes. It appends it, removes any old ones, and calls toolbarsDidChange. 
    
    You may want to override this if, for instance, you want to add transitions of some sort (should be trivial).
  */
  topToolbarDidChange: function() {
    var active = this.activeTopToolbar, replacement = this.get("topToolbar");
    if (active) {
      this.removeChild(active);
    }
    if (replacement) {
      this.appendChild(replacement);
    }
    
    this.activeTopToolbar = replacement;
    this.invokeLast("childDidChange");
  }.observes("topToolbar"),
  
  bottomToolbarDidChange: function() {
    var active = this.activeBottomToolbar, replacement = this.get("bottomToolbar");
    if (active) {
      this.removeChild(active);
    }
    if (replacement) {
      this.appendChild(replacement);
    }
    
    this.activeBottomToolbar = replacement;
    this.invokeLast("childDidChange");
  }.observes("bottomToolbar"),
  
  contentViewDidChange: function() {
    var active = this.activeContentView, replacement = this.get("contentView");
    if (active) {
      this.removeChild(active);
    }
    if (replacement) {
      this.appendChild(replacement);
    }
    
    this.activeContentView = replacement;
    this.invokeLast("childDidChange");
  }.observes("contentView"),
  
  
  displayProperties: "hasTopToolbar hasBottomToolbar".w(),
  
  renderDelegateName: 'workspaceRenderDelegate'
});
