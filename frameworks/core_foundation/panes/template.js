// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  SC.TemplatePane is a helper that will create a new pane based on
  a single root TemplateView.

  function main() {
    MyApp.mainPane = SC.TemplatePane.append({
      layerId: 'my-root-id',
      templateName: 'app'
    })
  }
*/
SC.TemplatePane = SC.Object.extend({});

SC.mixin(SC.TemplatePane, {
  append: function(attrs) {
    var pane = SC.MainPane.extend({
      childViews: ['contentView'],

      contentView: SC.TemplateView.design(attrs),

      touchStart: function(touch) {
        touch.allowDefault();
      },

      touchesDragged: function(evt, touches) {
        evt.allowDefault();
      },

      touchEnd: function(touch) {
        touch.allowDefault();
      }
    });

    return pane.create().append();
  }
});
