// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// sc_require("system/browser")
if (_SC_performanceEvents) {
  SC._performanceEvents = _SC_performanceEvents;
  _SC_performanceEvents = undefined;
} else {
  SC._performanceEvents = { };
}