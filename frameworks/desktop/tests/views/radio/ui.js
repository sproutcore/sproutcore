// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

var itemList = [{ title: "Red", value: "red", enabled: YES }, { title: "Green", value: "green" }, { title: "Blue", value: "blue" }];

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
  });

pane.show(); // add a test to show the test pane

// ..........................................................
// TEST VIEWS
// 
module('SC.RadioView UI');

test("basic", function() {
  
  var view = pane.view('basic');
  
  ok(!view.$().hasClass('disabled'), 'should not have disabled class');
  
  var radioButtons = view.$('input');
  equals(radioButtons.length, 3, 'number of radio buttons should be 3');
  
  var i = 0;
  radioButtons.forEach(function(radioInput) {
    var theInput = SC.$(radioInput),
      idx = parseInt(theInput.val(),0),
      buttonValue = theInput.attr('value');
    
    equals(idx, i, 'radio button #%@ should have field value %@'.fmt(idx, i));
    
    ok(!theInput.attr('checked'), 'radio button #%@ should not be checked'.fmt(idx));
    ok(!theInput.attr('disabled'), 'radio button #%@ should not be disabled'.fmt(idx));
    
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


test("checked", function() {
  var view = pane.view('checked');
  
  ok(!view.$().hasClass('disabled'), 'should not have disabled class');
  
  var radioButtons = view.$('input');
  equals(radioButtons.length, 3, 'number of radio buttons should be 3');
  
  var i = 0;
  radioButtons.forEach(function(radioInput) {
    var theInput = SC.$(radioInput),
      idx = parseInt(theInput.val(),0),
      buttonValue = theInput.attr('value');
    
    equals(idx, i, 'radio button #%@ should have field value %@'.fmt(idx, i));
    if(idx==0) {
      ok(theInput.attr('checked'), 'radio button #%@ should be checked'.fmt(idx));
    } else {
      ok(!theInput.attr('checked'), 'radio button #%@ should not be checked'.fmt(idx));
    }
    
    ok(!theInput.attr('disabled'), 'radio button #%@ should not be disabled'.fmt(idx));
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
  
  var radioButtons = view.$('input');
  equals(radioButtons.length, 3, 'number of radio buttons should be 3');
  
  var i = 0;
  radioButtons.forEach(function(radioInput) {
    var theInput = SC.$(radioInput),
      idx = parseInt(theInput.val(),0),
      buttonValue = theInput.attr('value');
    
    equals(idx, i, 'radio button #%@ should have field value %@'.fmt(idx, i));
    ok(!theInput.attr('checked'), 'radio button #%@ should not be checked'.fmt(idx));
    ok(theInput.attr('disabled'), 'radio button #%@ should be disabled'.fmt(idx));
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
  
  ok(!view.$().hasClass('disabled'), 'should have disabled class');
  
  var radioButtons = view.$('input');
  equals(radioButtons.length, 3, 'number of radio buttons should be 3');
  
  var i = 0;
  radioButtons.forEach(function(radioInput) {
    var theInput = SC.$(radioInput),
      idx = parseInt(theInput.val(),0),
      buttonValue = theInput.attr('value');
      
    equals(idx, i, 'radio button #%@ should have field value %@'.fmt(idx, i));
    ok(!theInput.attr('checked'), 'radio button #%@ should not be checked'.fmt(idx));
    if(idx==0) {
      ok(!theInput.attr('disabled'), 'radio button #%@ should not be disabled'.fmt(idx));
    } else {
      ok(theInput.attr('disabled'), 'radio button #%@ should be disabled'.fmt(idx));
    }
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

