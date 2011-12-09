// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test htmlbody ok equals same stop start Q$ */

// note: need to test interaction with Validators here
// possibly move Validator support to TextFieldView specifically.
var pane, view0, view1, view2;

module("SC.DateFieldView", {
  setup: function() {
    SC.RunLoop.begin();
    pane = SC.MainPane.create({
      childViews: [
      SC.DateFieldView.extend({
        hint: 'dd/mm/yyyy',
        value: SC.DateTime.create({ day: 1, month: 1, year: 2010})
      }),
      SC.DateFieldView.extend({
        hint: 'dd/mm/yyyy hh:mm AM/PM',
        value: SC.DateTime.create({ day: 1, month: 1, year: 2010, hour: 11, minute: 20 }),
        showTime: YES,
        isEnabled: NO
      }),
      SC.DateFieldView.extend({
        hint: 'hh:mm AM/PM',
        value: SC.DateTime.create({ hour: 11, minute: 20 }),
        showDate: NO,
        showTime: YES
      })]
    });
    pane.append(); // make sure there is a layer...
    SC.RunLoop.end();

    view0 = pane.childViews[0];
    view1 = pane.childViews[1];
    view2 = pane.childViews[2];
  },

  teardown: function() {
    pane.remove();
    pane = view0 = view1 = view2 = null;
  }
});

test("renders an text field input tag with appropriate attributes",
function() {
  equals(view0.get('fieldValue'), '01/01/2010', 'Field value should be equal - Date Only');
  equals(view1.get('fieldValue'), '01/01/2010 11:20 AM', 'Field value should be equal - Date & Time');
  equals(view2.get('fieldValue'), '11:20 AM', 'Field value should be equal - Time Only');
  equals(view0.get('isEnabled'), YES, 'field enabled');
  equals(view1.get('isEnabled'), NO, 'field not enabled');
  var q = Q$('input', view0.get('layer'));
  equals(q.attr('type'), 'text', 'should have type as text');
  equals(q.attr('name'), view0.get('layerId'), 'should have name as view_layerid');
});

test("isEnabled=NO should add disabled class",
function() {
  SC.RunLoop.begin();
  view0.set('isEnabled', NO);
  SC.RunLoop.end();
  ok(view0.$().hasClass('disabled'), 'should have disabled class');
});

test("isEnabled and isEditable mapping",
function() {
  var obj = SC.DateFieldView.create();
  obj.set('isEnabled', false);
  equals(obj.get('isEditable'), false);
  obj.set('isEnabled', true);
  equals(obj.get('isEditable'), true);
});
