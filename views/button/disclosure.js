// ==========================================================================
// SC.CheckboxView
// ==========================================================================

require('views/button');

/** @class

  Disclosure triangle button.

  @extends SC.ButtonView
  @author    Charles Jolley 
  @version 1.0
*/
SC.DisclosureView = SC.ButtonView.extend(
/** @scope SC.DisclosureView.prototype */ {

  emptyElement: '<a href="javascript:;" class="sc-disclosure-view sc-button-view button disclosure"><img src="%@" class="button" /><span class="label"></span></a>'.fmt(static_url('blank')),
  
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

  valueBindingDefault: SC.Binding.Bool,
  
  _updateDisclosureState: function() {
    var value = this.get('value') ;
    var openValue = this.get('toggleOnValue') ;
    var isOpened = value == openValue ;
    this.setClassName('opened', isOpened) ;
    this.setClassName('closed', !isOpened) ;
  }.observes('value'),
  
  init: function() {
    arguments.callee.base.apply(this,arguments) ;
    this._updateDisclosureState() ;
  }
  
}) ;
