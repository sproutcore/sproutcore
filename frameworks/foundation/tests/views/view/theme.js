// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok */

module("SC.View#themes");

var t1 = SC.Theme.register("sc-test-1", SC.BaseTheme.extend({classNames: ["test-1"]}));
var t2 = SC.Theme.register("sc-test-2", SC.BaseTheme.extend({classNames: ["test-2"]}));

test("changing themes propagates to child view.", function() {
  var view = SC.View.create({
    "childViews": "child".w(),
    theme: "sc-test-1",
    child: SC.View.extend({
      
    })
  });
  
  ok(t1 === view.get("theme"), "view's theme should be sc-test-1");
  ok(t1 === view.child.get("theme"), "view's child's theme should be sc-test-1");
  view.updateTheme('sc-test-2');
  ok(t2 === view.get("theme"), "view's theme should be sc-test-2");
  ok(t2 === view.child.get("theme"), "view's child's theme should be sc-test-2");
});

test("adding child to parent propagates theme to child view.", function() {
  var child = SC.View.create({});
  var view = SC.View.create({
    theme: "sc-test-1"
  });
  
  ok(t1 === view.get("theme"), "view's theme should be sc-test-1");
  equals(child.get("theme"), SC.Theme.find("sc-base"), "view's child's theme should start at base theme");
  view.appendChild(child);
  equals(t1, child.get("theme"), "view's child's theme should be sc-test-1");
});
