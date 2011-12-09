// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

var itemList = [{ title: "Red", value: "red", enabled: YES }, { title: "Green", value: "green" }, { title: "Blue", value: "blue" }],
itemList2 = [{ title: "Cyan", value: "cyan", enabled: YES }, { title: "Magenta", value: "magenta" }, { title: "Yellow", value: "yellow" },{ title: "blacK", value: "black"}],
itemList3 = [{ title: "Red", value: "red", enabled: YES, width: 30 }, { title: "Green", value: "green", width: 50 }, { title: "Blue", value: "blue", width: 40 }];

var pane = SC.ControlTestPane.design()
  .add("basic", SC.RadioView, {
    value: "",
    isEnabled: YES,
    items: itemList,
    itemTitleKey: 'title',
    itemValueKey: 'value',
    layoutDirection: SC.LAYOUT_HORIZONTAL
  })
  
  .add("checked", SC.RadioView, {
    value: "red",
    isEnabled: YES,
    items: itemList,
    itemTitleKey: 'title',
    itemValueKey: 'value',
    layoutDirection: SC.LAYOUT_HORIZONTAL
  })
  
  .add("disabled", SC.RadioView, {
    value: "",
    isEnabled: NO,
    items: itemList,
    itemTitleKey: 'title',
    itemValueKey: 'value',
    layoutDirection: SC.LAYOUT_HORIZONTAL
  })
  
  .add("enabled first", SC.RadioView, {
    value: "",
    isEnabled: YES,
    items: itemList,
    itemTitleKey: 'title',
    itemValueKey: 'value',
    itemIsEnabledKey: 'enabled',
    layoutDirection: SC.LAYOUT_HORIZONTAL
  })
  
  .add("horizontal", SC.RadioView, {
    value: "",
    isEnabled: YES,
    items: 'Yes No'.w(),
    // LAYOUT_VERTICAL is default
    layoutDirection: SC.LAYOUT_HORIZONTAL
  })
  
  .add("horizontal widths", SC.RadioView, {
    value: "",
    isEnabled: YES,
    items: itemList3,
    layoutDirection: SC.LAYOUT_HORIZONTAL,
    itemTitleKey: 'title',
    itemValueKey: 'value',
    itemWidthKey: 'width'
  });

pane.show(); // add a test to show the test pane

pane.verifyButtons = function verifyButtons(view, items) {
  var radioButtons = view.$('.sc-radio-button');
  equals(radioButtons.length, items.length, 'number of radio buttons should be %@'.fmt(items.length));
  
  var i = 0;
  radioButtons.forEach(function(radioInput) {
    var theInput = SC.$(radioInput),
      idx = parseInt(theInput.attr('index'),0),
      buttonValue = theInput.attr('value');
    
    equals(idx, i, 'radio button #%@ should have field value %@'.fmt(idx, i));
    
    equals(theInput.attr('aria-checked'), 'false', 'radio button #%@ should not be checked'.fmt(idx));
    ok(!theInput.hasClass('disabled'), 'radio button #%@ should not be disabled'.fmt(idx));
    
    i++;
  });
};

pane.verifyLabels = function verifyLabels(view, items) {
  var labels = view.$('span.sc-button-label');
  equals(labels.length, items.length, 'number of labels should be %@'.fmt(items.length));
  
  var idx = 0;
  labels.forEach(function(label) {
    equals(label.innerHTML, items[idx].title, 'radio button #%@ should have original label'.fmt(idx));
    idx++;
  });
};

// ..........................................................
// TEST VIEWS
// 
module('SC.RadioView UI');

test("basic", function() {
  
  var view = pane.view('basic');
  
  ok(!view.$().hasClass('disabled'), 'should not have disabled class');
  pane.verifyButtons(view, itemList);
  pane.verifyLabels(view, itemList);
  
  // Modify the items array in place
  itemList.replace(0, {title: "Hue", value: "hue", enabled: YES });
  itemList.replace(1, { title: "Saturation", value: "saturation" });
  itemList.replace(2, { title: "Brightness", value: "brightness"});
  
  // Allow the radio view a chance to update
  SC.RunLoop.begin().end();
  
  pane.verifyButtons(view, itemList);
  pane.verifyLabels(view, itemList);
  
  // Swap out the items array
  view.set('items', itemList2);
  
  // Allow the radio view a chance to update
  SC.RunLoop.begin().end();
  
  pane.verifyButtons(view, itemList2);
  pane.verifyLabels(view, itemList2);
  
  // Reset the items array before moving on
  itemList.replace(0, { title: "Red", value: "red", enabled: YES });
  itemList.replace(1, { title: "Green", value: "green" });
  itemList.replace(2, { title: "Blue", value: "blue" });
});


