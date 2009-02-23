// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same htmlbody Q$ */

var pane, view ;
module("SC.Checkbox", {
  setup: function() {
    SC.RunLoop.begin();
    pane = SC.MainPane.create({
      childViews: [
        SC.CheckboxView.extend({
          layout: { right: 20, bottom: 20, width: 100, height: 23 },
          title: "First Name",
          value: YES 
        })]
    });
    pane.append(); // make sure there is a layer...
    SC.RunLoop.end();
    
    view = pane.childViews[0];
  }, 
  
  teardown: function() {
    pane.remove();
    pane = view = null ;
  }
});

test("renders an input tag with appropriate attributes", function() {
  equals(view.get('value'), YES, 'precon - value should be YES');

  var q = Q$('input', view.get('layer'));
  equals(q.attr('type'), 'checkbox', 'should have type=checkbox');
  equals(q.attr('name'), SC.guidFor(view), 'should have name=view_guid');
  equals(q.attr('checked'), YES, 'should be checked');
});

test("should have span with title inside", function() {
  var q = Q$('span', view.get('layer'));
  ok(view.get('displayTitle').length>0, 'precond - display title should not be empty');
  equals(q.text(), view.get('displayTitle'), 'should have display title');
});

test("changing the title should update the span", function() {
  var oldDisplayTitle = view.get('displayTitle');
  SC.RunLoop.begin();
  view.set('title', 'Last Name');
  SC.RunLoop.end();

  ok(view.get('displayTitle') !== oldDisplayTitle, 'precond - should have changed display title');

  var q = Q$('span', view.get('layer'));
  equals(q.text(), view.get('displayTitle'), 'should have display title');
});

