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

  emptyElement: '<a href="javascript:;" class="sc-disclosure-view sc-button-view sc-view button disclosure"><img src="%@" class="button" /><span class="sc-button-label label"></span></a>'.fmt(static_url('blank')),
  
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

  valueBindingDefault: SC.Binding.bool(),
  
  init: function() {
    sc_super() ;
    this.set('isSelected', this.get('value') === this.get('toggleOnValue'));
  }
  
}) ;
