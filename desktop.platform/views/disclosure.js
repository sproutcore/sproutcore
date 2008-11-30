// ==========================================================================
// SC.CheckboxView
// ==========================================================================

require('views/controls/button');

/** @class

  Disclosure triangle button.

  @extends SC.ButtonView
  @since SproutCore
*/
SC.DisclosureView = SC.ButtonView.extend(
/** @scope SC.DisclosureView.prototype */ {

  emptyElement: '<%@1 role="button"><img src="'+static_url('blank')+'" alt=""/ class="button"><label class="sc-button-label"></label></%@1>',
  tagName: 'a',
  styleClass: 'sc-disclosure-view',
  
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

  valueBindingDefault: SC.Binding.bool()  
}) ;
