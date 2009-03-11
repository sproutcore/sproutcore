// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  Disclosure triangle button.
  
  @extends SC.ButtonView
  @since SproutCore
*/
SC.DisclosureView = SC.ButtonView.extend(
/** @scope SC.DisclosureView.prototype */ {
  
  classNames: ['sc-disclosure-view'],
  
  theme: 'disclosure',
  buttonBehavior: SC.TOGGLE_BEHAVIOR,
  
  /**
    This is the value that will be set when the disclosure triangle is toggled
    open.
  */
  toggleOnValue: YES,
  
  /**
    The value that will be set when the disclosure triangle is toggled closed.
  */
  toggleOffValue: NO,
  
  /** @private */
  valueBindingDefault: SC.Binding.bool() ,
  
  /** @private */
  render: function(context, firstTime) {
    context.push('<img src="', SC.BLANK_IMAGE_URL, '" class="button" alt="" />');
    context.push('<label>',this.get('displayTitle'),'</label>');
  }
  
});
