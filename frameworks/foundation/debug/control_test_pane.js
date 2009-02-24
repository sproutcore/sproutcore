// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/pane');

/*global test */

/** @class
  Generates a pane that will display vertically stacked views for testing.
  You can use this class in test mode to easily create a palette with views
  configured in different ways.
  
  h1. Example
  
  {{{
    var pane = SC.ControlTestPane.design()
      .add('basic', SC.CheckboxView.design({ title: "Hello World" }))
      .add('disabled', SC.CheckboxView.design({
        title: "Hello World", isEnabled: NO
      }));
      
    module("CheckboxView UI", pane);
    
    test("basic", function() {
      var view = pane.view('basic');
      ok(view.get('isEnabled'), 'should be enabled');
    });
  }}}
  
  @extends SC.Pane
  @since SproutCore 1.0
*/
SC.ControlTestPane = SC.Pane.extend(
/** @scope SC.ControlTestPane.prototype */ {
  
  classNames: ['sc-control-test-pane'],
  layout: { right: 20, width: 480, top: 75, bottom: 20 },

  /**
    The starting top location for the first row.  This will increment as 
    views are added to the pane.
  */
  top:       0,
  
  /**
    The default height of each row.  This will be used for a view unless you
    manually specify a height in the view's layout.
  */
  height:    20,
  
  /**
    The default padding added to the edges and between each row.
  */
  padding:   4,

  /**
    Retrieves the test sample view that was added with the passed key name.
    
    @param {String} keyName the key used to register the view.
    @returns {SC.View} view instance
  */
  view: function(keyName) { 
    var idx = this._views[keyName];
    if (!idx) throw "SC.ControlTestPane does not have a view named %@".fmt(keyName);
    return this.childViews[idx].childViews[0]; 
  },
  
  init: function() {
    sc_super();
    if (!this._views) this._views = {};
    this.append(); // auto-add to screen
  }
});

/**
  Adds a test view to the control pane design.  The passed label will be used
  as the key which you can use to find the view layer.  You can either pass
  a view that is already designed or pass an array of attributes that will be
  used to create a design on the view.
  
  @param {String} label the view key name
  @param {SC.View} view a view class or view design
  @param {Hash} attrs optional attrs to use when designing the view
  @returns {SC.ControlTestPane} receiver
*/
SC.ControlTestPane.add = function(label, view, attrs) {
  if (attrs === undefined) attrs = {};
  if (!view.isDesign) view = view.design(attrs);

  // compute layout.
  var padding = this.prototype.padding, height = this.prototype.height;
  var top = this.prototype.top + padding, layout;
  
  this.prototype.top = top + height; // make room
  
  // calculate labelView and add it
  layout = { left: padding, width: 150, top: top, height: height };
  var labelView = SC.LabelView.design({
    value: label + ':', layout: layout, textAlign: SC.ALIGN_RIGHT, fontWeight: SC.BOLD_WEIGHT 
  });
  this.childView(labelView);
  
  // now layout view itself...
  var wrapper = SC.View.design({
    classNames: ['wrapper'],
    layout: { left: 150+padding*2, top: top, right: padding, height: height },
    childViews: [view]
  });
  var idx = this.prototype.childViews.length ;
  this.childView(wrapper);
  
  var views = this.prototype._views;
  if (!views) views = this.prototype._views = {};
  views[label] = idx ;
  
  return this;
};

/**
  Returns a standard setup/teardown object for use by the module() method.
*/
SC.ControlTestPane.standardSetup = function() {
  var pane = this ;
  return {
    setup: function() { pane._pane = pane.create(); },
    teardown: function() {
      if (pane._pane) pane._pane.remove();
      pane._pane = null ;
    }
  } ;
};

/**
  Convenience method.  Returns the view with the given name on the current
  pane instance if there is one.
*/
SC.ControlTestPane.view = function(viewKey) {
  if (!this._pane) throw "view() cannot be called on a class";
  return this._pane.view(viewKey);
};

/**
  Registers a final test that will instantiate the control test pane and 
  display it.  This allows the developer to interact with the controls once
  the test has completed.
*/
SC.ControlTestPane.show = function() {
  var pane = this ;
  test("show control test pane", function() { pane.create(); });
};

