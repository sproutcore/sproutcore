// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/pane');

SC.ControlTestPane = SC.Pane.extend({
  classNames: ['sc-control-test-pane'],
  layout: { right: 20, width: 480, top: 75, bottom: 20 },

  top:       0,
  height:    20,
  padding:   4,
  defaultLayout: { },  
  
  init: function() {
    sc_super();
    this.append(); // auto-add to screen
  }
});

SC.ControlTestPane.add = function(label, view, attrs) {
  if (attrs === undefined) attrs = {};
  if (!view.isDesign) view = view.design(attrs);

  // compute layout.
  var padding = this.prototype.padding, height = this.prototype.height;
  var top = this.prototype.top + padding, layout;
  
  this.prototype.top = top + height; // make room
  
  // calculate labelView and add it
  layout = { left: padding, width: 150, top: top, height: height };
  label = SC.LabelView.design({
    value: label + ':', layout: layout, textAlign: SC.ALIGN_RIGHT, fontWeight: SC.BOLD_WEIGHT 
  });
  this.childView(label);
  
  // now layout view itself...
  var wrapper = SC.View.design({
    layout: { left: 150+padding*2, top: top, right: padding, height: height },
    childViews: [view]
  });
  this.childView(wrapper);
  
  return this;
};
