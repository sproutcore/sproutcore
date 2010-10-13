// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Theme
  @since SproutCore 1.1
*/
SC.EmptyTheme = SC.BaseTheme.extend({
  classNames: ["sc-empty"]
});

SC.Theme.register("sc-empty", SC.EmptyTheme);
