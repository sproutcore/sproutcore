// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/*global module test equals context ok */

var Aki, Dark, Capsule, DarkCapsule, AkiOnly;

module("SC.Theme", {
  setup: function() {
    // make and register Aki
    Aki = SC.Theme.create({
      name: 'aki',
      classNames: ["aki"]
    });
    SC.Theme.addTheme(Aki);

    // Dark
    Dark = Aki.subtheme("dark");

    // Capsule
    Capsule = Aki.subtheme("capsule");
  },

  teardown: function() {

  }
});

// use this utility to check themes
function themeIs(themeInstance, shouldBe, classNames) {
  ok(themeInstance === shouldBe, "Correct theme");
  if (!themeInstance) return;

  var isOk = same(themeInstance.classNames, classNames, "Correct class names.");
}

test("Calling SC.Theme.find finds proper theme.", function(){
  var aki = SC.Theme.find("aki");
  themeIs(aki, Aki, ["aki"]);
});

test("There is no proliferation of theme registration (that is, subthemes are not registered globally)", function(){
  var dark = SC.Theme.find("dark");
  ok(!dark, "Theme should not be found.");
});

test("Calling find on a subtheme class finds proper theme.", function(){
  var dark = Aki.find("dark");

  // child themes are specialized
  themeIs(dark.baseTheme, Dark, ["aki", "dark"]);
});

test("Calling find on a theme instance finds proper theme.", function(){
  var aki = SC.Theme.find("aki");
  var dark = aki.find("dark");

  // child themes are specialized (that means derived by the parent theme)
  themeIs(dark.baseTheme, Dark, ["aki", "dark"]);
});

test("Calling find on a subtheme instance finds the proper theme.", function(){
  var dark = Aki.find("dark");
  var capsule = dark.find("capsule");

  // child themes are specialized (that is, derived by the parent)
  themeIs(capsule.baseTheme, Capsule, ["aki", "capsule"]);

  // and now we are testing said specialization
  themeIs(capsule, capsule, ["aki", "capsule", "dark"]);
});
