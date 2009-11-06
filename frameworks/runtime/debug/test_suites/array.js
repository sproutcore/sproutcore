// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

"import core";

// list of items to require...
var keys = 'base indexOf insertAt objectAt popObject pushObject rangeObserver removeAt removeObject replace shiftObject unshiftObject'.split(' ');
var loc = keys.length;
while(--loc>=0) require('debug/test_suites/array/' + keys[loc]);
