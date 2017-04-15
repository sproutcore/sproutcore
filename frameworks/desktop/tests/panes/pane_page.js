// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

module('SC.Pane-SC.Page') ;

test("isVisible changes should update views that are instantiated in a page", function() {
  var page = SC.Page.design({

    inspector: SC.PickerPane.design({
      layout: { width: 300, height: 300, centerX: 0 },
      contentView: SC.View.extend({
        layout: { top: 0, left: 0, bottom: 0, right: 0 },
        childViews: ['labelView'],

        labelView: SC.LabelView.extend({
          layout: { centerY: -10, height: 24, left: 0, right: 0 },
          value: "PrefPane"
        })
      })
    })

  });

  /*
    The behavior for isVisible has changed since in 1.10 view statecharts were introduced
    and now setting isVisible on a detached view has no effect, while it
    previously effectively attempted to hide the view by adding the sc-hidden class.
    
    bottom line: setting isVisible now only works on attached views.
  */
  var pp = page.get('inspector');
  pp.childViews[0].childViews[0].set('isVisible', NO);
  pp.append();
  SC.RunLoop.begin().end();
  var res = pp.childViews[0].childViews[0].$().hasClass('sc-hidden');
  ok(res, "isVisible works when a view is attached");
  
  pp.childViews[0].childViews[0].set('isVisible', YES);
  pp.append();
  SC.RunLoop.begin().end();
  res = pp.childViews[0].childViews[0].$().hasClass('sc-hidden');
  ok(!res, "isVisible (reverse) works when a view is attached");
  
  pp.remove();
  SC.RunLoop.begin().end();
  pp.childViews[0].childViews[0].set('isVisible', NO);
  SC.RunLoop.begin().end();
  pp.append();
  SC.RunLoop.begin().end();
  res = pp.childViews[0].childViews[0].$().hasClass('sc-hidden');
  ok(!res, "isVisible has no effect while a view is detached");

  pp.remove();

  page.destroy();
});
