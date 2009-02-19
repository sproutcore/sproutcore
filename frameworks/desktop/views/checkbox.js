// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  Renders a checkbox button view specifically.
  
  This view is basically a button view preconfigured to generate the correct
  HTML and to set to use a TOGGLE_BEHAVIOR for its buttons.
  
  This view renders a simulated checkbox that can display a mixed state and 
  has other features not found in platform-native controls.  If you want to 
  use the platform native version instead, see SC.CheckboxFieldView.

  @extends SC.FieldView
  @since SproutCore 1.0
*/
SC.CheckboxView = SC.FieldView.extend(SC.Button,
  /** @scope SC.CheckboxView.prototype */ {

  // HTML design options
  emptyElement: '<%@1><img src="'+static_url('blank')+'" class="button" /><input type="checkbox" /><span class="sc-button-label"></span></%@1>',
  classNames: ['sc-checkbox-view'],
  tagName: 'label',

  // ..........................................
  // SC.FIELD SUPPORT
  //

  /** @private - return the input tag */
  $input: function() { return this.$('input'); },

  /** @private - get the checked value from the input tag.  If the value is
    unchecked and the last value set was mixed, then return mixed.  This
    allows mixed states to remain unchanged. */
  getFieldValue: function() { 
    var ret = this.$input().attr('checked'); 
    if (ret) {
      this._lastFieldValue = null; // clear last field value since it changed
      
    // possibly return mixed state if that was the last value set and the 
    // current checked value is still empty.
    } else {
      if (this._lastFieldValue === SC.MIXED_STATE) ret = SC.MIXED_STATE ;
    }
    return ret ;
  },

  /** @private - set the checked value on the input tag.  If the value is 
    mixed, treat that as unchecked and save the value.  This way the mixed 
    state can be retained.
  */
  setFieldValue: function(v) { 
    this._lastFieldValue = v; 
    this.$input().attr('checked', (v === SC.MIXED_STATE) ? NO : !!v); 
  },
  
  /** @private - Converts the field value to the toggleOnValue or mixed */
  fieldValueForObject: function(obj) {
    return this.computeIsSelectedForValue(obj) ;
  },

  /** @private - Converts the field value to the toggleOffValue.  If the
    value is MIXED_STATE, always return the current value */
  objectForFieldValue: function(v) {
    var ret = (v === SC.MIXED_STATE) ? this.get('value') : 
      (!!v) ? this.get('toggleOnValue') : this.get('toggleOffValue'); 
      return ret ;
  },
  
  // assign the current guid as a value to the input.
  prepareDisplay: function() {
    var ret = sc_super() ;
    this.$input().attr('value', SC.guidFor(this));
    return ret ;
  }
    
}) ;
