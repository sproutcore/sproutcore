// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  Renders a checkbox button view specifically.
  
  This view is basically a button view preconfigured to generate the correct
  HTML and to set to use a TOGGLE_BEHAVIOR for its buttons.
  
  This view renders a simulated checkbox that can display a mixed state and 
  has other features not found in platform-native controls.  
  
  @extends SC.FieldView
  @since SproutCore 1.0
*/
SC.CheckboxView = SC.FieldView.extend(SC.StaticLayout, SC.Button,
  /** @scope SC.CheckboxView.prototype */ {

  classNames: ['sc-checkbox-view'],
  tagName: 'label',

  /* Ellipsis is disabled by default to allow multiline text */
  needsEllipsis: NO,

  render: function(context, firstTime) {
    var dt, elem ;
    
    // add checkbox -- set name to view guid to separate it from others
    if (firstTime) {
      dt = this._field_currentDisplayTitle = this.get('displayTitle');

      var blank = SC.BLANK_IMAGE_URL;
      var disabled = this.get('isEnabled') ? '' : 'disabled="disabled"';
      if(SC.browser.msie) context.attr('for', SC.guidFor(this));
      context.push('<span class="button" ></span>');
      context.push('<input type="checkbox" id="%@" name="%@" %@ />'.fmt(SC.guidFor(this),SC.guidFor(this),disabled));
      if(this.get('needsEllipsis')){
        context.push('<span class="label ellipsis">', dt, '</span>');
      }else{
        context.push('<span class="label">', dt, '</span>');  
      }
      context.attr('name', SC.guidFor(this));

    // since we don't want to regenerate the contents each time 
    // actually search for and update the displayTitle.
    } else {
      
      if (elem = this.$input()[0]) {
        if (this.get('isEnabled')) elem.disabled=NO;
        else elem.disabled=YES;
        elem = null ; // avoid memory leaks
      }
      
      dt = this.get('displayTitle');
      if (dt !== this._field_currentDisplayTitle) {
        this._field_currentDisplayTitle = dt;
        this.$('span.label').text(dt);
      }
    }
  },
  
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
  
  
  didCreateLayer: function() {
    this.setFieldValue(this.get('fieldValue'));
    SC.Event.add(this.$input()[0], 'click', this, this._field_fieldValueDidChange) ;
  },
  
  willDestroyLayer: function() {
    SC.Event.remove(this.$input()[0], 'click', this, this._field_fieldValueDidChange); 
  },
  
  mouseDown: function(evt) {
    this.set('isActive', YES);
    this._field_isMouseDown = YES;
    return YES;
  }
    
}) ;