test("checked", function() {
  var view = pane.view('checked');
  
  ok(!view.$().hasClass('disabled'), 'should not have disabled class');
  
  var radioButtons = view.$('.sc-radio-button');
  equals(radioButtons.length, 3, 'number of radio buttons should be 3');
  
  var i = 0;
  radioButtons.forEach(function(radioInput) {
    var theInput = SC.$(radioInput),
        idx = parseInt(theInput.attr('index'),0),
        buttonValue = theInput.attr('value');
    
    equals(idx, i, 'radio button #%@ should have field value %@'.fmt(idx, i));
    if(idx===0) {
      equals(theInput.attr('aria-checked'), 'true', 'radio button #%@ should be checked'.fmt(idx));
    } else {
      equals(theInput.attr('aria-checked'), 'false', 'radio button #%@ should not be checked'.fmt(idx));
    }
    
    ok(!theInput.hasClass('disabled'), 'radio button #%@ should not be disabled'.fmt(idx));
    i++;
  });
  
  var labels = view.$('span.sc-button-label');
  equals(labels.length, 3, 'number of labels should be 3');
  
  var idx = 0;
  labels.forEach(function(label) {
    equals(label.innerHTML, itemList[idx].title, 'radio button #%@ should have original label'.fmt(idx));
    idx++;
  });
  
});

test("disabled", function() {
  var view = pane.view('disabled');
  
  ok(view.$().hasClass('disabled'), 'should have disabled class');
  
  var radioButtons = view.$('.sc-radio-button');
  equals(radioButtons.length, 3, 'number of radio buttons should be 3');
  
  var i = 0;
  radioButtons.forEach(function(radioInput) {
    var theInput = SC.$(radioInput),
      idx = parseInt(theInput.attr('index'),0),
      buttonValue = theInput.attr('value');
    
    equals(idx, i, 'radio button #%@ should have field value %@'.fmt(idx, i));
    equals(theInput.attr('aria-checked'), 'false', 'radio button #%@ should not be checked'.fmt(idx));
    ok(!theInput.hasClass('disabled'), 'radio button #%@ should be disabled'.fmt(idx));
    i++;
  });
  
  var labels = view.$('span.sc-button-label');
  equals(labels.length, 3, 'number of labels should be 3');
  
  var idx = 0;
  labels.forEach(function(label) {
    equals(label.innerHTML, itemList[idx].title, 'radio button #%@ should have original label'.fmt(idx));
    idx++;
  });
  
});

test("enabled first", function() {
  var view = pane.view('enabled first');
  
  ok(!view.$().hasClass('disabled'), 'should not have disabled class');
  
  var radioButtons = view.$('.sc-radio-button');
  equals(radioButtons.length, 3, 'number of radio buttons should be 3');
  SC.RunLoop.begin();
  view.set('isEnabled', NO);
  SC.RunLoop.end();
  var i = 0;
  radioButtons.forEach(function(radioInput) {
    var theInput = SC.$(radioInput),
      idx = parseInt(theInput.attr('index'),0),
      buttonValue = theInput.attr('value');
      
    equals(idx, i, 'radio button #%@ should have field value %@'.fmt(idx, i));
    ok(theInput.attr('aria-checked'), 'false', 'radio button #%@ should not be checked'.fmt(idx));
    i++;
  });
  
  ok(view.$().hasClass('disabled'), 'should have disabled class');
  
  var labels = view.$('span.sc-button-label');
  equals(labels.length, 3, 'number of labels should be 3');
  
  var idx = 0;
  labels.forEach(function(label) {
    equals(label.innerHTML, itemList[idx].title, 'radio button #%@ should have original label'.fmt(idx));
    idx++;
  });
});

test("item widths", function() {
  var radioButtons = pane.view('horizontal widths').$('.sc-radio-button'),
      widths = [30, 50, 40],
      idx = 0, radio;
  
  radioButtons.forEach(function(elem) {
    equals(SC.$(elem).width(), widths[idx], 'radio button %@ should width specified by itemWidthKey'.fmt(idx, widths[idx]));
    idx++;
  });
});
