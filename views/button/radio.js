// ==========================================================================
// SC.RadioView
// ==========================================================================

require('views/button/button');

/** @class

  Renders a radio button view.
  
  This view is basically a button view preconfigured to generate the correct
  HTML and to set to use a TOGGLE_ON_BEHAVIOR.
  
  This view renders a simulated checkbox that can display a mixed state and 
  has other features not found in platform-native controls.  If you want to 
  use the platform native version instead, see SC.RadioFieldView.

  @extends SC.ButtonView
  @author    Charles Jolley 
  @version 1.0
*/
SC.RadioView = SC.ButtonView.extend(
/** @scope SC.RadioView.prototype */ {

  emptyElement: '<a href="javascript:;" class="sc-radio-view sc-button-view button radio"><img src="%@" class="button" /><span class="label"></span></a>'.fmt(static_url('blank')),
  
  buttonBehavior: SC.TOGGLE_ON_BEHAVIOR
  
}) ;
