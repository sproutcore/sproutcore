// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok */

var Ace, Dark, Capsule, DarkCapsule, AceOnly;

module("SC.Theme", {
  setup: function() {
    // make and register Ace
    Ace = SC.Theme.extend({
      "classNames": ["ace"]
    });
    SC.Theme.register("ace", Ace);
    
    // Dark
    Dark = Ace.subtheme("dark", "dark");
    
    // Capsule
    Capsule = Ace.subtheme("capsule", "capsule");
    
    // Dark Capsule
    DarkCapsule = Dark.subtheme("capsule", "dark-capsule");
    
    // Ace Only
    AceOnly = Ace.subtheme("aceOnly", "ace-only");
  },
  
  teardown: function() {
    
  }
});

// use this utility to check themes. We put baseClass and classNames
// separate just in case the baseClass itself is wrong (a worst-case scenario test)
function themeIs(themeInstance, baseClass, classNames) {
  ok(themeInstance, "theme exists");
  if (!themeInstance) return;
  
  ok(themeInstance.themeClass === baseClass, "check that themeClass is correct");
  
  var isOk = themeInstance.classNames.length == classNames.length;
  if (isOk) {
    for (var idx = 0; idx < themeInstance.classNames.length; idx++) {
      if (!themeInstance.classNames[idx] == classNames[idx]) isOk = NO;
    }
  }
  ok(isOk, "Class names should match: expected: " + classNames + "; result: " + themeInstance.classNames);
}

test("Calling SC.Theme.find finds proper theme.", function(){
  var ace = SC.Theme.find("ace");
  themeIs(ace, Ace, ["ace"]);
});

test("There is no proliferation of theme registration (that is, subthemes are not registered globally)", function(){
  var dark = SC.Theme.find("dark");
  ok(!dark, "Theme should not be found.");
});

test("Calling find on a subtheme class finds proper theme.", function(){
  var dark = Ace.find("dark");
  themeIs(dark, Dark, ["ace", "dark"]);
});

test("Calling find on a theme instance finds proper theme.", function(){
  var ace = SC.Theme.find("ace");
  var dark = ace.find("dark");
  themeIs(dark, Dark, ["ace", "dark"]);
});

test("Calling find on a subtheme instance finds the proper theme.", function(){
  var dark = Ace.find("dark");
  var capsule = dark.find("capsule");
  themeIs(capsule, DarkCapsule, ["ace", "dark", "dark-capsule"]);
});

test("Calling find on a subtheme instance will find themes in base themes.", function() {
  var dark = Ace.find("dark");
  var aceOnly = dark.find("aceOnly");
  themeIs(aceOnly, AceOnly, ["ace", "ace-only"]);
});
