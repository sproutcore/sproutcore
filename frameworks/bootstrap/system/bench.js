// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global SC_benchmarkPreloadEvents*/
// sc_require("system/browser")
if (typeof SC_benchmarkPreloadEvents !== "undefined") {
  SC.benchmarkPreloadEvents = SC_benchmarkPreloadEvents;
  SC_benchmarkPreloadEvents = undefined;
} else {
  SC.benchmarkPreloadEvents = { headStart: new Date().getTime() };
}