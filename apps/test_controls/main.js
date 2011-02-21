// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestControls */

TestControls.main = function main() {
  TestControls.getPath('mainPage.mainPane').append() ;
  TestControls.categoriesController.set("content", TestControls.rootCategory);
} ;

function main() { TestControls.main(); }
