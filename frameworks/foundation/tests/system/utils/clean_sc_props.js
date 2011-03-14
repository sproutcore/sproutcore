// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

module("Utils - Cleaning SproutCore Properties");

test("stripInternalProperties strips internal SproutCore properties", function() {
  var hash = {};
  same(hash, {}, "Hash starts empty");

  var guid = SC.guidFor(hash);

  var sameAs = {};
  sameAs[SC.guidKey] = guid;

  same(hash, sameAs, "Hash now has a guid in it");

  hash = SC.stripInternalProperties(hash);
  same(hash, {}, "Stripping made hash empty again");
});
