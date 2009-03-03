// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  Disclosure triangle button.

  @extends SC.ButtonView
  @since SproutCore
*/
SC.DisclosureView = SC.ButtonView.extend(
/** @scope SC.DisclosureView.prototype */ {

  classNames: 'sc-disclosure-view',
  
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

  valueBindingDefault: SC.Binding.bool() ,

  render: function(context, firstTime) {
    var blank = static_url('blank');
    context.push('<img src="', blank, '" class="button" alt="" />');
    context.push('<label>',this.get('displayTitle'),'</label>');
  }
 
}) ;
