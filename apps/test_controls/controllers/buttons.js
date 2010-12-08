// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestControls */

TestControls.buttonsController = SC.Controller.create({
  theme: 'square',
  
  toggleable: YES,
  selected: NO,
  disabled: NO,
  'default': NO,
  
  buttonBehavior: function() {
    if (this.get('toggleable')) return SC.TOGGLE_BEHAVIOR;
    return SC.PUSH_BEHAVIOR;
  }.property('toggleable').cacheable()
});